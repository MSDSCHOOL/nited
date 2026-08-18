# คู่มือการ Deploy ระบบ Apps Script

## ขั้นตอนที่ 1: เข้าสู่ระบบ Google Apps Script

เปิด Terminal/PowerShell แล้วรันคำสั่ง:

```powershell
cd D:\nited\deploy
clasp login
```

ระบบจะเปิดเว็บเบราว์เซอร์ให้เลือก Google Account
- เลือก Google Account ที่มี Apps Script project
- อนุญาตให้ clasp เข้าถึง Apps Script

## ขั้นตอนที่ 2: Push โค้ดไปยัง Apps Script

หลังจาก login สำเร็จรัน:

```powershell
cd D:\nited\deploy
clasp push --force
```

## ขั้นตอนที่ 3: Deploy เป็น Web App

1. ไปที่ https://script.google.com
2. เปิด project ที่มี Script ID: `1DQ0ats-qxCn5dwHw7XNz4GE7nUDCmzM1qN_LfsjvG0VOWfRsaJ9hn5uN`
3. คลิก **Deploy** > **New deployment**
4. เลือกประเภท: **Web app**
5. ตั้งค่า:
   - Description: `ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี`
   - Execute as: `Me`
   - Who has access: `Anyone`
6. คลิก **Deploy**
7. คัดลอก Web App URL

## ขั้นตอนที่ 4: อัพเดท URL ในโค้ด

นำ URL ที่ได้ไปใส่ในไฟล์ `js/app.js`:

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: 'URL ที่ได้จากขั้นตอนที่ 3',
  // ...
};
```

## ขั้นตอนที่ 5: Push ไปยัง GitHub

```powershell
cd D:\nited
git add .
git commit -m "Deploy ระบบนิเทศ v1.0"
git push origin main
```

## ปัญหาที่อาจพบ

### 1. "No credentials found"
- ต้องรัน `clasp login` ก่อน

### 2. "Script ID not found"
- ตรวจสอบ Script ID ถูกต้อง

### 3. "Permission denied"
- ต้องเป็น owner ของ Apps Script project

## หมายเหตุ

- รหัสสคริปต์: `1DQ0ats-qxCn5dwHw7XNz4GE7nUDCmzM1qN_LfsjvG0VOWfRsaJ9hn5uN`
- Google Sheets ID: `1HvvYyCkU2aPcdmo5zOAgUWzjBA0XXTISj64JmJramoc`
- Google Drive ID: `1tbGMKsyUFQ16YjGCzNQbGRI099lCEH6k`
