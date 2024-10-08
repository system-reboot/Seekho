# This file contains the function to generate quiz based on the content provided by the user.

# Imports
from dotenv import load_dotenv
import os
import google.generativeai as genai
import re

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


# Function to generate the quiz
def quiz_generator(summary_content):
    messages = [
        {
            "role": "system",
            "content": "You are an expert quiz creator. You have been asked to build a quiz for a user-requested content. The difficulty level for this\
                      course is for an undergrad student. Quiz should be similar to the NPTEL quiz format with an average of 10 or 20 questions based on content length\
                        with each quiz being marked for 1 for correct 0 for incorrect. Questions must be MCQs and should be based on the content provided.\
                        Don't include any additional details while generating. Just the questions, options along with its answers.",
        },
        {
            "role": "user",
            "content": f"Build a quiz for the user-requested content. The content is {summary_content}.",
        },
    ]
    # Create the model
    generation_config = {
        # temperature=0.01 for repititive and error-less quiz generation
        "temperature": 0.01,
        "top_p": 0.01,
        "top_k": 1,
        "max_output_tokens": 2048,
        "response_mime_type": "text/plain",
    }
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        safety_settings=safety_settings,
        system_instruction=messages[0]["content"],
    )

    chat_session = model.start_chat(history=[])

    response = chat_session.send_message(messages[1]["content"])
    text = response.text

    # print(text)
    # regex patterns
    number_followed_by_dot_pattern = r"\d+\."

    # pre-processing the text
    question = {}
    options = {}
    answer = {}
    # store the number of questions
    ctr = 1
    text = text.split("\n\n")

    # print(text)


    for i in range(0, len(text)):
        if bool(re.search(number_followed_by_dot_pattern, text[i])):
            temp = text[i].split("\n")
            # print(temp,'-------')
            question[ctr] = temp[0].split(". ")[1].replace("*", "")
            options[ctr] = [x.replace("*", "") for x in temp[1:5]]
            if len(temp) == 6:
                answer[ctr] = temp[5].replace("*", "").split(":")[1]
            elif len(temp) == 5:
                answer[ctr] = text[i + 1].replace("*", "").split(":")[1]
                i += 1
            ctr += 1

    init_dic = {}
    init_dic["questions"] = question
    init_dic["options"] = options
    init_dic["answers"] = answer

    prompt = (
        "Given the input string, just convert it into proper JSON format output only JSON format and nothing else donot output any blank lines or spaces. The input string is: "
        + str(init_dic)
    )
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(prompt)
    # print(response.text)

    return response.text
