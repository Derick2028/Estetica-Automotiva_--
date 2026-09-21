@echo off
setlocal
cd /d "%~dp0"
echo Limpando instalacao anterior...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
call npm cache verify
if errorlevel 1 goto erro

echo Instalando dependencias...
call npm install
if errorlevel 1 goto erro

echo Verificando compatibilidade Expo...
call npx expo install --fix
if errorlevel 1 goto erro

echo Verificando TypeScript...
call npm run check
if errorlevel 1 goto erro

echo.
echo Projeto preparado com sucesso.
echo Execute: npm start
pause
exit /b 0
:erro
echo.
echo Ocorreu um erro. Copie a mensagem acima e envie para analise.
pause
exit /b 1
