# API Integration Changes

## Overview
The app has been updated to integrate with a real API endpoint instead of using dummy data. When a user sends a message, it now makes a POST request to `http://localhost:8080/generate` and uses the response to populate the flashcards, quiz, and notes sections.

## Changes Made

### 1. API Service (`services/api.ts`)
- Created new API service with `generateContent()` function
- Sends POST request with payload:
  ```json
  {
    "topic": "user_input",
    "level": "Beginner", 
    "minutes_per_concept": 6.0
  }
  ```
- Expects response with:
  ```json
  {
    "quiz_json": [...],
    "flashcards_json": [...],
    "course_outline_json": {...},
    "course_outline_html": "..."
  }
  ```

### 2. Content Context (`context/ContentContext.tsx`)
- Created React context to manage API data across components
- Handles loading states and error handling
- Provides `generateContentForTopic()` function

### 3. Updated Components
- **Homepage**: Now calls API when message is sent
- **FlashcardsView**: Uses `content.flashcards_json` from context
- **QuizView**: Uses `content.quiz_json` from context  
- **NotesView**: Uses `content.course_outline_json` from context
- **Loader**: Updated to work with real API loading states

### 4. Data Files Updated
- `components/flashcards/flascarddata.js`: Now returns empty array (data comes from API)
- `components/quiz/quizdata.js`: Now returns empty array (data comes from API)
- `components/notes/notesData.js`: Now returns minimal structure (data comes from API)

## Flow
1. User types message and clicks send
2. `handleSend()` in homepage calls `generateContentForTopic()`
3. API request is made to `http://localhost:8080/generate`
4. Response is stored in ContentContext
5. User is navigated to result view
6. Components display real API data instead of dummy data

## Testing
To test the integration:
1. Start your API server on `http://localhost:8080`
2. Run the React Native app
3. Type a topic (e.g., "Basics of GenAI") and send
4. Check that the API request is made and response is received
5. Verify that flashcards, quiz, and notes show real data

## Error Handling
- API errors are logged to console
- Loading states are properly managed
- Components gracefully handle missing data
