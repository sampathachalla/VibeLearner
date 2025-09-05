// Test script to verify API response structure
const testResponse = {
  "quiz_json": [
    {
      "module_title": "Understanding GenAI Concepts",
      "kind": "mcq",
      "question": "Which of the following best describes Generative AI?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "rationale": "A is correct because Generative AI specifically refers to algorithms that create new content."
    }
  ],
  "flashcards_json": [
    {
      "module_title": "Understanding GenAI Concepts",
      "term": "Generative AI",
      "definition": "A type of artificial intelligence that generates new content by learning from existing data."
    }
  ],
  "course_outline_json": {
    "title": "Basics of GenAI",
    "modules": []
  },
  "course_outline_html": "<!DOCTYPE html>..."
};

console.log('Testing API response structure:');
console.log('quiz_json:', testResponse.quiz_json, 'type:', typeof testResponse.quiz_json, 'isArray:', Array.isArray(testResponse.quiz_json));
console.log('flashcards_json:', testResponse.flashcards_json, 'type:', typeof testResponse.flashcards_json, 'isArray:', Array.isArray(testResponse.flashcards_json));
console.log('course_outline_json:', testResponse.course_outline_json, 'type:', typeof testResponse.course_outline_json);

// Test the structure that components expect
const quiz = testResponse.quiz_json || [];
const flashcards = testResponse.flashcards_json || [];
const notes = testResponse.course_outline_json || null;

console.log('Processed data:');
console.log('quiz length:', quiz.length);
console.log('flashcards length:', flashcards.length);
console.log('notes available:', !!notes);
