@echo off
rem ClearedToCode OBS setup: points the scene file at this folder and
rem copies your old hangar background in. Safe to run more than once.
setlocal
cd /d "%~dp0"

set "OLDBG=%USERPROFILE%\Downloads\MSFS_Addons_Linker_v30_674wt\OBS oVERLAY CODEX\assets\hangar-clean.png"
if not exist "assets\hangar.png" if exist "%OLDBG%" (
  copy /y "%OLDBG%" "assets\hangar.png" >nul
  echo Copied your hangar background into assets\hangar.png
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$dir = (Get-Location).Path.Replace([char]92, [char]47); $src = Join-Path (Get-Location) 'scene-template.json'; $dst = Join-Path (Get-Location) 'ClearedToCode-OBS-v2.json'; [IO.File]::WriteAllText($dst, [IO.File]::ReadAllText($src).Replace('__CTC_DIR__', $dir))"
if errorlevel 1 (
  echo Something went wrong writing the scene file.
  pause
  exit /b 1
)

echo.
echo Done. Scene file is ready:
echo   %CD%\ClearedToCode-OBS-v2.json
echo.
echo Next: open OBS, then Scene Collection ^> Import, pick that file,
echo then Scene Collection ^> ClearedToCode v2.
echo.
pause
