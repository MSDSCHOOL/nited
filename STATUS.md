# ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี

## สถานะปัจจุบัน

ไฟล์ทั้งหมดพร้อมสำหรับการ Deploy:

### ไฟล์สำหรับ GitHub Pages (เว็บไซต์)
```
D:\nited\
├── index.html          # หน้าหลัก
├── css/style.css       # ไฟล์ CSS
├── js/app.js           # ไฟล์ JavaScript
└── README.md           # คู่มือ
```

### ไฟล์สำหรับ Google Apps Script
```
D:\nited\deploy\
├── .clasp.json         # ตั้งค่า clasp
├── Code.gs             # Apps Script Backend
├── index.html          # HTML สำหรับ Apps Script
└── appsscript.json     # Apps Script Manifest
```

---

## ขั้นตอนการ Deploy (ทำตามลำดับ)

### Step 1: Login เข้า Google Apps Script

```powershell
cd D:\nited\deploy
clasp login
```

> จะเปิดเบราว์เซอร์ให้เลือก Google Account
> เลือก Account ที่ต้องการใช้แล้วคลิก Allow

---

### Step 2: Push โค้ดไป Apps Script

```powershell
clasp push --force
```

---

### Step 3: Deploy เป็น Web App

1. เปิด https://script.google.com
2. ค้นหา project ที่มี Script ID: `1DQ0ats-qxCn5dwHw7XNz4GE7nUDCmzM1qN_LfsjvG0VOWfRsaJ9hn5uN`
3. คลิก **Deploy** > **New deployment**
4. เลือก **Web app**
5. ตั้งค่า: Execute as = Me, Who has access = Anyone
6. คลิก **Deploy**
7. คัดลอก URL ที่ได้

---

### Step 4: อัพเดท URL ในโค้ด

แก้ไขไฟล์ `D:\nited\js\app.js` บรรทัดที่ 4:

```javascript
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/[URL ที่ได้]/exec',
```

---

### Step 5: Push ไป GitHub

```powershell
cd D:\nited
git add .
git commit -m "Deploy ระบบนิเทศ v1.0"
git push origin main
```

---

## ตรวจสอบผลลัพธ์

- เว็บไซต์: https://msdschool.github.io/nited/
- Apps Script: https://script.google.com

---

## ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|--------|---------|
| No credentials found | รัน `clasp login` |
| Script not found | ตรวจสอบ Script ID |
| Permission denied | ต้องเป็น owner ของ project |
