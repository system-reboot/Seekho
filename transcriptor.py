# Used to convert audio files to text using the Sarvam API

#Imports
import requests
import os
from dotenv import load_dotenv
import json
# Load the environment variables
load_dotenv()

url = "https://api.sarvam.ai/speech-to-text-translate"

# converts any audio file to text in english language
def transcriptor(file_name):
    data = {
        'model': 'saaras:v1'
    }

    files = {
        "file": (file_name,open(file_name,"rb"),"audio/wav")
    }

    headers = {'API-Subscription-Key':os.getenv("SARVAM_API_KEY")}

    response = requests.request("POST", url, data=data,files=files, headers=headers)
    
    return json.loads(response.text)['transcript']