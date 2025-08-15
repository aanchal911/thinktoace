const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { subject, marks, duration } = req.body;
        
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `Generate a quiz for ${subject} with ${marks} marks. Return JSON with questions array containing question, options array, and correct index.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            quiz: {
                questions: [
                    {
                        question: `What is a key concept in ${subject}?`,
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correct: 0
                    }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
}