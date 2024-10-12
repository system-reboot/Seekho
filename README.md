# Seekho - Gen-AI Powered NPTEL Course Creation Platform

Seekho is a generative AI-powered platform aimed at simplifying the course creation process for professors and educators. It is designed to generate course layouts, notes, quizzes, and provide doubt-solving features for students. Seekho tackles challenges such as language barriers, student engagement, and scalability with AI-driven solutions, enabling educators to focus on video-based online teaching while automating the subsidiaries of the course creation.

## Key Features

1. **Course Layout Generator**: Generates the entire course structure based on the course name and context provided by the professor.
2. **Notes Generator**: Creates notes from video transcripts in three difficulty levels—designed for undergraduates, teenagers (beginners), and experts.
3. **Quiz Generator**: Automatically generates weekly quizzes to track student progress.
4. **Concept Explanation with Animations**: Simplifies complex concepts with doodle-based animations tailored for different learning levels.
5. **Socratic Method-Based Doubt Solver**: Engages students in a healthy conversation and encourages critical thinking by resolving doubts 1:1.
6. **Content Translation**: Translates video and textual content into multiple languages and supports voiceovers, making the content accessible to a wider audience.

## Course Notes Difficulty Levels

- **Undergraduate**: Base notes with examples designed for students with the required pre-requisites.
- **Teenager**: Simplified notes with animations for beginners or those without pre-requisites.
- **Expert**: Complex notes for students with some knowledge looking to explore advanced topics.

## Technical Specifications

### Models Used

- **Gemini 1.5 Pro**: Generates notes, course layout, and quizzes.
- **Gemini 1.5 Flash**: Socratic-based doubt solver.
- **Sarvam Mayura v1**: Content translation (textual and video data).
- **Sarvam Bulbul v1**: Voiceover generation for textual content.
- **Sarvam Saaras v1**: Video transcript generator.
- **Hugging Face digital-doodle-cartoon-worstimever-artstyle-218mb-xl-lora**: Creates doodle-based animations.
- **Silero VAD (Voice Activity Detection)**: Synchronizes audio for videos in different languages.

### Tech Stack

- **Frontend**: React Native (platform-independent, available on web and mobile).
- **Backend**: FastAPI (deployed on Google Cloud Platform).
- **Database**: MongoDB.
- **Additional**: Google Search Engine for downloading images used in the content.

![image](https://github.com/user-attachments/assets/f8442f44-56ac-474e-9e8a-cfed044c921d)
![image](https://github.com/user-attachments/assets/485adda9-e1a4-421e-ac7f-d31675146cff)
![image](https://github.com/user-attachments/assets/e8beeea2-a26b-4bce-bdeb-12f47ff7a036)
![image](https://github.com/user-attachments/assets/4bfcba7d-dd4b-4bfb-a79e-a498bf9544e1)
![image](https://github.com/user-attachments/assets/03e8a319-f773-495f-89ca-4ee0b33a49e9)
![image](https://github.com/user-attachments/assets/50596ada-e35d-43ae-898b-0c3c8a8cde9e)
![image](https://github.com/user-attachments/assets/b2c1c87e-c4d5-4955-bbd6-30981e47a84c)
![image](https://github.com/user-attachments/assets/f504e6aa-28d8-466f-b2e3-b4a0786aaa83)
![image](https://github.com/user-attachments/assets/38e00d3d-cb5b-4c9b-8985-58f1fd7347a4)
![image](https://github.com/user-attachments/assets/ff20ceca-bbbe-4903-95a0-94b889d4366c)
![image](https://github.com/user-attachments/assets/b5bccb63-4eee-420c-a08f-82cf9f8f7083)


## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/seekho.git
    ```
2. Install dependencies:
    ```bash
    cd seekho
    pip install -r requirements.txt
    npm install
    ```
3. Set up environment variables for Google Cloud and MongoDB.

4. Run the backend:
    ```bash
    uvicorn backend_server:app --reload
    ```
5. Start the frontend:
    ```bash
    npx expo start
    ```

## Usage

1. Provide the video content for the course.
2. Use Seekho's one-click course generation feature to automatically create the course layout, notes, and quizzes.
3. Customize the course content based on student difficulty levels.
4. Enable multilingual support with built-in translation and voiceover features.
5. Engage students through the Socratic method-based doubt solver.

## Challenges

1. Exact Lip synchronization between audio of varied languages.

## Contributing

Feel free to contribute to the development of Seekho. Fork the repository, make changes, and submit a pull request.

[![Hits](https://hits.sh/github.com/system-reboot/Seekho.svg?label=Visitors'%20Count)](https://hits.sh/github.com/system-reboot/Seekho/)

