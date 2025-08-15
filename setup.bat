@echo off
echo 🚀 Setting up ThinkToAce Backend...
echo.

cd backend

echo 📦 Creating virtual environment...
python -m venv venv

echo 🔧 Activating virtual environment...
call venv\Scripts\activate

echo 📥 Installing dependencies...
pip install -r requirements.txt

echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Copy .env.example to .env
echo 2. Add your Gemini API key to .env file
echo 3. Run: python run.py
echo.
pause