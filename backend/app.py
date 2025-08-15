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
            # Enhanced context for better educational assistance
            context = """You are StudyMate, an advanced AI learning assistant for ThinkToAce platform. 
            
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
            
            Always maintain a friendly, patient, and educational tone."""
            
            # Add conversation history for context
            conversation_context = ""
            if self.conversation_history:
                recent_history = self.conversation_history[-4:]  # Last 2 exchanges
                conversation_context = "\n\nRecent conversation:\n"
                for entry in recent_history:
                    conversation_context += f"{entry['role']}: {entry['message']}\n"
            
            # Combine context with user message
            prompt = f"{context}{conversation_context}\n\nStudent Question: {user_message}\n\nStudyMate Response:"
            
            print(f"Processing: {user_message}")
            
            # Generate response using Gemini
            response = model.generate_content(prompt)
            ai_response = response.text.strip()
            
            # Store conversation history
            self.conversation_history.append({'role': 'Student', 'message': user_message})
            self.conversation_history.append({'role': 'StudyMate', 'message': ai_response})
            
            # Keep only last 10 exchanges
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]
            
            print(f"Response: {ai_response[:100]}...")
            
            # Generate helpful links
            youtube_link = f"https://www.youtube.com/results?search_query={quote(user_message + ' tutorial explanation')}"
            google_link = f"https://www.google.com/search?q={quote(user_message + ' study guide examples')}"
            
            return {
                'response': ai_response,
                'youtube_link': youtube_link,
                'google_link': google_link
            }
            
        except Exception as e:
            print(f"Error: {e}")
            fallback_response = self.get_smart_fallback(user_message)
            return {
                'response': fallback_response,
                'youtube_link': f"https://www.youtube.com/results?search_query={quote(user_message + ' tutorial')}",
                'google_link': f"https://www.google.com/search?q={quote(user_message + ' explanation')}"
            }
    
    def get_smart_fallback(self, message):
        """Provide intelligent fallback responses based on message content"""
        lower_msg = message.lower()
        
        if any(word in lower_msg for word in ['math', 'calculus', 'algebra', 'geometry', 'equation']):
            return "I'd love to help with mathematics! Try breaking down the problem step-by-step, identify what you know and what you need to find, then apply the relevant formulas or concepts. Would you like me to explain a specific math topic?"
        
        elif any(word in lower_msg for word in ['physics', 'chemistry', 'biology', 'science']):
            return "Science questions are fascinating! For better understanding, try to connect the concept to real-world examples, use diagrams or visual aids, and practice with similar problems. What specific science topic would you like to explore?"
        
        elif any(word in lower_msg for word in ['programming', 'code', 'python', 'javascript', 'html', 'css']):
            return "Programming is all about practice and problem-solving! Start with understanding the logic, then implement it step by step. Don't forget to test your code and debug any errors. Which programming concept can I help clarify?"
        
        elif any(word in lower_msg for word in ['english', 'writing', 'grammar', 'essay']):
            return "Great question about language and writing! Focus on clear structure, proper grammar, and expressing your ideas logically. Reading more also helps improve writing skills. What specific writing or language topic interests you?"
        
        else:
            return f"I understand you're asking about '{message}'. While I'm having connection issues, I'm here to help with your studies! Try breaking down complex topics into smaller parts, use active recall, and practice regularly. What subject area would you like to focus on?"
    
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
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        print(f"Received message: {user_message}")
        
        # Generate AI response
        result = studymate.generate_response(user_message)
        
        print(f"Sending response: {result}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            'response': 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
            'youtube_link': f"https://www.youtube.com/results?search_query={quote(user_message + ' tutorial')}",
            'google_link': f"https://www.google.com/search?q={quote(user_message + ' explanation')}"
        }), 200

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