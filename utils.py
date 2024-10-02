import requests
import os
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()
API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
API_URL = "https://api-inference.huggingface.co/models/DoctorDiffusion/digital-doodle-cartoon-worstimever-artstyle-218mb-xl-lora"
headers = {"Authorization": "Bearer " + os.getenv("HF_KEY")}


def download_imgs(query):

    url = "https://www.googleapis.com/customsearch/v1"
    params = {"q": query, "key": API_KEY, "cx": SEARCH_ENGINE_ID, "searchType": "image"}
    response = requests.get(url, params=params)
    # print(response.json())
    results = response.json()["items"]
    # print(results)
    for item in results:
        # print(item['link'])
        try:
            image_data = requests.get(item["link"]).content
        except:
            image_data = None
        with open(os.path.join("images/", f"{query}.jpeg"), "wb") as f:
            f.write(image_data)
        try:
            img = Image.open(os.path.join("images/", f"{query}.jpeg"))
        except Exception as e:
            continue
        print(f"Downloaded img for {query} successfully")
        return os.path.join("images/", f"{query}.jpeg"), item["link"]


def generate_image_from_image(payload):
    print
    img = None
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        image_bytes = response.content
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        try:
            response = requests.post(API_URL, headers=headers, json=payload)
            image_bytes = response.content
            img = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            print(e)
    return img
