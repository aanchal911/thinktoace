#!/usr/bin/env python3
"""
StudyMate Backend Server
Run this file to start the Flask server for ThinkToAce
"""

import os
from dotenv import load_dotenv
from app import app

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    print("🚀 Starting StudyMate Backend Server...")
    print(f"📡 Server will run on http://localhost:{port}")
    print("💡 Make sure to set your GEMINI_API_KEY in .env file")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    )