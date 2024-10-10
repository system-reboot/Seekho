# Imports
import os
import google.generativeai as genai
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import Chroma
from langchain_core.documents import Document
import warnings
warnings.filterwarnings('ignore')
import shutil
# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Defining the generation config for the Gemini model
generation_config = {
    "temperature": 0,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# Choosing the socratic doubt solver context
socratic_doubt_solver = """
You are an expert at solving doubts. Use the Socratic method of doubt solving.
Ask questions that integrate ideas from multiple topics and lead the user to the answer.
After each question, wait for the user's response and continue questioning instead of providing the answer.
"""

# Define the model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    safety_settings=safety_settings,
    generation_config=generation_config,
    system_instruction=socratic_doubt_solver,
)
import uuid
# class Document:
#     def __init__(self, page_content,course_name):
#         self.page_content = page_content
#         self.metadata={'source': f'{course_name}', 'page': 0}
        # self.id = str(uuid.uuid4())

# Function to load PDF and extract context
def load_and_split(s, course_name):

    # Split the documents into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_text(s)
    docs = [Document(page_content=chunk, metadata={'source':course_name}) for chunk in texts]
    
    return docs

# Function to create a vectorstore for document retrieval
def create_vectorstore_from_docs(docs, persist_dir):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001",google_api_key=os.getenv("GEMINI_API_KEY"))

    vectorstore = Chroma.from_documents(documents=docs, embedding=embeddings, persist_directory=persist_dir)
    vectorstore.persist()
    # print(dir(vectorstore))
    return vectorstore

# RAG function to enhance doubt-solving by using context from the PDF
def solve_the_doubt_with_rag(user_context, model_context, prompt, s,course_name):
    persist_dir = os.path.join('embeddings/',course_name)
    vectorstore = None
    if not os.path.exists(persist_dir):
        os.makedirs(os.path.join('embeddings/', course_name))
        print(f"Directory created: embeddings/{course_name}")
        try:
            print(f'Started Making embedded vectorstore for {course_name}')
            docs = load_and_split(s, course_name)
            # print(docs[0])
            vectorstore = create_vectorstore_from_docs(docs, persist_dir)
            print(f'Succesfully made embedded vectorstore for {course_name}')
        except Exception as e:
            print(e)
            print(f'Vector Store cannot be made deleting file {persist_dir}')
            shutil.rmtree(persist_dir)
            print(f"Directory deleted:{persist_dir}")
            return None
    else:
        
        try:
            print(f'Using exsisting embedded vectorstore for {course_name}')
            vectorstore = Chroma(persist_directory=persist_dir,embedding_function=GoogleGenerativeAIEmbeddings(model="models/embedding-001",google_api_key=os.getenv("GEMINI_API_KEY")))
        except Exception as e:
            print(e)
            print(f'Vector Store cannot be loaded {persist_dir}')
            shutil.rmtree(persist_dir)
            print(f"Directory deleted:{persist_dir}")
            return None
    
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})
    # Retrieve the relevant context from the PDF based on the user's question
    relevant_docs = retriever.get_relevant_documents(prompt)
    retrieved_context = " ".join([doc.page_content for doc in relevant_docs])

    # Prepare the model's chat session with both user and model context
    user_context = user_context.split("$D$")
    model_context = model_context.split("$D$")
    
    chat_session = model.start_chat(history=[])

    combined_context = list(zip(user_context, model_context))
    for user_ctx, model_ctx in combined_context:
        chat_session.history.append({"role": "user", "parts": [user_ctx]})
        chat_session.history.append({"role": "model", "parts": [model_ctx]})

    # Combine retrieved context from PDF with the user's question
    enhanced_prompt = f"The context is given below \n {retrieved_context} \n If question asked below does not have answer present in above context than say that I unable to answer out of context questions, and strictly give answer from provided context only.\nThe question is: {prompt}"

    # Generate the model's response
    response = chat_session.send_message(enhanced_prompt)
    model_response = response.text

    chat_session.history.clear()

    # Return the model response along with updated contexts
    return {
        "model_response": model_response,
        "user_context": "$D$".join(user_context) + "$D$" + prompt,
        "model_context": "$D$".join(model_context) + "$D$" + model_response,
    }

# # Example usage
# u = "undergrad: **Reinforcement Learning Notes**\n\n**Introduction**\n\nReinforcement learning is a subfield of machine learning that deals with training agents to make decisions in complex, uncertain environments. This course will cover the fundamental concepts, algorithms, and techniques of reinforcement learning, with a focus on practical applications and implementation.\n\n**What is Reinforcement Learning?**\n\nReinforcement learning is a type of machine learning where an agent learns to take actions in an environment to maximize a reward signal. The agent learns through trial and error, receiving feedback in the form of rewards or penalties for its actions. The goal of reinforcement learning is to find a policy that maps states to actions, such that the cumulative reward is maximized.\n\n**Key Components of Reinforcement Learning**\n\n1. **Agent**: The agent is the decision-making entity that interacts with the environment. It can be a software program, a robot, or any other entity that can take actions.\n2. **Environment**: The environment is the external world that the agent interacts with. It can be a physical world, a virtual world, or a simulated environment.\n3. **Actions**: The actions are the decisions made by the agent to interact with the environment. They can be discrete (e.g., move left or right) or continuous (e.g., move forward by 0.5 meters).\n4. **States**: The states are the observations made by the agent about the environment. They can be visual observations (e.g., images), sensor readings (e.g., temperature), or any other type of data.\n5. **Rewards**: The rewards are the feedback received by the agent for its actions. They can be positive (e.g., +1 for reaching a goal) or negative (e.g., -1 for colliding with an obstacle).\n6. **Policy**: The policy is the mapping of states to actions that the agent uses to make decisions. It can be a deterministic policy (e.g., always move left) or a stochastic policy (e.g., move left with probability 0.7).\n\n**Types of Reinforcement Learning**\n\n1. **Episodic Reinforcement Learning**: In episodic reinforcement learning, the agent interacts with the environment for a fixed number of steps, and then the episode ends. The agent receives a reward at the end of each episode.\n2. **Continuous Reinforcement Learning**: In continuous reinforcement learning, the agent interacts with the environment for an indefinite number of steps, and the episode does not end until a termination condition is met.\n\n**Reinforcement Learning Algorithms**\n\n1. **Q-Learning**: Q-learning is a model-free reinforcement learning algorithm that learns the action-value function (Q-function) by trial and error.\n2. **SARSA**: SARSA is another model-free reinforcement learning algorithm that learns the action-value function by trial and error.\n3. **Deep Q-Networks (DQN)**: DQN is a type of Q-learning algorithm that uses a deep neural network to approximate the Q-function.\n\n**Challenges in Reinforcement Learning**\n\n1. **Exploration-Exploitation Trade-off**: The agent must balance exploration (trying new actions) and exploitation (choosing the best known action) to maximize the cumulative reward.\n2. **Partial Observability**: The agent may not have complete information about the environment, making it difficult to make decisions.\n3. **High-Dimensional State and Action Spaces**: The agent may need to deal with high-dimensional state and action spaces, making it difficult to learn a good policy.\n\n**Applications of Reinforcement Learning**\n\n1. **Robotics**: Reinforcement learning can be used to train robots to perform complex tasks, such as grasping and manipulation.\n2. **Game Playing**: Reinforcement learning can be used to train agents to play games, such as Go and Poker.\n3. **Recommendation Systems**: Reinforcement learning can be used to train recommendation systems to suggest products to users.\n\n**Conclusion**\n\nReinforcement learning is a powerful tool for training agents to make decisions in complex, uncertain environments. This course will cover the fundamental concepts, algorithms, and techniques of reinforcement learning, with a focus on practical applications and implementation.\n\n**References**\n\n* Sutton, R. S., & Barto, A. G. (2018). Reinforcement learning: An introduction. MIT Press.\n* Mnih, V., et al. (2015). Human-level control through deep reinforcement learning. Nature, 518(7540), 529-533.\n\nNote: The difficulty level of this course is undergrad, and the concepts are explained in a way that is easy to understand for students with a basic background in machine learning and programming. "
# t = "teenagers: **Reinforcement Learning Notes**\n\n**What is Reinforcement Learning?**\n\nImagine you're playing a game where you have to make decisions to get a reward. For example, you're playing a game of Pac-Man, and you need to decide which direction to move to eat the pellets and avoid the ghosts. Reinforcement learning is a way for computers to learn how to make decisions in situations like this, where the outcome is not always certain.\n\n**Key Concepts:**\n\n1. **Agent**: The agent is like the player in the game. It's the one that makes decisions and takes actions.\n2. **Environment**: The environment is like the game itself. It's the world that the agent interacts with.\n3. **Actions**: The actions are the decisions that the agent makes. For example, in Pac-Man, the actions might be moving up, down, left, or right.\n4. **Rewards**: The rewards are like the points you get for eating pellets or avoiding ghosts. They're the feedback that the agent gets for its actions.\n5. **Policy**: The policy is like the agent's strategy for making decisions. It's the set of rules that the agent follows to decide what actions to take.\n\n**How Reinforcement Learning Works:**\n\n1. **Exploration**: The agent starts by exploring the environment and trying out different actions.\n2. **Feedback**: The agent gets feedback in the form of rewards for its actions.\n3. **Learning**: The agent uses the feedback to learn which actions are best and update its policy.\n4. **Improvement**: The agent gets better and better at making decisions as it learns from its experiences.\n\n**Types of Reinforcement Learning:**\n\n1. **Episodic**: The agent learns from a series of episodes, where each episode is a separate experience.\n2. **Continuous**: The agent learns from a continuous stream of experiences.\n\n**Algorithms:**\n\n1. **Q-learning**: This algorithm is like a map that helps the agent learn which actions are best in different situations.\n2. **SARSA**: This algorithm is like a calculator that helps the agent learn from its experiences and update its policy.\n\n**Real-World Applications:**\n\n1. **Robotics**: Reinforcement learning can be used to teach robots how to perform tasks like assembly or navigation.\n2. **Game Playing**: Reinforcement learning can be used to teach computers how to play games like Go or Poker.\n3. **Recommendation Systems**: Reinforcement learning can be used to recommend products or services based on user behavior.\n\n**Example:**\n\nImagine you're building a self-driving car. The agent is the car's computer system, and the environment is the road. The actions are the decisions the car makes about which route to take or how fast to go. The rewards are the points the car gets for safely navigating the road. The policy is the car's strategy for making decisions based on its experiences.\n\n**Citation:**\n\n* Sutton, R. S., & Barto, A. G. (2018). Reinforcement learning: An introduction. MIT Press.\n\n**Difficulty Level:** 7/10\n\n**Note:** This is a basic introduction to reinforcement learning. As we progress through the course, we'll dive deeper into the concepts and explore more advanced topics."
# e = "experts: **Reinforcement Learning: A Subfield of Machine Learning**\n\n**Definition and Overview**\n\nReinforcement learning (RL) is a subfield of machine learning that involves training agents to make decisions in complex, uncertain environments (Sutton & Barto, 2018). The primary goal of RL is to enable agents to learn from their interactions with the environment and make optimal decisions to maximize a reward signal. This approach is particularly useful in situations where the environment is dynamic, and the agent must adapt to changing conditions.\n\n**Key Concepts**\n\n1. **Agent-Environment Interaction**: In RL, the agent interacts with the environment through actions, which are chosen based on the current state of the environment. The environment responds to these actions by transitioning to a new state and providing a reward signal.\n2. **Reward Signal**: The reward signal is a scalar value that indicates the desirability of an action. The agent learns to maximize the cumulative reward over time.\n3. **Markov Decision Process (MDP)**: An MDP is a mathematical framework that models the agent-environment interaction. It consists of a set of states, actions, transition probabilities, and reward functions.\n4. **Policy**: A policy is a mapping from states to actions that defines the agent's behavior. The goal is to find an optimal policy that maximizes the cumulative reward.\n5. **Value Function**: A value function estimates the expected return or cumulative reward for a given state or action. It is used to evaluate the quality of a policy.\n\n**RL Algorithms**\n\n1. **Q-Learning**: Q-learning is a model-free RL algorithm that learns to estimate the action-value function (Q-function) using trial and error.\n2. **SARSA**: SARSA is another model-free RL algorithm that learns to estimate the action-value function using temporal difference (TD) errors.\n3. **Deep Q-Networks (DQN)**: DQN is a type of Q-learning that uses a deep neural network to approximate the Q-function.\n4. **Policy Gradient Methods**: Policy gradient methods learn to optimize the policy directly by maximizing the cumulative reward.\n\n**Techniques and Applications**\n\n1. **Exploration-Exploitation Trade-off**: The agent must balance exploration (trying new actions) and exploitation (choosing the best known action) to maximize the cumulative reward.\n2. **Curriculum Learning**: Curriculum learning involves presenting the agent with a sequence of tasks or environments that increase in difficulty.\n3. **Transfer Learning**: Transfer learning involves using knowledge learned in one environment to improve performance in another environment.\n4. **Reinforcement Learning in Robotics**: RL has been applied to robotics to enable robots to learn complex tasks such as grasping and manipulation.\n\n**Challenges and Future Directions**\n\n1. **Sample Efficiency**: RL algorithms often require a large number of samples to learn effective policies.\n2. **Exploration-Exploitation Trade-off**: The agent must balance exploration and exploitation to maximize the cumulative reward.\n3. **Robustness to Noise**: RL algorithms must be robust to noise and uncertainty in the environment.\n4. **Transfer Learning**: RL algorithms must be able to transfer knowledge learned in one environment to another environment.\n\nIn conclusion, reinforcement learning is a powerful approach to training agents to make decisions in complex, uncertain environments. By understanding the key concepts, algorithms, and techniques of RL, we can develop more effective and efficient RL systems that can be applied to a wide range of applications.\n\n**References**\n\nSutton, R. S., & Barto, A. G. (2018). Reinforcement learning: An introduction. MIT Press.\n\nNote: The above notes are based on the provided transcript and are intended for an expert level audience. The content is more detailed and includes complex terms to make it appealing to experts in the field."
# s = u+' '+t+' '+e
# user_context = ""
# model_context = ""
# course_name = 'Reinforcement learning week 1'
# # prompt = "Can you explain gradient descent?"

# # response = solve_the_doubt_with_rag(user_context, model_context, prompt, pdf_path)
# while(True):
#     prompt = input('Enter your text: ')
#     response = solve_the_doubt_with_rag(user_context, model_context, prompt, s, course_name)
#     if response == None:
#         print("Problem occured")
#         continue
#     user_context = response['user_context']
#     model_context = response['model_context']
#     print("Model Response:", response["model_response"])

