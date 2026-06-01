@echo off
title TAROT SERVER
echo ============================================
echo   TAROT SERVER dang chay tren cong 8765
echo   Giu cua so nay mo de app hoat dong
echo   Dong cua so nay = tat server
echo ============================================
echo.
start "" "http://localhost:8765"
python -m http.server 8765 --directory "%~dp0"
pause
