@echo off
cd /d "%~dp0"
echo Iniciando Plano Industrial...
echo Se va a abrir solo en tu navegador en unos segundos.
echo (para detenerlo, cierra esta ventana o presiona Ctrl+C)
echo.
call npm run dev
pause
