// ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี
// Google Apps Script Backend

const SPREADSHEET_ID = '1HvvYyCkU2aPcdmo5zOAgUWzjBA0XXTISj64JmJramoc';
const DRIVE_FOLDER_ID = '1tbGMKsyUFQ16YjGCzNQbGRI099lCEH6k';

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    let data = e.parameter;
    if (data.data) {
      try {
        const parsed = JSON.parse(data.data);
        data = { ...data, ...parsed };
      } catch (err) {}
    }
    return handleApiRequest(data);
  }
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    return handleApiRequest(data);
  } catch (error) {
    return jsonResponse({success: false, message: error.toString()});
  }
}

function handleApiRequest(data) {
  const action = data ? data.action : null;
  switch(action) {
    case 'login':
      return jsonResponse(login(data));
    case 'getBookings':
      return jsonResponse(getBookings(data));
    case 'createBooking':
      return jsonResponse(createBooking(data));
    case 'updateBooking':
      return jsonResponse(updateBooking(data));
    case 'deleteBooking':
      return jsonResponse(deleteBooking(data));
    case 'uploadFile':
      return jsonResponse(uploadFile(data));
    case 'getFiles':
      return jsonResponse(getFiles(data));
    case 'updateFileStatus':
      return jsonResponse(updateFileStatus(data));
    case 'createEvaluation':
      return jsonResponse(createEvaluation(data));
    case 'getEvaluations':
      return jsonResponse(getEvaluations(data));
    case 'getDashboardStats':
      return jsonResponse(getDashboardStats());
    case 'getCalendarData':
      return jsonResponse(getCalendarData(data));
    case 'getTeacherReport':
      return jsonResponse(getTeacherReport(data));
    case 'getDepartmentReport':
      return jsonResponse(getDepartmentReport(data));
    case 'getAllTeachers':
      return jsonResponse(getAllTeachers());
    case 'getAllDepartments':
      return jsonResponse(getAllDepartments());
    default:
      return jsonResponse({success: false, message: 'Unknown action: ' + action});
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== LOGIN ====================
function login(data) {
  const { username, password } = data;
  const ADMIN_PASSWORD = 'msd12345';
  
  if (password === ADMIN_PASSWORD) {
    return {
      success: true,
      role: 'admin',
      message: 'เข้าสู่ระบบสำเร็จ'
    };
  }
  
  // Check if it's a teacher
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const bookingSheet = ss.getSheetByName('Booking');
  const bookings = bookingSheet.getDataRange().getValues();
  
  for (let i = 1; i < bookings.length; i++) {
    if (bookings[i][3] === username) {
      return {
        success: true,
        role: 'teacher',
        name: username,
        message: 'เข้าสู่ระบบสำเร็จ'
      };
    }
  }
  
  // Allow any teacher to login with their name
  if (username && username.trim() !== '') {
    return {
      success: true,
      role: 'teacher',
      name: username,
      message: 'เข้าสู่ระบบสำเร็จ'
    };
  }
  
  return {success: false, message: 'รหัสผ่านไม่ถูกต้อง'};
}

// ==================== BOOKING ====================
function getBookings(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const bookings = sheet.getDataRange().getValues();
  
  let result = [];
  for (let i = 1; i < bookings.length; i++) {
    let booking = {
      id: i + 1,
      timestamp: bookings[i][0],
      date: bookings[i][1],
      time: bookings[i][2],
      teacherName: bookings[i][3],
      department: bookings[i][4],
      period: bookings[i][5],
      subjectName: bookings[i][6],
      subjectCode: bookings[i][7],
      classLevel: bookings[i][8],
      room: bookings[i][9],
      status: bookings[i][10]
    };
    
    // Filter by teacher name if provided
    if (data.teacherName && booking.teacherName !== data.teacherName) continue;
    
    // Filter by status if provided
    if (data.status && booking.status !== data.status) continue;
    
    // Filter by date range
    if (data.startDate && booking.date < data.startDate) continue;
    if (data.endDate && booking.date > data.endDate) continue;
    
    result.push(booking);
  }
  
  return {success: true, data: result};
}

function createBooking(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  
  // Check for duplicate bookings
  const bookings = sheet.getDataRange().getValues();
  for (let i = 1; i < bookings.length; i++) {
    if (bookings[i][1] === data.date && 
        bookings[i][2] === data.time &&
        bookings[i][5] === data.period &&
        bookings[i][10] !== 'ปฏิเสธ') {
      return {success: false, message: 'วันและเวลานี้ถูกจองแล้ว'};
    }
  }
  
  const timestamp = new Date().toLocaleString('th-TH');
  const row = [
    timestamp,
    data.date,
    data.time,
    data.teacherName,
    data.department,
    data.period,
    data.subjectName,
    data.subjectCode,
    data.classLevel,
    data.room,
    'รอดำเนินการ'
  ];
  
  sheet.appendRow(row);
  
  return {success: true, message: 'จองวันนิเทศสำเร็จ', id: sheet.getLastRow()};
}

function updateBooking(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const row = data.id;
  
  if (row < 2) return {success: false, message: 'ไม่พบรายการจอง'};
  
  if (data.status) {
    sheet.getRange(row, 11).setValue(data.status);
  }
  
  if (data.date) {
    sheet.getRange(row, 2).setValue(data.date);
  }
  
  if (data.time) {
    sheet.getRange(row, 3).setValue(data.time);
  }
  
  return {success: true, message: 'อัพเดทสำเร็จ'};
}

function deleteBooking(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const row = data.id;
  
  if (row < 2) return {success: false, message: 'ไม่พบรายการจอง'};
  
  sheet.deleteRow(row);
  
  return {success: true, message: 'ลบสำเร็จ'};
}

// ==================== FILES ====================
function uploadFile(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Files');
  
  // Get or create folder structure
  const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const folders = parentFolder.getFolders();
  let folderMap = {};
  
  while (folders.hasNext()) {
    const folder = folders.next();
    folderMap[folder.getName()] = folder.getId();
  }
  
  // Create subfolders if they don't exist
  const folderNames = ['Plans', 'Media', 'Photos', 'Clips'];
  for (const name of folderNames) {
    if (!folderMap[name]) {
      const newFolder = parentFolder.createFolder(name);
      folderMap[name] = newFolder.getId();
    }
  }
  
  let fileUrl = '';
  let driveFileId = '';
  
  if (data.fileType === 'ลิงก์วิดีโอ') {
    fileUrl = data.fileUrl;
    driveFileId = 'link';
  } else if (data.fileData) {
    // Decode base64 file data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.fileData),
      data.mimeType,
      data.fileName
    );
    
    const targetFolderId = folderMap[data.folderType] || folderMap['Plans'];
    const targetFolder = DriveApp.getFolderById(targetFolderId);
    const file = targetFolder.createFile(blob);
    
    fileUrl = file.getUrl();
    driveFileId = file.getId();
  }
  
  const timestamp = new Date().toLocaleString('th-TH');
  const row = [
    timestamp,
    data.teacherName,
    data.fileType,
    fileUrl,
    driveFileId,
    'รอตรวจสอบ'
  ];
  
  sheet.appendRow(row);
  
  return {success: true, message: 'อัพโหลดไฟล์สำเร็จ'};
}

function getFiles(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Files');
  const files = sheet.getDataRange().getValues();
  
  let result = [];
  for (let i = 1; i < files.length; i++) {
    let file = {
      id: i + 1,
      timestamp: files[i][0],
      teacherName: files[i][1],
      fileType: files[i][2],
      fileUrl: files[i][3],
      driveFileId: files[i][4],
      status: files[i][5]
    };
    
    if (data.teacherName && file.teacherName !== data.teacherName) continue;
    if (data.status && file.status !== data.status) continue;
    
    result.push(file);
  }
  
  return {success: true, data: result};
}

function updateFileStatus(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Files');
  const row = data.id;
  
  if (row < 2) return {success: false, message: 'ไม่พบไฟล์'};
  
  sheet.getRange(row, 6).setValue(data.status);
  
  return {success: true, message: 'อัพเดทสถานะสำเร็จ'};
}

// ==================== EVALUATION ====================
function createEvaluation(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Supervision');
  
  const timestamp = new Date().toLocaleString('th-TH');
  const row = [
    timestamp,
    data.teacherName,
    data.supervisionDate,
    data.strengths,
    data.improvements,
    data.suggestions,
    data.summary
  ];
  
  sheet.appendRow(row);
  
  return {success: true, message: 'บันทึกผลการประเมินสำเร็จ'};
}

function getEvaluations(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Supervision');
  const evaluations = sheet.getDataRange().getValues();
  
  let result = [];
  for (let i = 1; i < evaluations.length; i++) {
    let evaluation = {
      id: i + 1,
      timestamp: evaluations[i][0],
      teacherName: evaluations[i][1],
      supervisionDate: evaluations[i][2],
      strengths: evaluations[i][3],
      improvements: evaluations[i][4],
      suggestions: evaluations[i][5],
      summary: evaluations[i][6]
    };
    
    if (data.teacherName && evaluation.teacherName !== data.teacherName) continue;
    
    result.push(evaluation);
  }
  
  return {success: true, data: result};
}

// ==================== DASHBOARD ====================
function getDashboardStats() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Booking stats
  const bookingSheet = ss.getSheetByName('Booking');
  const bookings = bookingSheet.getDataRange().getValues();
  let totalBookings = bookings.length - 1;
  let completedBookings = 0;
  let pendingBookings = 0;
  let confirmedBookings = 0;
  let rejectedBookings = 0;
  
  for (let i = 1; i < bookings.length; i++) {
    const status = bookings[i][10];
    if (status === 'นิเทศแล้ว') completedBookings++;
    else if (status === 'รอดำเนินการ') pendingBookings++;
    else if (status === 'ยืนยันแล้ว') confirmedBookings++;
    else if (status === 'ปฏิเสธ') rejectedBookings++;
  }
  
  // File stats
  const fileSheet = ss.getSheetByName('Files');
  const files = fileSheet.getDataRange().getValues();
  let totalFiles = files.length - 1;
  let approvedFiles = 0;
  let pendingFiles = 0;
  let improvementFiles = 0;
  
  for (let i = 1; i < files.length; i++) {
    const status = files[i][5];
    if (status === 'ผ่าน') approvedFiles++;
    else if (status === 'รอตรวจสอบ') pendingFiles++;
    else if (status === 'ปรับปรุง') improvementFiles++;
  }
  
  // Evaluation stats
  const evalSheet = ss.getSheetByName('Supervision');
  const evaluations = evalSheet.getDataRange().getValues();
  let totalEvaluations = evaluations.length - 1;
  
  return {
    success: true,
    data: {
      totalBookings,
      completedBookings,
      pendingBookings,
      confirmedBookings,
      rejectedBookings,
      totalFiles,
      approvedFiles,
      pendingFiles,
      improvementFiles,
      totalEvaluations
    }
  };
}

function getCalendarData(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const bookings = sheet.getDataRange().getValues();
  
  let result = [];
  for (let i = 1; i < bookings.length; i++) {
    result.push({
      date: bookings[i][1],
      time: bookings[i][2],
      teacherName: bookings[i][3],
      department: bookings[i][4],
      status: bookings[i][10]
    });
  }
  
  return {success: true, data: result};
}

// ==================== REPORTS ====================
function getTeacherReport(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const bookingSheet = ss.getSheetByName('Booking');
  const bookings = bookingSheet.getDataRange().getValues();
  
  const fileSheet = ss.getSheetByName('Files');
  const files = fileSheet.getDataRange().getValues();
  
  const evalSheet = ss.getSheetByName('Supervision');
  const evaluations = evalSheet.getDataRange().getValues();
  
  let teacherBookings = [];
  let teacherFiles = [];
  let teacherEvals = [];
  
  for (let i = 1; i < bookings.length; i++) {
    if (bookings[i][3] === data.teacherName) {
      teacherBookings.push({
        date: bookings[i][1],
        time: bookings[i][2],
        department: bookings[i][4],
        subject: bookings[i][6],
        status: bookings[i][10]
      });
    }
  }
  
  for (let i = 1; i < files.length; i++) {
    if (files[i][1] === data.teacherName) {
      teacherFiles.push({
        fileType: files[i][2],
        fileUrl: files[i][3],
        status: files[i][5]
      });
    }
  }
  
  for (let i = 1; i < evaluations.length; i++) {
    if (evaluations[i][1] === data.teacherName) {
      teacherEvals.push({
        date: evaluations[i][2],
        strengths: evaluations[i][3],
        improvements: evaluations[i][4],
        suggestions: evaluations[i][5],
        summary: evaluations[i][6]
      });
    }
  }
  
  return {
    success: true,
    data: {
      teacherName: data.teacherName,
      bookings: teacherBookings,
      files: teacherFiles,
      evaluations: teacherEvals
    }
  };
}

function getDepartmentReport(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const bookings = sheet.getDataRange().getValues();
  
  let departments = {};
  for (let i = 1; i < bookings.length; i++) {
    const dept = bookings[i][4];
    if (!departments[dept]) {
      departments[dept] = {
        total: 0,
        completed: 0,
        pending: 0,
        teachers: new Set()
      };
    }
    departments[dept].total++;
    if (bookings[i][10] === 'นิเทศแล้ว') departments[dept].completed++;
    if (bookings[i][10] === 'รอดำเนินการ') departments[dept].pending++;
    departments[dept].teachers.add(bookings[i][3]);
  }
  
  // Convert Sets to Arrays for JSON serialization
  let result = {};
  for (const [key, value] of Object.entries(departments)) {
    result[key] = {
      total: value.total,
      completed: value.completed,
      pending: value.pending,
      teachers: Array.from(value.teachers)
    };
  }
  
  return {success: true, data: result};
}

// ==================== UTILITIES ====================
function getAllTeachers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const bookings = sheet.getDataRange().getValues();
  
  let teachers = new Set();
  for (let i = 1; i < bookings.length; i++) {
    if (bookings[i][3]) teachers.add(bookings[i][3]);
  }
  
  return {success: true, data: Array.from(teachers)};
}

function getAllDepartments() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Booking');
  const bookings = sheet.getDataRange().getValues();
  
  let departments = new Set();
  for (let i = 1; i < bookings.length; i++) {
    if (bookings[i][4]) departments.add(bookings[i][4]);
  }
  
  return {success: true, data: Array.from(departments)};
}

// ==================== SHEET SETUP ====================
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create Booking sheet if not exists
  let bookingSheet = ss.getSheetByName('Booking');
  if (!bookingSheet) {
    bookingSheet = ss.insertSheet('Booking');
    bookingSheet.appendRow([
      'Timestamp', 'Date', 'Time', 'Teacher Name', 'Department',
      'Period', 'Subject Name', 'Subject Code', 'Class Level', 'Room', 'Status'
    ]);
  }
  
  // Create Files sheet if not exists
  let filesSheet = ss.getSheetByName('Files');
  if (!filesSheet) {
    filesSheet = ss.insertSheet('Files');
    filesSheet.appendRow([
      'Timestamp', 'Teacher Name', 'File Type', 'File URL', 'Drive File ID', 'Status'
    ]);
  }
  
  // Create Supervision sheet if not exists
  let supervisionSheet = ss.getSheetByName('Supervision');
  if (!supervisionSheet) {
    supervisionSheet = ss.insertSheet('Supervision');
    supervisionSheet.appendRow([
      'Timestamp', 'Teacher Name', 'Supervision Date', 'Strengths',
      'Improvements', 'Suggestions', 'Summary'
    ]);
  }
  
  return {success: true, message: 'Setup complete'};
}

// Test function
function testConnection() {
  return {success: true, message: 'Connected to Apps Script'};
}
