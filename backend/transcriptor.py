# Used to convert audio files to text using the Sarvam API

# Imports
import requests
import os
from dotenv import load_dotenv
import json
from silero_vad import load_silero_vad, read_audio, get_speech_timestamps
from pydub import AudioSegment
from concurrent.futures import ThreadPoolExecutor
import io
import time
from pydub.utils import mediainfo

# Load the environment variables
load_dotenv()
model = load_silero_vad()

url = "https://api.sarvam.ai/speech-to-text-translate"


# converts any audio file to text in english language


def transcriptor(file_name):
    data = {"model": "saaras:v1"}
    headers = {"API-Subscription-Key": os.getenv("SARVAM_API_KEY")}

    # Get the duration of the audio file
    audio_info = mediainfo(file_name)
    duration = float(audio_info['duration'])

    if duration < 180:  # 3 minutes in seconds
        with open(file_name, 'rb') as f:
            files = {"file": (file_name, f, "audio/wav")}
            response = requests.request(
                "POST", url, data=data, files=files, headers=headers
            )
            try:
                return json.loads(response.text)["transcript"]
            except:
                return ""
    else:
        wav = read_audio(file_name)
        speech_timestamps = get_speech_timestamps(wav, model)

        # Merge speech timestamps logic remains the same
        res = [
            [
                speech_timestamps[i]["start"] // 16000,
                speech_timestamps[i]["end"] // 16000,
            ]
            for i in range(len(speech_timestamps))
        ]
        merged_res = []
        current_start, current_end = res[0]

        for start, end in res[1:]:
            if end - current_start <= 120:
                current_end = end
            else:
                merged_res.append([current_start, current_end])
                current_start, current_end = start, end
        merged_res.append([current_start, current_end])
        if merged_res[-1][1] - merged_res[-1][0] < 2:
            merged_res.pop(-1)

        # In-memory processing of audio segments
        audio = AudioSegment.from_file(file_name)

        def process_segment(segment):
            segment_buffer = io.BytesIO()
            segment.export(segment_buffer, format="wav")
            segment_buffer.seek(0)

            files = {"file": ("segment.wav", segment_buffer, "audio/wav")}
            response = requests.request(
                "POST", url, data=data, files=files, headers=headers
            )

            try:
                return json.loads(response.text)["transcript"]
            except:
                return ""

        # Use ThreadPoolExecutor to process segments concurrently, with rate limiting
        results = []
        with ThreadPoolExecutor() as executor:
            segments = [audio[start * 1000 : end * 1000] for start, end in merged_res]
            for segment in segments:
                # Wait if necessary to stay within the rate limit
                time.sleep(2)  # 60 seconds / 30 requests = 2 seconds per request
                result = executor.submit(process_segment, segment)
                results.append(result)

            # Collect results
            results = [result.result() for result in results]

        return " ".join(results)
