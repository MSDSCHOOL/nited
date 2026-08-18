# คู่มือ Deploy ระบบนิเทศภายใน

## ขั้นตอนที่ 1: เข้าสู่ระบบ Google Apps Script

### วิธีที่ 1: ใช้ clasp login (แนะนำ)

1. เปิด PowerShell แล้วรัน:
```powershell
cd D:\nited\deploy
clasp login
```

2. ระบบจะเปิดเบราว์เซอร์ไปที่หน้า Google Account
   - เลือก Google Account ที่ต้องการใช้
   - คลิก **Allow** เพื่ออนุญาต

3. กลับมาที่ PowerShell จะเห็นข้อความ "Successfully logged in"

### วิธีที่ 2: คัดลอกโค้ดด้วยมือ

1. เปิด Apps Script Editor:
   https://script.google.com

2. สร้าง project ใหม่หรือเปิด project ที่มีอยู่

3. คัดลอกโค้ดจากไฟล์ `D:\nited\AppsScript\Code.gs` ไปวางใน Apps Script Editor

4. บันทึก (Ctrl+S)

---

## ขั้นตอนที่ 2: Push โค้ด

หลังจาก login สำเร็จ:

```powershell
cd D:\nited\deploy
clasp push --force
```

---

## ขั้นตอนที่ 3: Deploy เป็น Web App

1. ไปที่ https://script.google.com
2. เปิด project ที่ต้องการ Deploy
3. คลิก **Deploy** > **New deployment**
4. ตั้งค่า:
   - **Description**: ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี
   - **Execute as**: Me
   - **Who has access**: Anyone
5. คลิก **Deploy**
6. คัดลอก Web App URL

---

## ขั้นตอนที่ 4: อัพเดท URL ในโค้ด

นำ URL ที่ได้ไปใส่ในไฟล์ `D:\nited\js\app.js`:

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/XXXX/exec',
  // ...
};
```

---

## ขั้นตอนที่ 5: Push ไป GitHub

```powershell
cd D:\nited
git add .
git commit -m "Deploy ระบบนิเทศ v1.0"
git push origin main
```

---

## ข้อมูลอ้างอิง

- **Script ID**: `1DQ0ats-qxCn5dwHw7XNz4GE7nUDCmzM1qN_LfsjvG0VOWfRsaJ9hn5uN`
- **Google Sheets ID**: `1HvvYyCkU2aPcdmo5zOAgUWzjBA0XXTISj64JmJramoc`
- **Google Drive ID**: `1tbGMKsyUFQ16YjGCzNQbGRI099lCEH6k`
