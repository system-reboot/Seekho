# Description: This file contains the backend server code for the GenAI project.

# Imports
import shutil
import uvicorn
import os
import bcrypt
import json
import asyncio
import concurrent.futures
import yt_dlp as youtube_dl
import re
import mimetypes
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
from fastapi.responses import FileResponse, StreamingResponse
from fastapi import FastAPI, Query, HTTPException, Request
from typing import List
from rag_gemini import solve_the_doubt_with_rag
from pydantic import BaseModel

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


# classes 

# Define the data model for the incoming quiz data
class QuizData(BaseModel):
    course_name: str
    week: int
    quiz: dict

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


@app.post("/store_video/")
async def store_videos(
    course_name: str,
    week: int,
    topic_names: List[str] = Query(...),  # Expect multiple topic_names
    video_urls: List[str] = Query(...),  # Expect multiple video_urls
):
    # Ensure the number of topics matches the number of URLs
    if len(topic_names) != len(video_urls):
        raise HTTPException(
            status_code=400,
            detail="The number of topics and video URLs must be the same",
        )

    # Access the database
    db = db_client["genai"]
    collection = db["videos"]

    # Create the list of video data to be inserted
    video_data_list = [
        {
            "video_url": video_url,
            "week": week,
            "topic_name": topic_name,
            "course_name": course_name,
        }
        for topic_name, video_url in zip(topic_names, video_urls)
    ]

    # Insert the video data asynchronously
    await collection.insert_many(video_data_list)

    return {"message": "Videos stored successfully"}


@app.get("/get_image/")
async def get_image(image_name: str):
    image_path = os.path.join("./images", image_name)
    print(image_path)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    else:
        return {"message": "Image not found"}


@app.post("/generate_summary/")
async def weekwise_summary(course_name: str, week: int):
    db = db_client["genai"]
    collection = db["videos"]

    # Get all videos for the given course_name and week
    videos = await collection.find({"course_name": course_name, "week": week}).to_list(
        length=None
    )

    audio_files = []

    def download_audio(video):
        video_url = video["video_url"]
        topic_name = video["topic_name"]
        topic_name = re.sub(r'[\/:*?"<>|]', "_", topic_name)
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
            "verbose": False,  # Enable verbose output
            "ffmpeg_location": f"{ffmpeg_path}",  # Specify the location of FFmpeg executable
        }

        # Run youtube_dl to download the audio
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        audio_file = f"temp_audio/{topic_name}.mp3"
        return topic_name, audio_file

    # Download audio files concurrently
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {executor.submit(download_audio, video): video for video in videos}
        results = []
        for future in concurrent.futures.as_completed(futures):
            try:
                results.append(future.result())
            except Exception as e:
                print(f"Error processing video {futures[future]['video_url']}: {e}")

    # Ensure results are in the correct order
    results.sort(key=lambda x: x[0])  # Sort by topic_name

    # Transcribe audio files concurrently while preserving order
    async def transcribe_audio(topic_name, audio_file):
        transcript = transcriptor(audio_file)
        return topic_name, transcript

    # Use asyncio to run transcriptions concurrently
    transcripts = []
    tasks = [
        transcribe_audio(topic_name, audio_file) for topic_name, audio_file in results
    ]
    transcriptions = await asyncio.gather(*tasks)

    # Ensure results are in the correct order
    transcriptions.sort(key=lambda x: x[0])  # Sort by topic_name

    # Format transcripts
    transcripts = [
        f"{topic_name} : {transcript}" for topic_name, transcript in transcriptions
    ]
    transcripts = ", ".join(transcripts)

    # Collect audio files for cleanup
    audio_files = [(topic, audio) for topic, audio in results]

    # Generate lecture notes
    summary = lecture_notes_generator(course_name, week, transcripts)
    summary = get_images_and_descriptions(summary)

    # Check if course_name already exists in the summary table
    collection = db["summary"]
    existing_summary = await collection.find_one({"course_name": course_name})

    if existing_summary:
        # Update existing summary with new week:summary
        existing_summary["summary"].append({str(week): summary})
        await collection.update_one(
            {"course_name": course_name},
            {"$set": {"summary": existing_summary["summary"]}},
        )
    else:
        # Create new entry for course_name in the summary table
        new_summary = {"course_name": course_name, "summary": [{str(week): summary}]}
        await collection.insert_one(new_summary)

    # Delete the saved audio files
    for _, audio in audio_files:
        if os.path.exists(audio):
            os.remove(audio)

    return 200


@app.post("/generate_quiz")
async def quiz_generators(course_name, week):

    summary_content = ""
    db = db_client["genai"]
    collection = db["summary"]
    summary = await collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                summary_content = week_summary[str(week)]["undergrad"]
    else:
        return "Summary not found for the given course and week"

    init_dic = quiz_generator(summary_content)

    db = db_client["genai"]
    collection = db["quizzes"]
    existing_quiz = await collection.find_one({"course_name": course_name})

    if existing_quiz:
        # Update existing quiz with new week:quiz
        existing_quiz["quizzes"].append({str(week): str(init_dic)})
        await collection.update_one(
            {"course_name": course_name},
            {"$set": {"quizzes": existing_quiz["quizzes"]}},
        )
    else:
        # Create new entry for course_name in the quizzes table
        new_quiz = {"course_name": course_name, "quizzes": [{str(week): str(init_dic)}]}
        await collection.insert_one(new_quiz)

    return {"message": "Quiz saved successfully"}


@app.post("/translate/")
async def translate_text(course_name, week, level, target_language_code):
    db = db_client["genai"]
    translated_collection = db["translated"]

    # Check if the translation already exists
    existing_translation = await translated_collection.find_one(
        {
            "course_name": course_name,
            "week": week,
            "level": level,
            "target_language_code": target_language_code,
        }
    )

    if existing_translation:
        return existing_translation["translated_content"]

    collection = db["summary"]
    # Fetch the summary content
    summary = await collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                content = week_summary[str(week)][level]

    # Translate content to target language
    translated_content = translate(content, target_language_code)

    # Store the translated content in the database
    await translated_collection.insert_one(
        {
            "course_name": course_name,
            "week": week,
            "level": level,
            "target_language_code": target_language_code,
            "translated_content": translated_content,
        }
    )

    return translated_content


@app.get("/fetch_summary")
async def fetch_summary(course_name, week):
    db = db_client["genai"]
    collection = db["summary"]
    summary = await collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                return week_summary[str(week)]
    else:
        return "Summary not found for the given course and week"


@app.get("/fetch_quiz")
async def fetch_quiz(course_name, week):
    db = db_client["genai"]
    collection = db["quizzes"]
    quiz = await collection.find_one({"course_name": course_name})
    if quiz:
        for week_quiz in quiz["quizzes"]:
            if str(week) in week_quiz:
                return json.loads(week_quiz[str(week)])
    else:
        return "Quiz not found for the given course and week"
    



@app.post("/upload_quiz")
async def upload_quiz(data: QuizData):
    try:
        
        db = db_client["genai"]
        collection = db["quizzes"]
        existing_quiz = await collection.find_one({"course_name": data.course_name})

        if existing_quiz:
            updated = False
            for week_quiz in existing_quiz["quizzes"]:
                if str(data.week) in week_quiz:
                    week_quiz[str(data.week)] = json.dumps(data.quiz)
                    updated = True
                    break
            if not updated:
                # Append a new week if it doesn't exist
                existing_quiz["quizzes"].append({str(data.week): json.dumps(data.quiz)})
            await collection.update_one({"course_name": data.course_name}, {"$set": {"quizzes": existing_quiz["quizzes"]}})
        else:
            # Create a new document if no quiz exists for the course
            new_quiz = {
                "course_name": data.course_name,
                "quizzes": [{str(data.week): json.dumps(data.quiz)}]
            }
            await collection.insert_one(new_quiz)

        return {"message": "Quiz uploaded successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading quiz: {str(e)}")




@app.get("/fetch_video")
async def fetch_video(course_name, week, topic_name):
    db = db_client["genai"]
    collection = db["videos"]
    video = await collection.find_one(
        {"course_name": course_name, "week": int(week), "topic_name": topic_name}
    )
    video["_id"] = str(video["_id"])
    return video


@app.post("/solve_doubt")
async def solve_doubt(user_context, model_context, prompt,course_name,week):  
    db = db_client["genai"]
    collection = db["summary"]
    summary = await collection.find_one({"course_name": course_name})
    if summary:
        week_summary = {}
        for week_data in summary["summary"]:
            if str(week) in week_data:
                week_summary = week_data[str(week)]
                break
        if not week_summary:
            return "Summary not found for the given course and week"
        
        # Merge all summaries
        merged_summary = "\n".join([
            week_summary.get("undergrad", ""),
            week_summary.get("teenager", ""),
            week_summary.get("expert", "")
        ])
    else:
        return "Summary not found for the given course and week"
    return solve_the_doubt_with_rag(user_context, model_context, prompt,merged_summary,course_name)


@app.post("/lang_change/")
async def change_language(
    course_name: str, week: int, topic_name: str, target_language: str
):

    topic_name2 = re.sub(r"[\\/*?:\"<>|]", "", topic_name).strip()
    db = db_client["genai"]
    # Check if the video is already translated
    translated_videos_collection = db["translated_videos"]
    existing_translation = await translated_videos_collection.find_one(
        {
            "course_name": course_name,
            "week": week,
            "topic_name": topic_name2,
            "target_language": target_language,
        }
    )

    if existing_translation:
        return existing_translation["translated_audio_path"]

    collection = db["videos"]

    # Find the video
    video = await collection.find_one(
        {"course_name": course_name, "week": week, "topic_name": topic_name}
    )
    if not video:
        return {"message": "Video not found"}

    # Fetch the summary content for the given course_name and week
    summary_collection = db["summary"]
    summary = await summary_collection.find_one({"course_name": course_name})
    if summary:
        for week_summary in summary["summary"]:
            if str(week) in week_summary:
                sub_topic = week_summary[str(week)]["undergrad"]

    video_url = video["video_url"]
    topic_name=topic_name2
    video_file = f"videos/{topic_name}.mp4"
    audio_file = f"temp_audio/{topic_name}.mp3"

    ydl_opts_audio = {
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

    ydl_opts_video = {
        "format": "bestvideo+bestaudio/best",  # Download the best video and audio, fallback to best if not available
        "postprocessors": [
            {
                "key": "FFmpegVideoConvertor",  # Use FFmpeg to convert the video
                "preferedformat": "mp4",  # Set the desired output format to mp4
            }
        ],
        "outtmpl": f"videos/{topic_name}.%(ext)s",  # Save video in 'temp_audio' folder
        "verbose": True,  # Enable verbose output
        "ffmpeg_location": f"{ffmpeg_path}",  # Specify the location of FFmpeg executable
    }

    # Download audio
    with youtube_dl.YoutubeDL(ydl_opts_audio) as ydl:
        ydl.download([video_url])

    # Download video
    with youtube_dl.YoutubeDL(ydl_opts_video) as ydl:
        ydl.download([video_url])

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
        audio_file, sub_topic, target_language, video_file
    )

    # Store the translated audio path in the database
    await translated_videos_collection.insert_one(
        {
            "course_name": course_name,
            "week": week,
            "topic_name": topic_name,
            "target_language": target_language,
            "translated_audio_path": translated_audio_path,
        }
    )

    # Clean up the downloaded audio file
    if os.path.exists(audio_file):
        os.remove(audio_file)
    shutil.rmtree("chunks/" + audio_file.split("/")[1].split(".")[0] + "_chunks")

    return translated_audio_path


@app.get("/get_video/")
async def get_video(video_name: str, request: Request):
    video_path = video_name

    # Check if the video file exists
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")

    # Get the MIME type of the video (e.g., video/mp4)
    content_type, _ = mimetypes.guess_type(video_path)
    if content_type is None:
        content_type = "application/octet-stream"  # Default if unknown type

    file_size = os.path.getsize(video_path)
    range_header = request.headers.get("range")
    start = 0
    end = file_size - 1
    headers = {}

    if range_header:
        # Handle range requests
        range_value = range_header.strip().lower().replace("bytes=", "")
        start_str, end_str = range_value.split("-")
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1

        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        headers["Accept-Ranges"] = "bytes"
        headers["Content-Length"] = str(end - start + 1)

        status_code = 206  # Partial content status code
    else:
        headers["Content-Length"] = str(file_size)
        status_code = 200  # Normal status code

    def iterfile(path, start_pos=0, end_pos=None):
        with open(path, "rb") as f:
            f.seek(start_pos)
            while chunk := f.read(1024 * 1024):  # Read in 1MB chunks
                yield chunk
                if end_pos is not None and f.tell() > end_pos:
                    break

    # Streaming response with the correct content type for video
    return StreamingResponse(
        iterfile(video_path, start_pos=start, end_pos=end),
        headers=headers,
        media_type=content_type,  # Set the correct MIME type
        status_code=status_code,
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
