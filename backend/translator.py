# This file contains the code to translate text from one language to another using the Sarvam API

# Imports
import requests
import os
from dotenv import load_dotenv
import json
import re

# Load the environment variables
load_dotenv()
url = "https://api.sarvam.ai/translate"


# function to convert the language to the respective language code
def language_code(text):
    text = text.lower()
    if text == "hindi":
        return "hi-IN"
    elif text == "telugu":
        return "te-IN"
    elif text == "tamil":
        return "ta-IN"
    elif text == "bengali":
        return "bn-IN"
    elif text == "gujarati":
        return "gu-IN"
    elif text == "kannada":
        return "kn-IN"
    elif text == "malayalam":
        return "ml-IN"
    elif text == "marathi":
        return "mr-IN"
    elif text == "odia":
        return "od-IN"
    elif text == "punjabi":
        return "pa-IN"
    elif text == "english":
        return "en-IN"
    else:
        return "Enter only one of the following languages - Hindi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, English"


# function to translate the text
def translate(input, target, source_language_code="en-IN"):
    target_language_code = language_code(target)
    payload = {
        "input": input,
        "source_language_code": source_language_code,
        "target_language_code": target_language_code,
        "speaker_gender": "Male",
        "mode": "formal",
        "model": "mayura:v1",
        "enable_preprocessing": True,
    }

    headers = {
        "Content-Type": "application/json",
        "API-Subscription-Key": os.getenv("SARVAM_API_KEY"),
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    translated_text = json.loads(response.text)["translated_text"]
    formatted_text = re.sub(r"\*\*\s*(.*?)\s*\*\*", r"  \n**\1**  \n", translated_text)
    return formatted_text
