from utils import generate_image_from_image, download_imgs
from PIL import Image
import google.generativeai as genai
import json
import os
import base64
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# with open('courses_explaination.json', 'r') as file:
#     data = json.load(file)

# Create the model
generation_config = {
    "temperature": 1,
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
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings,
)

chat_session = model.start_chat(history=[])


def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
        base64_encoded = base64.b64encode(image_data).decode("utf-8")
    return base64_encoded


def get_images_and_descriptions(data):
    result = {}
    for key, value in data.items():
        level = key
        context = value
        paths = []
        links = []
        desc = []
        res = []
        if level == "undergrad":
            prompt = "Given the input string make a google search queries which can find image which is relevant to given context in the input text. Give me list of search queries with each query in new line and no two queries should have same kind of information and each query should give unique information form input text. If any example is given in input text then also use that to make google search queries along with other queries. And only give me best queries, at max give 5 queries in output and nothing else and donot number the output text just give only text and donot give any blank spaces or empty lines. Donot give any query related to book, author or References. The input text is "
            response = chat_session.send_message(prompt + context)
            original_response = response.text
            responses = response.text.split("\n")[:3]  # only 2 queries

            responses = [s.strip() for s in responses if s.strip()]
            # while(responses[-1]==''):
            #     responses=responses[:-1]
            for i in range(len(responses)):
                s = responses[i]
                if s == "":
                    continue
                while s[0] == '"':
                    s = s[1:]
                while s[-1] == '"':
                    s = s[:-1]
                # print(s)
                path, link = download_imgs(s.strip())
                try:
                    img = Image.open(path)
                    description = chat_session.send_message(
                        [
                            f"If the provided image is of or relates to {s} then provide a description of the image and if image does not convey anything then just output 0. Donot output any empty lines before or after description of image or 0, if it consist of any front page of book, author or something as such then also return 0",
                            img,
                        ]
                    )
                    description = description.text
                    if description.strip() == "0":
                        if os.path.exists(path):
                            os.remove(path)
                            continue
                except Exception as e:
                    continue
                res.append(s.strip())
                paths.append(path)
                links.append(link)
                desc.append(description)
            # pathssss = '\n'.join(paths)
            # descssss= '\n'.join(desc)
            response2 = chat_session.send_message(
                f"Given original context\n{context}\n give me markdown formatted text for the given context with identifier of image name at thier appropriate location where it make more sense in context. The name of images are \n{original_response}\n. Just give me the markdown formatted text with identifier of image name in format ![img-name] and nothing else in output."
            )
            responses2 = response2.text

            # print(paths)
            # print(links)
            # print(desc)
            for i in range(len(res)):
                responses2 = responses2.replace(
                    f"![{res[i]}]",
                    f"![Image](data:image/png;base64,{image_to_base64(paths[i])})\n\n**Figure:** {desc[i].strip()}",
                )

            result["undergrad"] = responses2
            # print(f'{key1} {key2} {key3}')

        elif level == "teenagers":
            prompt = "Extract all the examples form the input text in form of very simple sentences that can generate meaningful images using models like Stable Diffusion. For example given sentance is - \nyou're playing a game of Pac-Man, and you need to decide which direction to move to eat the pellets and avoid the ghosts, for this given sentance you have to provide me sentance like - \nPac-man moving inside maze and trying to eat pallets while avoiding ghosts\nGive each sentence in new line and do not ouput anything other than sentances not even fullstop.\nEvery output should be unique and simple and should not be similar. Input text is \n"
            response = chat_session.send_message(prompt + context)
            original_response = response.text
            responses = response.text.split("\n")[:3]  # only 2 queries
            responses = [s.strip() for s in responses if s.strip()]
            # print(responses)
            img = None
            i = 0
            res = []
            for r in responses:
                img = generate_image_from_image("Comic image of a " + r)
                print(r)
                try:
                    img.save(f"images/{r}.png")
                except Exception as e:
                    print(r, i)
                    print(e)
                    continue
                paths.append(f"images/{r}.png")
                res.append(r)
                i += 1
            # print(responses,len(responses))
            response2 = chat_session.send_message(
                f"Given original context\n{context}\n give me markdown formatted text for the given context with identifier of image name at thier appropriate location where it make more sense in context. The name of images are \n{original_response}\n. Just give me the markdown formatted text with identifier of image name in format ![img-name] and nothing else in output."
            )
            responses2 = response2.text
            # print(res)
            for i in range(len(res)):
                responses2 = responses2.replace(
                    f"![{res[i]}]",
                    f"![Image](data:image/png;base64,{image_to_base64(paths[i])})\n\n**Figure:** {res[i].strip()}",
                )

            result["teenagers"] = responses2
            # print(f'{key1} {key2} {key3}')

        elif level == "experts":
            result["experts"] = context

    return result
