from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import re
from urllib.parse import quote
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyD3WMtbQYUS_sPcyWh25ooTgHMKub9v3kE')
print(f"Using API Key: {GEMINI_API_KEY[:10]}...")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

class StudyMateAI:
    def __init__(self):
        self.conversation_history = []
    
    def generate_response(self, user_message):
        try:
            # Create context for educational assistance
            context = """You are StudyMate, an AI learning assistant for ThinkToAce platform. 
            You help students with:
            - Solving academic doubts and questions
            - Explaining complex concepts in simple terms
            - Providing study tips and learning strategies
            - Recommending educational resources
            
            Always be helpful, encouraging, and educational. Keep responses concise but informative.
            If asked about topics outside education, politely redirect to learning-related topics."""
            
            # Combine context with user message
            prompt = f"{context}\n\nStudent Question: {user_message}\n\nStudyMate Response:"
            
            print(f"Processing: {user_message}")
            
            # Generate response using Gemini
            response = model.generate_content(prompt)
            ai_response = response.text
            
            print(f"Response: {ai_response[:100]}...")
            
            # Extract potential search terms for additional resources
            links = self.generate_helpful_links(user_message, ai_response)
            
            return {
                'response': ai_response,
                'links': links
            }
            
        except Exception as e:
            print(f"Error: {e}")
            return {
                'response': f"I understand you're asking about '{user_message}'. Let me help you with that topic.",
                'links': self.generate_helpful_links(user_message, "")
            }
    
    def generate_helpful_links(self, question, response):
        """Generate helpful YouTube and Google search links based on the question"""
        links = []
        
        # Extract key terms from the question
        key_terms = self.extract_key_terms(question)
        
        if key_terms:
            # YouTube search link
            youtube_query = quote(' '.join(key_terms[:3]))  # Use top 3 terms
            youtube_link = f"https://www.youtube.com/results?search_query={youtube_query}+tutorial"
            links.append({
                'title': f'YouTube tutorials on {" ".join(key_terms[:2])}',
                'url': youtube_link
            })
            
            # Google search link
            google_query = quote(' '.join(key_terms))
            google_link = f"https://www.google.com/search?q={google_query}+explanation+tutorial"
            links.append({
                'title': f'Google search for {" ".join(key_terms[:2])}',
                'url': google_link
            })
        
        return links
    
    def extract_key_terms(self, text):
        """Extract important terms from the question"""
        # Remove common words and extract meaningful terms
        stop_words = {'what', 'how', 'why', 'when', 'where', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'can', 'could', 'would', 'should', 'explain', 'help', 'me', 'please'}
        
        # Clean and split text
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        key_terms = [word for word in words if word not in stop_words and len(word) > 2]
        
        return key_terms[:5]  # Return top 5 terms

# Initialize StudyMate
studymate = StudyMateAI()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Generate AI response
        result = studymate.generate_response(user_message)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'StudyMate API'})

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.get_json()
        subject = data.get('subject', '')
        marks = int(data.get('marks', 10))
        duration = int(data.get('duration', 10))
        
        # Calculate number of questions based on marks
        num_questions = max(5, marks // 2)
        
        # Generate quiz using Gemini
        prompt = f"""Create {num_questions} multiple choice questions about {subject}.
        
        Format as JSON array:
        [
          {{
            "question": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct": 0
          }}
        ]
        
        Subject: {subject}
        Questions: {num_questions}
        Difficulty: Moderate level
        
        Return only valid JSON array."""
        
        try:
            response = model.generate_content(prompt)
            quiz_text = response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            quiz_text = "[]"
        
        # Clean up the response to extract JSON
        if '```json' in quiz_text:
            start = quiz_text.find('[') 
            end = quiz_text.rfind(']') + 1
            if start != -1 and end != 0:
                quiz_text = quiz_text[start:end]
        elif '```' in quiz_text:
            start = quiz_text.find('[')
            end = quiz_text.rfind(']') + 1
            if start != -1 and end != 0:
                quiz_text = quiz_text[start:end]
        
        try:
            import json
            quiz_data = json.loads(quiz_text)
        except:
            # Generate fallback quiz based on subject
            quiz_data = [
                {
                    "question": f"What is the primary focus of {subject}?",
                    "options": [f"Understanding {subject} concepts", "Memorizing facts", "Avoiding study", "Random guessing"],
                    "correct": 0
                },
                {
                    "question": f"Which skill is most important in {subject}?",
                    "options": ["Critical thinking", "Speed reading", "Copying notes", "Ignoring details"],
                    "correct": 0
                },
                {
                    "question": f"How can you improve in {subject}?",
                    "options": ["Regular practice", "Avoiding homework", "Skipping classes", "Not studying"],
                    "correct": 0
                },
                {
                    "question": f"What helps in learning {subject} effectively?",
                    "options": ["Active participation", "Passive listening", "Distractions", "Procrastination"],
                    "correct": 0
                },
                {
                    "question": f"Why is {subject} important?",
                    "options": ["Builds knowledge and skills", "Wastes time", "Creates confusion", "Has no value"],
                    "correct": 0
                }
            ]
        
        return jsonify({
            'quiz': quiz_data,
            'subject': subject,
            'marks': marks,
            'duration': duration
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate quiz'}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'StudyMate API is running!',
        'endpoints': {
            'chat': '/api/chat (POST)',
            'generate-quiz': '/api/generate-quiz (POST)',
            'health': '/api/health (GET)'
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)