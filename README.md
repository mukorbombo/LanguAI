# LinguaAI

LinguaAI is a full-stack, AI-powered language learning application that provides personalized learning experiences through a comprehensive suite of interactive tools. It features dedicated portals for students to practice and for administrators to monitor progress.

## Features

### 🎓 Student Portal
A rich, interactive dashboard tailored for language learners:
- **Reading Lab**: Personalized reading exercises tailored to the student's proficiency level (e.g., A1 Beginner).
- **Writing Studio**: Interactive writing tasks with instant feedback on accuracy.
- **Speaking Gym**: Conversational practice powered by an AI tutor that listens and responds contextually.
- **Listening Dojo**: Audio-based exercises where students transcribe what they hear.
- **Vocabulary Forge**: Flashcard-style vocabulary review with spaced repetition (Easy/Hard grading).
- **Shadow Mode**: An advanced listening and speaking exercise where students shadow (repeat) native pronunciation.

### 👑 Admin Portal
A comprehensive dashboard for instructors and administrators:
- **Progress Tracking**: Monitor active students, CEFR progress, and average learning streaks.
- **XP Leaderboard**: Visualizes the top-performing students and their current streaks using Recharts.
- **Live Activity**: Real-time tracking of student milestones and achievements.

### 🤖 AI Tutor Engine
- Powered by Google's **Gemini 2.5 Flash**, providing contextual, adaptive, and encouraging language practice.
- Supports voice interaction using the browser's Web Speech API for both speech recognition (listening to the user) and speech synthesis (speaking to the user).

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Express, Node.js (bundled with esbuild)
- **AI Integration**: Google Gen AI SDK (`@google/genai`)
- **Database & Auth**: Firebase (Authentication, Firestore)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase Project (for Authentication and Firestore)
- Gemini API Key

### Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: Firebase environment variables may also be required depending on your configuration setup in `src/lib/firebase.ts`)*

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm run start
   ```

## License
MIT License
