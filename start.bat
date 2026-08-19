@echo off
start "" python "./server.py"
timeout /t 1 >nul
start "" "http://localhost:8080"