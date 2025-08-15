const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD3WMtbQYUS_sPcyWh25ooTgHMKub9v3kE';
console.log(`🔑 Using API Key: ${API_KEY.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// StudyMate AI Class
class StudyMateAI {
    constructor() {
        this.conversationHistory = [];
    }

    async generateResponse(userMessage) {
        try {
            const context = `You are StudyMate, an advanced AI learning assistant for ThinkToAce platform.

Your expertise includes:
- Mathematics (algebra, calculus, geometry, statistics)
- Sciences (physics, chemistry, biology, computer science)
- Programming (Python, JavaScript, web development, algorithms)
- Languages (English, grammar, writing, literature)
- Study techniques and learning strategies
- Academic guidance and career advice

Guidelines:
- Provide clear, step-by-step explanations
- Use examples and analogies when helpful
- Be encouraging and supportive
- Ask follow-up questions to ensure understanding
- Suggest practical exercises or resources
- Keep responses conversational but informative
- If unsure, admit it and suggest where to find accurate information

Always maintain a friendly, patient, and educational tone.`;

            // Add conversation history for context
            let conversationContext = '';
            if (this.conversationHistory.length > 0) {
                const recentHistory = this.conversationHistory.slice(-4);
                conversationContext = '\n\nRecent conversation:\n';
                recentHistory.forEach(entry => {
                    conversationContext += `${entry.role}: ${entry.message}\n`;
                });
            }

            const prompt = `${context}${conversationContext}\n\nStudent Question: ${userMessage}\n\nStudyMate Response:`;

            console.log(`Processing: ${userMessage}`);

            const result = await model.generateContent(prompt);
            const response = result.response;
            const aiResponse = response.text().trim();
            
            if (!aiResponse) {
                throw new Error('Empty response from Gemini');
            }

            // Store conversation history
            this.conversationHistory.push({ role: 'Student', message: userMessage });
            this.conversationHistory.push({ role: 'StudyMate', message: aiResponse });

            // Keep only last 10 exchanges
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            console.log(`Response: ${aiResponse.substring(0, 100)}...`);

            return {
                response: aiResponse,
                youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(userMessage + ' tutorial explanation')}`,
                google_link: `https://www.google.com/search?q=${encodeURIComponent(userMessage + ' study guide examples')}`
            };

        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // More specific error handling
            if (error.status === 400) {
                console.error('❌ Bad Request - Check API key or request format');
            } else if (error.status === 403) {
                console.error('❌ Forbidden - API key invalid or no access');
            } else if (error.status === 429) {
                console.error('❌ Rate Limited - Too many requests');
            } else if (error.message?.includes('fetch')) {
                console.error('❌ Network Error - Check internet connection');
            }
            
            return this.getSmartFallback(userMessage);
        }
    }

    getSmartFallback(message) {
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('math') || lowerMsg.includes('calculus') || lowerMsg.includes('algebra')) {
            return {
                response: "I'd love to help with mathematics! Try breaking down the problem step-by-step, identify what you know and what you need to find, then apply the relevant formulas or concepts. Would you like me to explain a specific math topic?",
                youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(message + ' tutorial')}`,
                google_link: `https://www.google.com/search?q=${encodeURIComponent(message + ' explanation')}`
            };
        }

        if (lowerMsg.includes('science') || lowerMsg.includes('physics') || lowerMsg.includes('chemistry') || lowerMsg.includes('biology')) {
            return {
                response: "Science questions are fascinating! For better understanding, try to connect the concept to real-world examples, use diagrams or visual aids, and practice with similar problems. What specific science topic would you like to explore?",
                youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(message + ' tutorial')}`,
                google_link: `https://www.google.com/search?q=${encodeURIComponent(message + ' explanation')}`
            };
        }

        if (lowerMsg.includes('programming') || lowerMsg.includes('code') || lowerMsg.includes('python') || lowerMsg.includes('javascript')) {
            return {
                response: "Programming is all about practice and problem-solving! Start with understanding the logic, then implement it step by step. Don't forget to test your code and debug any errors. Which programming concept can I help clarify?",
                youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(message + ' tutorial')}`,
                google_link: `https://www.google.com/search?q=${encodeURIComponent(message + ' explanation')}`
            };
        }

        return {
            response: `I understand you're asking about '${message}'. Here are some effective learning strategies I can share: Practice active learning, use spaced repetition, and don't hesitate to ask follow-up questions. What specific topic would you like to focus on?`,
            youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(message + ' tutorial')}`,
            google_link: `https://www.google.com/search?q=${encodeURIComponent(message + ' explanation')}`
        };
    }

    async generateQuiz(subject, marks, duration) {
        try {
            const numQuestions = Math.max(5, Math.floor(marks / 2));
            
            const prompt = `Create ${numQuestions} multiple choice questions about ${subject}.

Format as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct": 0
  }
]

Subject: ${subject}
Questions: ${numQuestions}
Difficulty: Moderate level

Return only valid JSON array.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            let quizText = response.text().trim();
            
            if (!quizText) {
                throw new Error('Empty quiz response from Gemini');
            }

            // Clean up the response to extract JSON
            if (quizText.includes('```json')) {
                const start = quizText.indexOf('[');
                const end = quizText.lastIndexOf(']') + 1;
                if (start !== -1 && end !== 0) {
                    quizText = quizText.substring(start, end);
                }
            } else if (quizText.includes('```')) {
                const start = quizText.indexOf('[');
                const end = quizText.lastIndexOf(']') + 1;
                if (start !== -1 && end !== 0) {
                    quizText = quizText.substring(start, end);
                }
            }

            try {
                const quizData = JSON.parse(quizText);
                return quizData;
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                return this.getFallbackQuiz(subject);
            }

        } catch (error) {
            console.error('Quiz generation error:', error);
            return this.getFallbackQuiz(subject);
        }
    }

    getFallbackQuiz(subject) {
        return [
            {
                question: `What is the primary focus of ${subject}?`,
                options: [`Understanding ${subject} concepts`, "Memorizing facts", "Avoiding study", "Random guessing"],
                correct: 0
            },
            {
                question: `Which skill is most important in ${subject}?`,
                options: ["Critical thinking", "Speed reading", "Copying notes", "Ignoring details"],
                correct: 0
            },
            {
                question: `How can you improve in ${subject}?`,
                options: ["Regular practice", "Avoiding homework", "Skipping classes", "Not studying"],
                correct: 0
            },
            {
                question: `What helps in learning ${subject} effectively?`,
                options: ["Active participation", "Passive listening", "Distractions", "Procrastination"],
                correct: 0
            },
            {
                question: `Why is ${subject} important?`,
                options: ["Builds knowledge and skills", "Wastes time", "Creates confusion", "Has no value"],
                correct: 0
            }
        ];
    }
}

// Initialize StudyMate
const studymate = new StudyMateAI();

// Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'No message provided' });
        }

        console.log(`Received message: ${message}`);
        
        const result = await studymate.generateResponse(message.trim());
        
        console.log(`Sending response: ${JSON.stringify(result)}`);
        
        res.json(result);
        
    } catch (error) {
        console.error('Chat endpoint error:', error);
        const fallbackResult = studymate.getSmartFallback(message.trim());
        res.json(fallbackResult);
    }
});

app.post('/api/generate-quiz', async (req, res) => {
    try {
        const { subject, marks, duration } = req.body;
        
        if (!subject || !marks || !duration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`Generating quiz: ${subject}, ${marks} marks, ${duration} minutes`);
        
        const quizQuestions = await studymate.generateQuiz(subject, parseInt(marks), parseInt(duration));
        
        res.json({
            quiz: quizQuestions,
            subject: subject,
            marks: parseInt(marks),
            duration: parseInt(duration)
        });
        
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'StudyMate API',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'StudyMate API is running!',
        endpoints: {
            chat: '/api/chat (POST)',
            'generate-quiz': '/api/generate-quiz (POST)',
            health: '/api/health (GET)'
        }
    });
});

// Start server
// Test Gemini connection on startup
async function testGeminiConnection() {
    try {
        console.log('🧪 Testing Gemini AI connection...');
        const testResult = await model.generateContent('Say "Hello StudyMate"');
        const testResponse = testResult.response.text();
        console.log('✅ Gemini AI connected successfully!');
        console.log('🤖 Test response:', testResponse.trim());
        return true;
    } catch (error) {
        console.error('❌ Gemini AI connection failed:');
        console.error('Error details:', error.message || error);
        if (error.status) {
            console.error('HTTP Status:', error.status);
        }
        return false;
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 StudyMate Server running on http://localhost:${PORT}`);
    console.log(`📚 Ready to help students learn!`);
    
    // Test Gemini connection
    const geminiWorking = await testGeminiConnection();
    if (!geminiWorking) {
        console.log('⚠️  Server will use fallback responses until Gemini is fixed');
    }
});