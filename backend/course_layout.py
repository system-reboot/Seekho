# This file contains the function to generate the course layout for the user-requested content.

# Imports
from dotenv import load_dotenv
import os
import re
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


# Function to generate the course layout
def generate_Layout(content, context):
    messages = [
        {
            "role": "system",
            "content": "You are an expert course layout creator. You have been asked to build a course layout for a user-requested content. \
                    The difficulty level for this course is for an undergrad student. Course layout should be similar to the NPTEL courses format.\
                    It should only and only contain the following sections - Description of the Course, Pre-requisites, Course layout in the form of various weeks,\
                    books and references, and the grading policy for earning certificates. Do not miss any of the mentioned 4 section that are description, course layout,\
                    references and grading policy",
        },
        {
            "role": "user",
            "content": f"Build a course layout for the user-requested content. The content is {content}. Make sure to include {context} while building the layout.",
        },
    ]
    # Create the model
    generation_config = {
        # temperature=0.05 for repititive and error-less quiz generation
        "temperature": 0.05,
        "top_p": 1,
        "top_k": 8,
        "max_output_tokens": 2048,
        "response_mime_type": "text/plain",
    }
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
        safety_settings=safety_settings,
        system_instruction=messages[0]["content"],
    )

    chat_session = model.start_chat(history=[])

    response = chat_session.send_message(messages[1]["content"])
    text = response.text

    # pre-processing the text
    init_dic = {}
    content_layout = {}
    pattern = r"Week\s\d{1}"
    text = text.replace("\n", "")
    text = text.split("**")

    # print(text)

    for i in range(1, len(text)):
        if "about the course" in text[i].lower():
            init_dic["description"] = text[i + 1]
        elif "intended audience" in text[i].lower():
            init_dic["intended_audience"] = text[i + 1]
        elif "prerequisites" in text[i].lower():
            init_dic["pre_requisites"] = text[i + 1]
        elif bool(re.search(pattern, text[i])):
            content_layout[text[i]] = text[i + 1]
            init_dic["content_layout"] = content_layout
        elif "books and references" in text[i].lower():
            for j in range(i + 1, len(text)):
                if "grading policy" in text[j].lower():
                    init_dic["references"] = "".join(text[i + 1 : j])
                    break
        elif "grading policy" in text[i].lower():
            init_dic["grading_policy"] = "".join(text[i + 1 :])

    final_dic = {content: init_dic}
    return final_dic
