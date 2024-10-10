import requests
import os
from dotenv import load_dotenv
import base64
from translator import language_code
import soundfile as sf
import re
from text_modifier import text_normalizer

load_dotenv()

url = "https://api.sarvam.ai/text-to-speech"


def extract_numbers(filename):
    # Regular expression to find all numbers in the string
    pattern = r'\d+'
    # Find all matches
    numbers = re.findall(pattern, filename)
    return numbers

# normal storing of audio
def store_audio(response_text, audio_path):
    audio_string = response_text[12:-3]
    audio_data = base64.b64decode(audio_string)

    with open(audio_path, "wb") as file:
        file.write(audio_data)

def sample_generator(audio_path, final_text):
    # exact time difference we need
    # print(audio_path)
    time_difference = int(extract_numbers(audio_path)[2]) - int(extract_numbers(audio_path)[1])
    temp_path = audio_path.split('/')[0] + '/sample.wav'
    store_audio(final_text,temp_path)
    f = sf.SoundFile(temp_path)
    time_in_seconds  = f.frames / f.samplerate
    pace = time_in_seconds/time_difference
    return pace

def voice_generator(input, target_language_code,sub_topic, to_store_audio=False,audio_path=None,for_video=False):
    payload = {
        "inputs": [input],
        "target_language_code": target_language_code,
        "speaker": "arvind",
        "pitch": 0,
        "pace": 1,
        "loudness": 1.5,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v1"
    }
    headers = {"Content-Type": "application/json", 'API-Subscription-Key':os.getenv("SARVAM_API_KEY")}

    response = requests.request("POST", url, json=payload, headers=headers)

    if not for_video:
        if to_store_audio:
            store_audio(response.text,audio_path)
    else:
        #####changes 2.0- for consistent audio pace#####
        pace = sample_generator(audio_path,response.text)
        if pace>1.4 or pace<0.6:
            # print('Pace is not in the desired range')
            # print('Pace is: ',pace)
            # print('Input is: ',input)
            if pace>1.4:
                pace_difference = pace-1.4
                normalized_input = text_normalizer(input,'decrease',pace_difference, context=sub_topic)
            else:
                pace_difference = 0.6-pace
                normalized_input = text_normalizer(input,'increase',pace_difference, context=sub_topic)
            # print('Normalized Input is: ',normalized_input)
            payload['inputs'] = [normalized_input]
            response = requests.request("POST", url, json=payload, headers=headers)
            # print(response.text)
            pace = sample_generator(audio_path,response.text)

        
        payload['pace'] = pace
        # print(payload)
        response = requests.request("POST", url, json=payload, headers=headers)
        store_audio(response.text,audio_path)


if __name__ == "__main__":
    input = "हम एक ऐसे विषय की खोज करने जा रहे हैं जो हाल ही में बहुत ध्यान आकर्षित कर रहा है, और वह है आत्म-ध्यान।"
    target_language_code = language_code("hindi")
    voice_generator(
        input, target_language_code, to_store_audio=True, audio_path="sample.wav"
    )
