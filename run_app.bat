@echo off
echo ========================================================
echo   The Gilded Ace: Floor Command Center
echo   Starting Vegas Noir Streamlit Application
echo ========================================================

REM Add Python scripts directory to PATH if needed
set "PATH=%LOCALAPPDATA%\Python\pythoncore-3.14-64\Scripts;%PATH%"

python -m streamlit run app.py

pause

