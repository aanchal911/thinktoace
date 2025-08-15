# 🎓 ThinkToAce - Empower Your Learning

> AI-powered EdTech platform with StudyMate - your intelligent learning companion

![ThinkToAce Banner](https://via.placeholder.com/800x200/6366f1/ffffff?text=ThinkToAce+-+AI+Learning+Platform)

## ✨ Features

- 🤖 **StudyMate AI Assistant** - Powered by Google Gemini for instant doubt solving
- 🎨 **Modern UI/UX** - Beautiful glassmorphism design with smooth animations
- 🌙 **Dark/Light Mode** - Toggle between themes for comfortable learning
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔗 **Smart Resource Links** - Auto-generated YouTube and Google search links
- ⚡ **Real-time Chat** - Instant responses with typing indicators
- 🎯 **Educational Focus** - Specialized for academic learning and doubt solving

## 🛠 Tech Stack

### Frontend
- **HTML5/CSS3** - Modern semantic markup and styling
- **JavaScript ES6+** - Interactive functionality and API integration
- **Bootstrap 5** - Responsive grid and components
- **AOS Library** - Smooth scroll animations
- **Font Awesome** - Beautiful icons

### Backend
- **Flask** - Python web framework
- **Google Gemini AI** - Advanced language model for responses
- **Flask-CORS** - Cross-origin resource sharing
- **Python 3.8+** - Backend programming language

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ThinkToAce.git
cd ThinkToAce
```

### 2. Backend Setup (Windows)
```bash
# Run the setup script
setup.bat

# Or manually:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
# Copy environment file
cp backend\.env.example backend\.env

# Edit .env file and add your Gemini API key:
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start the Backend Server
```bash
cd backend
python run.py
```

### 5. Open Frontend
Simply open `index.html` in your browser or use a local server:
```bash
# Using Python's built-in server
python -m http.server 8000
# Then visit http://localhost:8000
```

## 🎯 How to Use StudyMate

1. **Open the App** - Launch index.html in your browser
2. **Click "Chat with StudyMate"** - Opens the AI assistant modal
3. **Ask Questions** - Type any academic question or doubt
4. **Get Instant Help** - Receive AI-powered explanations and resource links
5. **Explore Resources** - Click on generated YouTube and Google links

### Example Questions for StudyMate:
- "Explain photosynthesis in simple terms"
- "How do I solve quadratic equations?"
- "What is machine learning?"
- "Help me understand Newton's laws"

## 📁 Project Structure

```
ThinkToAce/
├── index.html              # Main frontend file
├── styles.css              # Modern CSS with animations
├── script.js               # JavaScript functionality
├── setup.bat              # Windows setup script
├── backend/
│   ├── app.py             # Flask application
│   ├── run.py             # Server startup script
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── venv/              # Virtual environment (created after setup)
└── README.md              # This file
```

## 🎨 UI Features

- **Glassmorphism Design** - Modern translucent elements
- **Floating Animations** - Smooth particle effects and floating cards
- **Responsive Layout** - Mobile-first design approach
- **Interactive Elements** - Hover effects and smooth transitions
- **Loading States** - Visual feedback for user actions

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### API Endpoints
- `POST /api/chat` - Send message to StudyMate
- `GET /api/health` - Check server status
- `GET /` - API information

## 🚀 Deployment

### Frontend
- **GitHub Pages** - Free static hosting
- **Netlify** - Easy deployment with form handling
- **Vercel** - Fast global CDN

### Backend
- **Railway** - Simple Python app deployment
- **Render** - Free tier available
- **Heroku** - Popular platform-as-a-service
- **AWS/GCP** - Cloud platforms for scalability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

- **Email**: aanchalbb11@gmail.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/ThinkToAce/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ThinkToAce/discussions)

## 🙏 Acknowledgments

- Google Gemini AI for powering StudyMate
- Bootstrap team for the UI framework
- Font Awesome for beautiful icons
- AOS library for smooth animations

---

**Made with ❤️ by ThinkToAce Team**

*Empowering learners worldwide with AI-driven education technology*