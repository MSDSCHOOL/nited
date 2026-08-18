@echo off
echo ======================================
echo  ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี
echo  Deployment Script
echo ======================================
echo.

cd /d D:\nited\deploy

echo [1] กำลังเข้าสู่ระบบ Google Apps Script...
echo     กรุณาเลือก Google Account ในเบราว์เซอร์
echo.
clasp login

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] การเข้าสู่ระบบล้มเหลว
    pause
    exit /b 1
)

echo.
echo [2] กำลัง Push โค้ดไปยัง Apps Script...
clasp push --force

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] การ Push โค้ดล้มเหลว
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Push โค้ดสำเร็จ!
echo.
echo [3] ขั้นตอนถัดไป:
echo     1. ไปที่ https://script.google.com
echo     2. เปิด project Script ID: 1DQ0ats-qxCn5dwHw7XNz4GE7nUDCmzM1qN_LfsjvG0VOWfRsaJ9hn5uN
echo     3. คลิก Deploy ^> New deployment
echo     4. เลือก Web app
echo     5. คัดลอก URL แล้วใส่ในไฟล์ js\app.js
echo.
pause
