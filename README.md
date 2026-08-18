# ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี

ระบบบริหารจัดการการนิเทศภายในโรงเรียน สำหรับจองวันนิเทศ ส่งไฟล์งาน ประเมินผล และรายงานสถิติ

## เทคโนโลยีที่ใช้

- **Backend**: Google Apps Script
- **Frontend**: HTML/CSS/JavaScript
- **ฐานข้อมูล**: Google Sheets
- **พื้นที่เก็บไฟล์**: Google Drive

## ข้อมูลติดต่อ

- **GitHub**: https://github.com/matthayomsungaipadi/nited.git
- **เว็บไซต์**: https://msdschool.github.io/nited/
- **Google Sheets ID**: `1HvvYyCkU2aPcdmo5zOAgUWzjBA0XXTISj64JmJramoc`
- **Google Drive ID**: `1tbGMKsyUFQ16YjGCzNQbGRI099lCEH6k`
- **Apps Script Code**: `1DQ0ats-qxCn5dwHw7XNz4GE7nUDCmzM1qN_LfsjvG0VOWfRsaJ9hn5uN`

## โครงสร้างโปรเจกต์

```
nited/
├── index.html              # หน้าหลัก
├── css/
│   └── style.css           # ไฟล์ CSS
├── js/
│   └── app.js              # ไฟล์ JavaScript หลัก
├── AppsScript/
│   ├── Code.gs             # Google Apps Script Backend
│   ├── appsscript.json     # Apps Script Manifest
│   └── index.html          # HTML สำหรับ Apps Script
└── img/
    └── (รูปภาพ)
```

## ฟังก์ชันการทำงาน

### 1. ระบบจองวันนิเทศ
- จองวัน-เวลานิเทศ (เลือกวันที่, ช่วงเวลา, กลุ่มสาระ, รายวิชา)
- ตรวจสอบความซ้ำซ้อนของการจอง
- แสดงปฏิทินที่มีการจอง
- สถานะการจอง (รอดำเนินการ, ยืนยันแล้ว, ปฏิเสธ, นิเทศแล้ว)

### 2. ระบบส่งไฟล์งาน
- อัพโหลดไฟล์ 4 ประเภท:
  - แผนการสอน (PDF/Word)
  - สื่อการสอน (รูปภาพ/PPT/PDF)
  - ภาพกิจกรรม (รูปภาพ)
  - คลิปวิดีโอ (ลิงก์ YouTube/Drive)
- เก็บไฟล์ใน Google Drive
- ตรวจสอบสถานะไฟล์ (รอตรวจสอบ, ผ่าน, ปรับปรุง)

### 3. ระบบประเมินผล
- บันทึกจุดเด่น/จุดพัฒนา
- ข้อเสนอแนะ
- ระดับคุณภาพ (ดีมาก/ดี/พอใช้/ปรับปรุง)
- เชื่อมโยงกับการจอง

### 4. ระบบรายงานและสถิติ
- Dashboard แสดงสถิติ
- ปฏิทินการจอง (ไฮไลต์วันที่จอง)
- รายงานรายบุคคล
- รายงานกลุ่มสาระ
- พิมพ์เอกสาร

### 5. ระบบผู้ดูแล
- จัดการการจอง (ยืนยัน/ปฏิเสธ/แก้ไข/ลบ)
- ตรวจสอบไฟล์ (อนุมัติ/ขอแก้ไข)
- ดูรายงานทั้งหมด
- พิมพ์รายงาน

## ข้อมูลผู้ใช้

### รหัสผ่าน Admin
- **รหัสผ่าน**: `msd12345`

### บทบาทผู้ใช้
1. **ครูผู้สอน**: จองวันนิเทศ, ส่งไฟล์งาน
2. **ผู้บริหาร/หัวหน้ากลุ่มสาระ/ศึกษานิเทศ**: ประเมินผล, ตรวจสอบ
3. **ผู้ดูแลระบบ**: จัดการข้อมูล, รายงาน

## Google Sheets Structure

### Sheet 1: Booking (การจอง)
| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Date |
| C | Time |
| D | Teacher Name |
| E | Department |
| F | Period |
| G | Subject Name |
| H | Subject Code |
| I | Class Level |
| J | Room |
| K | Status |

### Sheet 2: Files (ไฟล์งาน)
| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Teacher Name |
| C | File Type |
| D | File URL/Link |
| E | Drive File ID |
| F | Status |

### Sheet 3: Supervision (การประเมิน)
| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Teacher Name |
| C | Supervision Date |
| D | Strengths |
| E | Improvements |
| F | Suggestions |
| G | Summary |

## Google Drive Structure

```
Supervision-System-Folder/
├── Plans/           # แผนการสอน
├── Media/           # สื่อการสอน
├── Photos/          # ภาพกิจกรรม
└── Clips/           # ลิงก์คลิป (เก็บเป็นลิงก์)
```

## การติดตั้ง

### 1. ตั้งค่า Google Sheets
1. สร้าง Google Sheets ใหม่
2. สร้าง 3 Sheets: Booking, Files, Supervision
3. เพิ่ม Headers ตามตารางด้านบน

### 2. ตั้งค่า Google Drive
1. สร้าง Folder หลัก
2. สร้าง Sub-folders: Plans, Media, Photos, Clips

### 3. ตั้งค่า Google Apps Script
1. เปิด Google Sheets
2. ไปที่ Extensions > Apps Script
3. คัดลอกโค้ดจาก `AppsScript/Code.gs`
4. บันทึกและ Deploy เป็น Web App

### 4. ตั้งค่า GitHub Pages
1. Push โค้ดไปยัง GitHub Repository
2. เปิด GitHub Pages
3. อัพเดท URL ใน `js/app.js`

## การใช้งาน

1. เข้าเว็บไซต์หรือเปิด Web App
2. เข้าสู่ระบบด้วยรหัสผ่าน
3. เลือกเมนูที่ต้องการใช้งาน

## หมายเหตุ

- สำหรับการใช้งานจริง ต้องอัพเดท `CONFIG.APPS_SCRIPT_URL` ใน `js/app.js` ให้ตรงกับ Web App URL ที่ Deploy แล้ว
- ไฟล์ใน Google Drive จะถูกเก็บในโฟลเดอร์ตามประเภท
- สถานะการจองจะถูกอัพเดทอัตโนมัติเมื่อมีการดำเนินการ
