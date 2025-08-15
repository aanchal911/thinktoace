@echo off
echo Starting ThinkToAce Backend Server...
cd backend
call venv\Scripts\activate
python run.py
pause