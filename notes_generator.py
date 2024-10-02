# This script is used to generate lecture notes for a given transcript. The notes are generated for 3 different difficulty levels: undergrad, teenagers and experts.

#Imports
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
# Load the environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
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
# generating for 3 different difficulty levels
dic = {0: "undergrad", 1: "teenagers", 2: "experts"}
# function to generate the messages for the completion
def message(i, transcript):
    if i==0:
        return [
            {
                "role": "system",
                "content": "You are an expert notes generator. You have been asked to build notes for the given transcripts.\
                    Your task is to explain the topics in detail with difficulty level for this course being undergrad. \
                    Also, try to include genuine 1-2 citations sometimes if facts have been taken from other resources. \
                    Note you must stick to the transcript while explaining the concepts."
            },
            {
                "role": "user",
                "content": f"Build notes based on the user-requested transcript. The transcript  is {transcript}. Explain the concepts for an undergrad level."
            }
        ]
    elif i==1:
        return [
            {
                "role": "system",
                "content": "You are an expert notes generator. You have been asked to build notes for the given transcripts.\
                    Your task is to explain the topics in detail with difficulty level for this course being kids/teenagers. Try to be more creative and include more\
                     examples to make the content more understandable. Also, try to include genuine 1-2 citations sometimes if facts have been taken from other resources.\
                    Note you must stick to the transcript while explaining the concepts."
            },
            {
                "role": "user",
                "content": f"Build notes based on the user-requested transcript. The transcript  is {transcript}. Explain the concepts for an kids/teen level. "  
            }
        ]
    else:
        return [
            {
                "role": "system",
                "content": "You are an expert notes generator. You have been asked to build notes for the given transcripts.\
                    Your task is to explain the topics in detail with difficulty level for this course being expert level.  Try to be more factful and include few complex\
                     terms to make the content more appealing. Also, try to include genuine 1-2 citations sometimes if facts have been taken from other resources.\
                        Note you must stick to the transcript while explaining the concepts."
            },
            {
                "role": "user",
                "content": f"Build notes based on the user-requested transcript. The transcript  is {transcript}. Explain the concepts for an expert level."  
            }
        ]
    

def lecture_notes_generator(course_name,week, transcript):
    init_dic = {}
    for i in range(3):
        # Create the model
        generation_config = {
        "temperature": 0.08,
        "top_p": 1,
        "top_k": 8,
        "max_output_tokens": 1024,
        "response_mime_type": "text/plain",
        }

        # getting the instructions for system(0) and user(1)
        instructions = message(i,transcript)

        model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        safety_settings = safety_settings,
        system_instruction = instructions[0]['content'],
        )

        chat_session = model.start_chat(
        history=[])

        response = chat_session.send_message(instructions[1]['content'])
        # print(response.text)

        init_dic[dic[i]] = response.text
    
    return init_dic