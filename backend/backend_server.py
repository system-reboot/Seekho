# Description: This file contains the backend server code for the GenAI project.

# Imports
import uvicorn
import os
import bcrypt
import json
import yt_dlp as youtube_dl
from fastapi import FastAPI
from dotenv import load_dotenv
from transcriptor import transcriptor
from notes_generator import lecture_notes_generator
from translator import translate
from course_layout import generate_Layout
from quiz import quiz_generator
from doubt_solver import solve_the_doubt
from bson import json_util
from audio_language_translator import translating_audio_language_and_making_chunks
from imagedownloader import get_images_and_descriptions
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# App
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loading Env Variables
load_dotenv()
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
mongodb = os.getenv("DB")
ffmpeg_path = os.getenv("FFMPEG_PATH")
db_client = AsyncIOMotorClient(
    mongodb.replace("<username>", db_user).replace("<password>", db_password)
)


# Routes
# Base Route
@app.get("/")
def read_root():
    return {"Status": "Running"}


# Login Route
@app.post("/login/")
async def login(username: str, password: str, user_type: str):
    db = db_client["genai"]
    collection = db["teachers"] if user_type == "teacher" else db["users"]
    # Check if user exists
    user = await collection.find_one({"username": username})
    # Check if password is correct
    if user:
        if bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return {"message": "Login successful"}
        else:
            return {"message": "Invalid password"}
    else:
        return {"message": "User not found"}


# Signup Route
@app.post("/signup/")
async def signup(username: str, password: str, user_type: str):
    db = db_client["genai"]
    collection = db["teachers"] if user_type == "teacher" else db["users"]
    # Check if user already exists
    existing_user = await collection.find_one({"username": username}, {"_id": 1})
    # Create new user
    if existing_user:
        return {"message": "Username already taken"}

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    new_user = {"username": username, "password": hashed_password.decode("utf-8")}
    # Insert new user into MongoDB
    await collection.insert_one(new_user)
    return {"message": "User created successfully"}


# Generate Course Layout
@app.post("/generate_layout/")
async def course_layout_generator(content, context, course_name, teacher_id):
    # Generate course layout
    final_dic = generate_Layout(content, context)

    db = db_client["genai"]
    collection = db["course_layouts"]
    await collection.insert_one({course_name: final_dic, "teacher_id": teacher_id})

    return 200


@app.get("/courses/")
async def get_courses_by_teacher(teacher_id):
    db = db_client["genai"]
    collection = db["course_layouts"]
    courses = await collection.find({"teacher_id": teacher_id}).to_list()
    courses = json.loads(json_util.dumps(courses))
    return courses


@app.post("/store_videos/")
async def store_videos(course_name: str, week: int, topic_names: str, video_urls: str):
    topic_names = topic_names.split("$")
    video_urls = video_urls.split("$")

    if len(topic_names) != len(video_urls):
        return {"message": "The number of subtopics and video URLs must be the same"}

    db = db_client["genai"]
    collection = db["videos"]

    video_data_list = [
        {
            "video_url": video_url,
            "week": week,
            "topic_name": subtopic,
            "course_name": course_name,
        }
        for subtopic, video_url in zip(topic_names, video_urls)
    ]

    await collection.insert_many(video_data_list)

    return {"message": "Videos stored successfully"}


@app.post("/generate_summary/")
def weekwise_summary(course_name: str, week: int):
    db = db_client["genai"]
    collection = db["videos"]

    # Get all videos for the given course_name and week
    videos = collection.find({"course_name": course_name, "week": week})

    audio_files = []
    # Download audio files for each video
    for video in videos:
        video_url = video["video_url"]
        topic_name = video["topic_name"]
        ydl_opts = {
            "format": "bestaudio/best",
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
            "outtmpl": f"temp_audio/{topic_name}.%(ext)s",  # Save audio files with topic_name
            "verbose": True,  # Enable verbose output
            "ffmpeg_location": f"{ffmpeg_path}",  # Specify the location of FFmpeg executable
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
            audio_files.append([topic_name, f"temp_audio/{topic_name}.mp3"])

    # Transcribe audio files
    transcripts = ""
    for topic, audio in audio_files:
        text = topic + " : " + transcriptor(audio)
        transcripts = transcripts + ", " + text

    # Generate lecture notes
    summary = lecture_notes_generator(course_name, week, transcripts)
    summary = get_images_and_descriptions(summary)

    # Check if course_name already exists in the summary table
    collection = db["summary"]
    existing_summary = collection.find_one({"course_name": course_name})

    if existing_summary:
        # Update existing summary with new week:summary
        existing_summary["summary"].append({str(week): summary})
        collection.update_one(
            {"course_name": course_name},
            {"$set": {"summary": existing_summary["summary"]}},
        )
    else:
        # Create new entry for course_name in the summary table
        new_summary = {"course_name": course_name, "summary": [{str(week): summary}]}
        collection.insert_one(new_summary)

    # Delete the saved audio files
    for _, audio in audio_files:
        if os.path.exists(audio):
            os.remove(audio)

    return


@app.post("/generate_quiz")
def quiz_generators(course_name, week):

    summary_content = ""
    db = db_client["genai"]
    collection = db["summary"]
    summary = collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                summary_content = week_summary[str(week)]["undergrad"]
    else:
        return "Summary not found for the given course and week"

    init_dic = quiz_generator(summary_content)

    db = db_client["genai"]
    collection = db["quizzes"]
    existing_quiz = collection.find_one({"course_name": course_name})

    if existing_quiz:
        # Update existing quiz with new week:quiz
        existing_quiz["quizzes"].append({str(week): str(init_dic)})
        collection.update_one(
            {"course_name": course_name},
            {"$set": {"quizzes": existing_quiz["quizzes"]}},
        )
    else:
        # Create new entry for course_name in the quizzes table
        new_quiz = {"course_name": course_name, "quizzes": [{str(week): str(init_dic)}]}
        collection.insert_one(new_quiz)

    return {"message": "Quiz saved successfully"}


@app.post("/translate/")
def translate_text(course_name, week, level, target_language_code):
    db = db_client["genai"]
    collection = db["summary"]

    summary = collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                content = week_summary[str(week)][level]

    # Translate content to target language
    translated = translate(content, target_language_code)
    return translated


@app.get("/fetch_summary")
def fetch_summary(course_name, week):
    db = db_client["genai"]
    collection = db["summary"]
    summary = collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                return week_summary[str(week)]
    else:
        return "Summary not found for the given course and week"


@app.get("/fetch_quiz")
def fetch_quiz(course_name, week):
    db = db_client["genai"]
    collection = db["quizzes"]
    quiz = collection.find_one({"course_name": course_name})
    if quiz:
        for week_quiz in quiz["quizzes"]:
            if str(week) in week_quiz:
                return json.loads(week_quiz[str(week)])
    else:
        return "Quiz not found for the given course and week"


@app.get("/fetch_video")
def fetch_video(course_name, week, topic_name):
    db = db_client["genai"]
    collection = db["videos"]
    video = collection.find_one(
        {"course_name": course_name, "week": int(week), "topic_name": topic_name}
    )
    video["_id"] = str(video["_id"])
    return video


@app.post("/solve_doubt")
def solve_doubt(user_context, model_context, prompt):
    return solve_the_doubt(user_context, model_context, prompt)


@app.post("/lang_change/")
def change_language(course_name: str, week: int, topic_name: str, target_language: str):
    db = db_client["genai"]
    collection = db["videos"]

    # Find the video
    video = collection.find_one(
        {"course_name": course_name, "week": week, "topic_name": topic_name}
    )
    if not video:
        return {"message": "Video not found"}

    video_url = video["video_url"]

    # Download audio from the video
    ydl_opts = {
        "format": "bestaudio/best",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
        "outtmpl": f"temp_audio/{topic_name}.%(ext)s",  # Save audio files with topic_name
        "verbose": True,  # Enable verbose output
        "ffmpeg_location": f"{ffmpeg_path}",  # Specify the location of FFmpeg executable
    }
    audio_file = f"temp_audio/{topic_name}.mp3"
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    # Translate audio
    translated_audio_path = translating_audio_language_and_making_chunks(
        audio_file, target_language
    )

    # Clean up the downloaded audio file
    if os.path.exists(audio_file):
        os.remove(audio_file)

    return {
        "message": "Audio translated successfully",
        "audio_file": translated_audio_path,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
