import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "temperature": 0,
    "top_p": 0.95,
    "top_k": 4,
    "max_output_tokens": 2048,
    "response_mime_type": "text/plain",
  }

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_NONE",
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_NONE",
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_NONE",
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_NONE",
  },
]

def text_normalizer(user_input,task,pace_difference, context):

  if task == 'increase':
    if pace_difference<=0.4:
      text_modifier = f'You are an expert text modifer. Your task is to add 2-3 words to increase the length of text using context. The context of text is {context}.  Give response on the input language only.'
    else:
      text_modifier = f'You are an expert text modifer. Your task is to increase the length of text using context. The context of text is {context}. Give response on the input language only.'
  else:
    if pace_difference<=0.4:
      text_modifier = f'You are an expert text modifer. Your task is to remove 2-3 words to decrease the length of text using context. The context of text is {context}. Give response on the input language only.'
    else:
      text_modifier = f'You are an expert text modifer. Your task is to summarize text using context in 1 line. The context of text is {context}. Give response on the input language only.'

  model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=text_modifier ,
    safety_settings=safety_settings
  )

  chat_session = model.start_chat(
      history=[]
  )
      
  response = chat_session.send_message(user_input)

  model_response = response.text

  return model_response


if __name__ == "__main__":
    user_input = " यह एक फीडबैक पर आधारित लर्निंग है, जहाँ एजेंट अपने अनुभव से सीखता है और अपने कार्यों को सुधारता है। "
    pace_difference = 0.2
    # sub-topic name as context
    context = 'reinforcement learning'
    final_text = text_normalizer(user_input,'decrease',context)
    print(final_text)

    
    