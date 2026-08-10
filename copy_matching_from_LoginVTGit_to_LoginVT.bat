@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Thu muc 1: nguon
set "SRC=D:\Cloud\Dropbox\LoginVTGit"

REM Thu muc 2: dich - chi copy cac file/thu muc co ten dang ton tai o day
set "DST=D:\Cloud\Dropbox\LoginVT"

echo ==================================================
echo Nguon: %SRC%
echo Dich : %DST%
echo ==================================================
echo.

if not exist "%SRC%\" (
    echo [LOI] Khong tim thay thu muc nguon: %SRC%
    pause
    exit /b 1
)

if not exist "%DST%\" (
    echo [LOI] Khong tim thay thu muc dich: %DST%
    pause
    exit /b 1
)

REM 1) Voi moi THU MUC cap 1 dang co trong DST:
REM    neu SRC co thu muc cung ten thi copy/cap nhat toan bo noi dung tu SRC sang DST.
for /d %%D in ("%DST%\*") do (
    set "NAME=%%~nxD"
    if exist "%SRC%\!NAME!\" (
        echo [FOLDER] !NAME!
        robocopy "%SRC%\!NAME!" "%DST%\!NAME!" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
    ) else (
        echo [BO QUA] Khong co trong nguon: !NAME!
    )
)

REM 2) Voi moi FILE cap 1 dang co trong DST:
REM    neu SRC co file cung ten thi copy de len file trong DST.
for %%F in ("%DST%\*") do (
    if not exist "%%~fF\" (
        set "NAME=%%~nxF"
        if exist "%SRC%\!NAME!" (
            echo [FILE] !NAME!
            copy /Y "%SRC%\!NAME!" "%DST%\!NAME!" >nul
        ) else (
            echo [BO QUA] Khong co trong nguon: !NAME!
        )
    )
)

echo.
echo Hoan tat.
pause
endlocal
