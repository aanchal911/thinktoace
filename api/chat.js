const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `You are StudyMate, an AI educational assistant. Help with: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            response: text,
            youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(message + ' tutorial')}`,
            google_link: `https://www.google.com/search?q=${encodeURIComponent(message + ' study guide')}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate response' });
    }
}