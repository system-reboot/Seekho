import requests
import os
from dotenv import load_dotenv
import base64
from translator import language_code
import soundfile as sf
import re

load_dotenv()

url = "https://api.sarvam.ai/text-to-speech"


# normal storing of audio
def store_audio(response_text, audio_path):
    audio_string = response_text[12:-3]
    audio_data = base64.b64decode(audio_string)

    with open(audio_path, "wb") as file:
        file.write(audio_data)


def voice_generator(
    input, target_language_code, to_store_audio=False, audio_path=None, clips=[]
):
    payload = {
        "inputs": [input],
        "target_language_code": target_language_code,
        "speaker": "arvind",
        "pitch": 0,
        "pace": 1,
        "loudness": 1.5,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v1",
    }
    headers = {
        "Content-Type": "application/json",
        "API-Subscription-Key": os.getenv("SARVAM_API_KEY"),
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    # audio in Base64 string format
    # print(response.text)
    # function to store the audio in a wav file

    # exact time difference we need
    time_difference = clips[1] - clips[0]
    temp_path = audio_path
    store_audio(response.text, temp_path)
    f = sf.SoundFile(temp_path)
    time_in_seconds = f.frames / f.samplerate
    # os.remove(temp_path)
    payload["pace"] = time_in_seconds / time_difference
    # print(payload)
    response = requests.request("POST", url, json=payload, headers=headers)
    store_audio(response.text, audio_path)


if __name__ == "__main__":
    input = "हम एक ऐसे विषय की खोज करने जा रहे हैं जो हाल ही में बहुत ध्यान आकर्षित कर रहा है, और वह है आत्म-ध्यान।"
    target_language_code = language_code("hindi")
    voice_generator(
        input, target_language_code, to_store_audio=True, audio_path="sample.wav"
    )
