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
    uvicorn main:app --reload
    ```
5. Start the frontend:
    ```bash
    npm start
    ```

## Usage

1. Provide the video content for the course.
2. Use Seekho's one-click course generation feature to automatically create the course layout, notes, and quizzes.
3. Customize the course content based on student difficulty levels.
4. Enable multilingual support with the built-in translation and voiceover features.
5. Engage students through the Socratic method-based doubt solver.

## Contributing

Feel free to contribute to the development of Seekho. Fork the repository, make changes, and submit a pull request.

