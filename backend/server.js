require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// In-memory storage
const userProgress = {};
const conversationHistory = {};

// Generate quiz endpoint (unchanged)
app.post('/generate-quiz', async (req, res) => {
  try {
    const { path, level, topic } = req.body;
    
    const prompt = `
      Generate 15 multiple choice questions about ${topic} (${level} level) for ${path}.
      Each question should have:
      - question (string)
      - options (array of 4 strings)
      - correctAnswer (number 0-3)
      - explanation (string)
      
      Return a JSON object with a "questions" array.
      Example format:
      {
        "questions": [
          {
            "question": "What is...?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0,
            "explanation": "Because..."
          }
        ]
      }
    `;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a technical quiz generator. Return ONLY valid JSON." 
        },
        { role: "user", content: prompt }
      ],
      model: "deepseek-r1-distill-llama-70b",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const quizData = JSON.parse(completion.choices[0]?.message?.content);
    res.json(quizData);
    
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
});

// Save quiz results endpoint (enhanced)
app.post('/api/save-quiz-results', async (req, res) => {
  try {
    const { userId, quizResults, localStorageData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Initialize user progress if not exists
    if (!userProgress[userId]) {
      userProgress[userId] = { quizResults: {}, scores: {} };
    }
    
    // Use either provided quizResults or localStorageData
    const resultsToSave = quizResults || (localStorageData?.userLearningProfile?.quizResults || {});
    
    // Save quiz results with timestamp
    userProgress[userId].quizResults = {
      ...resultsToSave,
      completedAt: new Date().toISOString()
    };

    res.json({ 
      status: 'success',
      message: 'Quiz results saved successfully'
    });

  } catch (error) {
    console.error('Error saving quiz results:', error);
    res.status(500).json({ 
      error: 'Failed to save quiz results',
      details: error.message 
    });
  }
});

// Save progress endpoint (unchanged)
app.post('/save-progress', (req, res) => {
  try {
    const { userId, path, level, topic, percentage } = req.body;
    
    if (!userProgress[userId]) {
      userProgress[userId] = { scores: {} };
    }
    if (!userProgress[userId].scores[path]) {
      userProgress[userId].scores[path] = {};
    }
    if (!userProgress[userId].scores[path][level]) {
      userProgress[userId].scores[path][level] = {};
    }
    
    userProgress[userId].scores[path][level][topic] = percentage;
    
    res.json({ 
      status: 'success',
      progress: userProgress[userId]
    });
    
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get progress endpoint (unchanged)
app.get('/get-progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress[userId] || { scores: {} };
    
    res.json({ 
      status: 'success',
      progress 
    });
    
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Enhanced AI Chat endpoint with quiz context
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { message, sessionId, userId, localStorageData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get quiz results either from server memory or localStorage
    let quizData;
    if (userId && userProgress[userId]?.quizResults) {
      quizData = userProgress[userId].quizResults;
    } else if (localStorageData?.userLearningProfile?.quizResults) {
      quizData = localStorageData.userLearningProfile.quizResults;
    }

    // Initialize or retrieve conversation history
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [
        {
          role: "system",
          content: buildSystemPrompt(userId, quizData)
        }
      ];
    }

    // Add user message to history
    conversationHistory[sessionId].push({
      role: "user",
      content: message
    });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: conversationHistory[sessionId],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024
    });

    const response = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    
    // Add AI response to history
    conversationHistory[sessionId].push({
      role: "assistant",
      content: response
    });

    res.json({ response });

  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process your request',
      details: error.message 
    });
  }
});

// Helper function to build system prompt with quiz context
function buildSystemPrompt(userId, quizData) {
  let basePrompt = `You are TechMentor AI, an assistant that helps students with technology questions. 
  You specialize in cybersecurity, MERN stack, Web3, machine learning, cloud computing, and IoT. 
  Provide concise, helpful answers and suggest resources when appropriate. 
  If you don't know an answer, say so and suggest asking a human mentor.
    `;

  if (quizData) {
    const quizContext = `
    
    User's Learning Profile:
    - Primary Interest: ${quizData.interest || 'Not specified'}
    - Current Skill Level: ${quizData.skillLevel || 'Not specified'}
    - Learning Goals: ${quizData.learningGoals || 'Not specified'}
    - Weekly Study Hours: ${quizData.studyHours || 'Not specified'}
    - Preferred Methods: ${(quizData.learningMethods || []).join(', ') || 'Not specified'}
    - Study Time Preference: ${quizData.studyTime || 'Not specified'}
    - Main Challenges: ${(quizData.challenges || []).join(', ') || 'Not specified'}
    - Project Interests: ${quizData.projectInterests || 'Not specified'}
    - Additional Notes: ${quizData.additionalInfo || 'None'}
    `;

    basePrompt += quizContext;
  }

  return basePrompt;
}

// Start server (unchanged)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});