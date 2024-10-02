# This script is used to solve doubts related to the topics discussed in the lecture notes.

#Imports
import os
import google.generativeai as genai
from dotenv import load_dotenv
# Load the environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# defining the generation config
generation_config = {
    "temperature": 0,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
]

normal_doubt_solver = " Your task is to engage in conversations related to doubts and answer questions. Explain scientific concepts so that they are easily understandable. Use analogies and examples that are relatable. Use humor and make the conversation both educational and interesting. Ask questions so that you can better understand the user and improve the educational experience. Suggest way that these concepts can be related to the real world with observations and experiments."
socratic_doubt_solver = "You are an expert at solving doubts. Use socratic method of doubt solving. Ask me questions that integrate ideas from these three topics. After each question that you ask, wait for my response. Then you should respond but do not tell me the answer. Instead, ask me questions and use the Socratic questioning approach to help me arrive at the answer myself."
# defining the model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    safety_settings=safety_settings,
    generation_config=generation_config,
    system_instruction=socratic_doubt_solver,
)

# function to solve the doubt
def solve_the_doubt(user_context, model_context, prompt):
    user_context = user_context.split("$D$")
    model_context = model_context.split("$D$")

    chat_session = model.start_chat(history=[])

    combined_context = list(zip(user_context, model_context))
    for user_ctx, model_ctx in combined_context:
        chat_session.history.append({"role": "user", "parts": [user_ctx]})
        chat_session.history.append({"role": "model", "parts": [model_ctx]})

    response = chat_session.send_message(prompt)
    model_response = response.text

    chat_session.history.clear()

    return {
        "model_response": model_response,
        "user_context": "$D$".join(user_context) + "$D$" + prompt,
        "model_context": "$D$".join(model_context) + "$D$" + model_response,
    }
