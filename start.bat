@echo off
echo Starting Women's AI Health App...
echo.

echo Starting FastAPI Backend on http://127.0.0.1:5000...
start "FEMCARE API" /D "%~dp0backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 5000"

timeout /t 3 /nobreak > nul

echo Starting React Frontend on http://127.0.0.1:3000...
start "FEMCARE Frontend" /D "%~dp0frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 3000 --strictPort"

echo.
echo Both servers are starting!
echo Backend: http://127.0.0.1:5000
echo Frontend: http://127.0.0.1:3000
echo.
pause
