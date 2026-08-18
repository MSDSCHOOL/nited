// ระบบนิเทศภายในโรงเรียนมัธยมสุไหงปาดี - Main JavaScript

// Configuration
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzsjXNduH-R_GI0NKxceO4GaPwWAhRcObQKQQzyY-WCVZw8aDSDzgBl2krJEGet3MnEdQ/exec', // Replace with actual URL
  SPREADSHEET_ID: '1HvvYyCkU2aPcdmo5zOAgUWzjBA0XXTISj64JmJramoc',
  DRIVE_FOLDER_ID: '1tbGMKsyUFQ16YjGCzNQbGRI099lCEH6k'
};

// State Management
let state = {
  currentUser: null,
  currentRole: null,
  currentPage: 'dashboard',
  calendarDate: new Date(),
  bookings: [],
  files: [],
  evaluations: [],
  stats: {}
};

// ==================== API CALLS ====================
async function apiCall(action, data = {}) {
  try {
    showLoading();
    
    // For GitHub Pages, we'll use a mock API or direct Google Sheets
    // In production, replace with actual Apps Script web app URL
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, ...data })
    });
    
    const result = await response.json();
    hideLoading();
    return result;
  } catch (error) {
    hideLoading();
    console.error('API Error:', error);
    
    // For demo purposes, return mock data
    return getMockData(action, data);
  }
}

// Mock Data for Demo
function getMockData(action, data) {
  const mockResponses = {
    login: { success: true, role: data.password === 'msd12345' ? 'admin' : 'teacher', name: data.username },
    getDashboardStats: {
      success: true,
      data: {
        totalBookings: 45,
        completedBookings: 30,
        pendingBookings: 10,
        confirmedBookings: 3,
        rejectedBookings: 2,
        totalFiles: 120,
        approvedFiles: 80,
        pendingFiles: 30,
        improvementFiles: 10,
        totalEvaluations: 35
      }
    },
    getBookings: {
      success: true,
      data: [
        { id: 1, date: '2026-08-20', time: '08:00-09:00', teacherName: 'สมชาย ใจดี', department: 'คณิตศาสตร์', period: 'คาบที่ 1', subjectName: 'คณิตศาสตร์', subjectCode: 'ค21101', classLevel: 'ม.3', room: '301', status: 'ยืนยันแล้ว' },
        { id: 2, date: '2026-08-21', time: '09:00-10:00', teacherName: 'สมหญิง รักดี', department: 'วิทยาศาสตร์', period: 'คาบที่ 2', subjectName: 'วิทยาศาสตร์', subjectCode: 'ว21101', classLevel: 'ม.2', room: '205', status: 'รอดำเนินการ' },
        { id: 3, date: '2026-08-22', time: '10:00-11:00', teacherName: 'วิชัย เก่งมาก', department: 'ภาษาไทย', period: 'คาบที่ 3', subjectName: 'ภาษาไทย', subjectCode: 'ท21101', classLevel: 'ม.1', room: '102', status: 'นิเทศแล้ว' }
      ]
    },
    getFiles: {
      success: true,
      data: [
        { id: 1, teacherName: 'สมชาย ใจดี', fileType: 'แผนการสอน', fileUrl: '#', status: 'ผ่าน' },
        { id: 2, teacherName: 'สมหญิง รักดี', fileType: 'สื่อการสอน', fileUrl: '#', status: 'รอตรวจสอบ' }
      ]
    },
    getEvaluations: {
      success: true,
      data: [
        { id: 1, teacherName: 'สมชาย ใจดี', supervisionDate: '2026-08-20', strengths: 'มีการเตรียมการสอนดี', improvements: 'ควรเพิ่มสื่อการสอน', suggestions: 'ควรใช้สื่อดิจิทัลมากขึ้น', summary: 'ดี' }
      ]
    },
    getAllTeachers: { success: true, data: ['สมชาย ใจดี', 'สมหญิง รักดี', 'วิชัย เก่งมาก', 'สุดา สวยสด'] },
    getAllDepartments: { success: true, data: ['คณิตศาสตร์', 'วิทยาศาสตร์', 'ภาษาไทย', 'ภาษาอังกฤษ', 'สังคมศึกษา'] }
  };
  
  return mockResponses[action] || { success: false, message: 'Unknown action' };
}

// ==================== AUTHENTICATION ====================
async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  if (!username || !password) {
    showAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'danger');
    return;
  }
  
  const result = await apiCall('login', { username, password });
  
  if (result.success) {
    state.currentUser = username;
    state.currentRole = result.role;
    
    localStorage.setItem('currentUser', username);
    localStorage.setItem('currentRole', result.role);
    
    showApp();
    loadDashboard();
  } else {
    showAlert(result.message, 'danger');
  }
}

function logout() {
  state.currentUser = null;
  state.currentRole = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentRole');
  
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('appContainer').style.display = 'none';
}

function checkAuth() {
  const user = localStorage.getItem('currentUser');
  const role = localStorage.getItem('currentRole');
  
  if (user && role) {
    state.currentUser = user;
    state.currentRole = role;
    showApp();
    loadDashboard();
  }
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appContainer').style.display = 'flex';
  
  // Update user info in sidebar
  document.getElementById('userName').textContent = state.currentUser;
  document.getElementById('userRole').textContent = state.currentRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ครูผู้สอน';
  
  // Show/hide admin menu
  const adminMenu = document.getElementById('adminMenu');
  if (adminMenu) {
    adminMenu.style.display = state.currentRole === 'admin' ? 'block' : 'none';
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  state.currentPage = page;
  
  // Update active menu
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  
  // Show target page
  document.getElementById(`${page}Page`).classList.add('active');
  
  // Load page data
  switch(page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'booking':
      loadBookings();
      break;
    case 'files':
      loadFiles();
      break;
    case 'evaluation':
      loadEvaluations();
      break;
    case 'admin':
      loadAdminData();
      break;
    case 'reports':
      loadReports();
      break;
  }
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  const result = await apiCall('getDashboardStats');
  
  if (result.success) {
    state.stats = result.data;
    updateDashboardStats();
    loadCalendar();
    loadRecentBookings();
    loadRecentFiles();
  }
}

function updateDashboardStats() {
  document.getElementById('totalBookings').textContent = state.stats.totalBookings;
  document.getElementById('completedBookings').textContent = state.stats.completedBookings;
  document.getElementById('pendingBookings').textContent = state.stats.pendingBookings;
  document.getElementById('totalFiles').textContent = state.stats.totalFiles;
  document.getElementById('approvedFiles').textContent = state.stats.approvedFiles;
  document.getElementById('totalEvaluations').textContent = state.stats.totalEvaluations;
}

async function loadRecentBookings() {
  const result = await apiCall('getBookings', {});
  
  if (result.success) {
    state.bookings = result.data;
    const recentBookings = result.data.slice(-5).reverse();
    
    let html = '';
    recentBookings.forEach(booking => {
      html += `
        <tr>
          <td>${formatDate(booking.date)}</td>
          <td>${booking.teacherName}</td>
          <td>${booking.department}</td>
          <td>${booking.time}</td>
          <td><span class="badge badge-${getStatusClass(booking.status)}">${booking.status}</span></td>
        </tr>
      `;
    });
    
    document.getElementById('recentBookingsTable').innerHTML = html;
  }
}

async function loadRecentFiles() {
  const result = await apiCall('getFiles', {});
  
  if (result.success) {
    state.files = result.data;
    const recentFiles = result.data.slice(-5).reverse();
    
    let html = '';
    recentFiles.forEach(file => {
      html += `
        <tr>
          <td>${file.teacherName}</td>
          <td>${file.fileType}</td>
          <td><span class="badge badge-${getStatusClass(file.status)}">${file.status}</span></td>
        </tr>
      `;
    });
    
    document.getElementById('recentFilesTable').innerHTML = html;
  }
}

// ==================== CALENDAR ====================
function loadCalendar() {
  const date = state.calendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();
  
  document.getElementById('calendarMonth').textContent = getMonthName(month) + ' ' + year;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  let html = '';
  
  // Day headers
  const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  days.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month"><div class="day-number">${prevMonthDays - i}</div></div>`;
  }
  
  // Current month days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    const bookingsOnDay = state.bookings.filter(b => b.date === dateStr);
    
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (bookingsOnDay.length > 0) classes += ' has-booking';
    
    html += `
      <div class="${classes}" onclick="showDayBookings('${dateStr}')">
        <div class="day-number">${day}</div>
        ${bookingsOnDay.length > 0 ? `<div class="booking-indicator">${bookingsOnDay.length} รายการ</div>` : ''}
      </div>
    `;
  }
  
  // Next month days
  const remainingDays = 42 - (startDay + daysInMonth);
  for (let day = 1; day <= remainingDays; day++) {
    html += `<div class="calendar-day other-month"><div class="day-number">${day}</div></div>`;
  }
  
  document.getElementById('calendarGrid').innerHTML = html;
}

function prevMonth() {
  state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
  loadCalendar();
}

function nextMonth() {
  state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
  loadCalendar();
}

function showDayBookings(dateStr) {
  const bookingsOnDay = state.bookings.filter(b => b.date === dateStr);
  
  if (bookingsOnDay.length === 0) {
    showAlert('ไม่มีการจองในวันนี้', 'info');
    return;
  }
  
  let html = '';
  bookingsOnDay.forEach(booking => {
    html += `
      <div class="card mb-2">
        <p><strong>เวลา:</strong> ${booking.time}</p>
        <p><strong>ครู:</strong> ${booking.teacherName}</p>
        <p><strong>กลุ่มสาระ:</strong> ${booking.department}</p>
        <p><strong>วิชา:</strong> ${booking.subjectName}</p>
        <p><strong>สถานะ:</strong> <span class="badge badge-${getStatusClass(booking.status)}">${booking.status}</span></p>
      </div>
    `;
  });
  
  showModal('การจองวันที่ ' + formatDate(dateStr), html);
}

// ==================== BOOKING ====================
async function loadBookings() {
  const filter = {};
  
  if (state.currentRole === 'teacher') {
    filter.teacherName = state.currentUser;
  }
  
  const result = await apiCall('getBookings', filter);
  
  if (result.success) {
    state.bookings = result.data;
    renderBookingsTable(result.data);
  }
}

function renderBookingsTable(bookings) {
  let html = '';
  bookings.forEach(booking => {
    html += `
      <tr>
        <td>${booking.id}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.time}</td>
        <td>${booking.teacherName}</td>
        <td>${booking.department}</td>
        <td>${booking.period}</td>
        <td>${booking.subjectName}</td>
        <td>${booking.classLevel}</td>
        <td>${booking.room}</td>
        <td><span class="badge badge-${getStatusClass(booking.status)}">${booking.status}</span></td>
        <td>
          ${state.currentRole === 'admin' ? `
            <button class="btn btn-sm btn-success" onclick="updateBookingStatus(${booking.id}, 'ยืนยันแล้ว')">ยืนยัน</button>
            <button class="btn btn-sm btn-danger" onclick="updateBookingStatus(${booking.id}, 'ปฏิเสธ')">ปฏิเสธ</button>
          ` : ''}
          ${booking.status === 'ยืนยันแล้ว' && state.currentRole === 'teacher' ? `
            <button class="btn btn-sm btn-info" onclick="markAsCompleted(${booking.id})">นิเทศแล้ว</button>
          ` : ''}
        </td>
      </tr>
    `;
  });
  
  document.getElementById('bookingsTableBody').innerHTML = html;
}

function showBookingForm() {
  showModal('จองวันนิเทศ', getBookingFormHTML());
  initBookingForm();
}

function getBookingFormHTML() {
  return `
    <form id="bookingForm" onsubmit="submitBooking(event)">
      <div class="form-row">
        <div class="form-group">
          <label>วันที่นิเทศ</label>
          <input type="date" id="bookingDate" required>
        </div>
        <div class="form-group">
          <label>ช่วงเวลา</label>
          <select id="bookingTime" required>
            <option value="">เลือกช่วงเวลา</option>
            <option value="08:00-09:00">08:00-09:00</option>
            <option value="09:00-10:00">09:00-10:00</option>
            <option value="10:00-11:00">10:00-11:00</option>
            <option value="11:00-12:00">11:00-12:00</option>
            <option value="13:00-14:00">13:00-14:00</option>
            <option value="14:00-15:00">14:00-15:00</option>
            <option value="15:00-16:00">15:00-16:00</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>กลุ่มสาระ</label>
          <select id="bookingDepartment" required>
            <option value="">เลือกกลุ่มสาระ</option>
            <option value="คณิตศาสตร์">คณิตศาสตร์</option>
            <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
            <option value="ภาษาไทย">ภาษาไทย</option>
            <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
            <option value="สังคมศึกษา">สังคมศึกษา</option>
            <option value="พลศึกษา">พลศึกษา</option>
            <option value="ศิลปะ">ศิลปะ</option>
            <option value="การงานอาชีพ">การงานอาชีพ</option>
          </select>
        </div>
        <div class="form-group">
          <label>คาบที่</label>
          <select id="bookingPeriod" required>
            <option value="">เลือกคาบที่</option>
            <option value="คาบที่ 1">คาบที่ 1</option>
            <option value="คาบที่ 2">คาบที่ 2</option>
            <option value="คาบที่ 3">คาบที่ 3</option>
            <option value="คาบที่ 4">คาบที่ 4</option>
            <option value="คาบที่ 5">คาบที่ 5</option>
            <option value="คาบที่ 6">คาบที่ 6</option>
            <option value="คาบที่ 7">คาบที่ 7</option>
            <option value="คาบที่ 8">คาบที่ 8</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>ชื่อวิชา</label>
          <input type="text" id="bookingSubject" required>
        </div>
        <div class="form-group">
          <label>รหัสวิชา</label>
          <input type="text" id="bookingSubjectCode" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>ระดับชั้น</label>
          <select id="bookingClassLevel" required>
            <option value="">เลือกระดับชั้น</option>
            <option value="ม.1">ม.1</option>
            <option value="ม.2">ม.2</option>
            <option value="ม.3">ม.3</option>
            <option value="ม.4">ม.4</option>
            <option value="ม.5">ม.5</option>
            <option value="ม.6">ม.6</option>
          </select>
        </div>
        <div class="form-group">
          <label>ห้องเรียน</label>
          <input type="text" id="bookingRoom" required>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">ยืนยันการจอง</button>
      </div>
    </form>
  `;
}

function initBookingForm() {
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;
  
  // Pre-fill teacher name
  if (state.currentRole === 'teacher') {
    document.getElementById('bookingTeacherName')?.value = state.currentUser;
  }
}

async function submitBooking(e) {
  e.preventDefault();
  
  const data = {
    date: document.getElementById('bookingDate').value,
    time: document.getElementById('bookingTime').value,
    teacherName: state.currentUser,
    department: document.getElementById('bookingDepartment').value,
    period: document.getElementById('bookingPeriod').value,
    subjectName: document.getElementById('bookingSubject').value,
    subjectCode: document.getElementById('bookingSubjectCode').value,
    classLevel: document.getElementById('bookingClassLevel').value,
    room: document.getElementById('bookingRoom').value
  };
  
  const result = await apiCall('createBooking', data);
  
  if (result.success) {
    showAlert('จองวันนิเทศสำเร็จ', 'success');
    closeModal();
    loadBookings();
  } else {
    showAlert(result.message, 'danger');
  }
}

async function updateBookingStatus(id, status) {
  if (!confirm(`ต้องการ${status === 'ยืนยันแล้ว' ? 'ยืนยัน' : 'ปฏิเสธ'}การจองนี้หรือไม่?`)) {
    return;
  }
  
  const result = await apiCall('updateBooking', { id, status });
  
  if (result.success) {
    showAlert('อัพเดทสถานะสำเร็จ', 'success');
    loadBookings();
  } else {
    showAlert(result.message, 'danger');
  }
}

async function markAsCompleted(id) {
  if (!confirm('ยืนยันว่าได้นิเทศแล้วหรือไม่?')) {
    return;
  }
  
  const result = await apiCall('updateBooking', { id, status: 'นิเทศแล้ว' });
  
  if (result.success) {
    showAlert('บันทึกสำเร็จ', 'success');
    loadBookings();
  } else {
    showAlert(result.message, 'danger');
  }
}

// ==================== FILES ====================
async function loadFiles() {
  const filter = {};
  
  if (state.currentRole === 'teacher') {
    filter.teacherName = state.currentUser;
  }
  
  const result = await apiCall('getFiles', filter);
  
  if (result.success) {
    state.files = result.data;
    renderFilesTable(result.data);
  }
}

function renderFilesTable(files) {
  let html = '';
  files.forEach(file => {
    html += `
      <tr>
        <td>${file.id}</td>
        <td>${formatDate(file.timestamp)}</td>
        <td>${file.teacherName}</td>
        <td>${file.fileType}</td>
        <td><a href="${file.fileUrl}" target="_blank">เปิดดู</a></td>
        <td><span class="badge badge-${getStatusClass(file.status)}">${file.status}</span></td>
        <td>
          ${state.currentRole === 'admin' ? `
            <button class="btn btn-sm btn-success" onclick="updateFileStatus(${file.id}, 'ผ่าน')">อนุมัติ</button>
            <button class="btn btn-sm btn-warning" onclick="updateFileStatus(${file.id}, 'ปรับปรุง')">ขอแก้ไข</button>
          ` : ''}
        </td>
      </tr>
    `;
  });
  
  document.getElementById('filesTableBody').innerHTML = html;
}

function showUploadForm() {
  showModal('อัพโหลดไฟล์งาน', getUploadFormHTML());
}

function getUploadFormHTML() {
  return `
    <form id="uploadForm" onsubmit="submitFile(event)">
      <div class="form-group">
        <label>ประเภทไฟล์</label>
        <select id="fileType" required onchange="toggleFileInput()">
          <option value="">เลือกประเภทไฟล์</option>
          <option value="แผนการสอน">แผนการสอน (PDF/Word)</option>
          <option value="สื่อการสอน">สื่อการสอน (รูปภาพ/PPT/PDF)</option>
          <option value="ภาพกิจกรรม">ภาพกิจกรรม (รูปภาพ)</option>
          <option value="ลิงก์วิดีโอ">คลิปวิดีโอ (YouTube/Drive)</option>
        </select>
      </div>
      <div class="form-group" id="fileUploadGroup">
        <label>เลือกไฟล์</label>
        <div class="file-upload-area" onclick="document.getElementById('fileInput').click()">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>คลิกเพื่อเลือกไฟล์</p>
          <p class="text-muted">หรือลากและวางไฟล์ที่นี่</p>
        </div>
        <input type="file" id="fileInput" style="display:none" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png">
      </div>
      <div class="form-group hidden" id="videoUrlGroup">
        <label>ลิงก์วิดีโอ</label>
        <input type="url" id="videoUrl" placeholder="https://www.youtube.com/watch?v=...">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">อัพโหลด</button>
      </div>
    </form>
  `;
}

function toggleFileInput() {
  const fileType = document.getElementById('fileType').value;
  const fileUploadGroup = document.getElementById('fileUploadGroup');
  const videoUrlGroup = document.getElementById('videoUrlGroup');
  
  if (fileType === 'ลิงก์วิดีโอ') {
    fileUploadGroup.classList.add('hidden');
    videoUrlGroup.classList.remove('hidden');
  } else {
    fileUploadGroup.classList.remove('hidden');
    videoUrlGroup.classList.add('hidden');
  }
}

async function submitFile(e) {
  e.preventDefault();
  
  const fileType = document.getElementById('fileType').value;
  
  if (fileType === 'ลิงก์วิดีโอ') {
    const videoUrl = document.getElementById('videoUrl').value;
    
    const result = await apiCall('uploadFile', {
      teacherName: state.currentUser,
      fileType: fileType,
      fileUrl: videoUrl,
      fileType: 'ลิงก์วิดีโอ'
    });
    
    if (result.success) {
      showAlert('บันทึกลิงก์สำเร็จ', 'success');
      closeModal();
      loadFiles();
    } else {
      showAlert(result.message, 'danger');
    }
  } else {
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput.files.length) {
      showAlert('กรุณาเลือกไฟล์', 'danger');
      return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(event) {
      const base64 = event.target.result.split(',')[1];
      
      const folderMap = {
        'แผนการสอน': 'Plans',
        'สื่อการสอน': 'Media',
        'ภาพกิจกรรม': 'Photos'
      };
      
      const result = await apiCall('uploadFile', {
        teacherName: state.currentUser,
        fileType: fileType,
        fileData: base64,
        fileName: file.name,
        mimeType: file.type,
        folderType: folderMap[fileType]
      });
      
      if (result.success) {
        showAlert('อัพโหลดไฟล์สำเร็จ', 'success');
        closeModal();
        loadFiles();
      } else {
        showAlert(result.message, 'danger');
      }
    };
    
    reader.readAsDataURL(file);
  }
}

async function updateFileStatus(id, status) {
  const message = status === 'ผ่าน' ? 'อนุมัติ' : 'ขอแก้ไข';
  
  if (!confirm(`ต้องการ${message}ไฟล์นี้หรือไม่?`)) {
    return;
  }
  
  const result = await apiCall('updateFileStatus', { id, status });
  
  if (result.success) {
    showAlert('อัพเดทสถานะสำเร็จ', 'success');
    loadFiles();
  } else {
    showAlert(result.message, 'danger');
  }
}

// ==================== EVALUATION ====================
async function loadEvaluations() {
  const filter = {};
  
  if (state.currentRole === 'teacher') {
    filter.teacherName = state.currentUser;
  }
  
  const result = await apiCall('getEvaluations', filter);
  
  if (result.success) {
    state.evaluations = result.data;
    renderEvaluationsTable(result.data);
  }
}

function renderEvaluationsTable(evaluations) {
  let html = '';
  evaluations.forEach(evaluation => {
    html += `
      <tr>
        <td>${evaluation.id}</td>
        <td>${formatDate(evaluation.supervisionDate)}</td>
        <td>${evaluation.teacherName}</td>
        <td>${evaluation.strengths}</td>
        <td>${evaluation.improvements}</td>
        <td>${evaluation.suggestions}</td>
        <td><span class="badge badge-${getSummaryClass(evaluation.summary)}">${evaluation.summary}</span></td>
      </tr>
    `;
  });
  
  document.getElementById('evaluationsTableBody').innerHTML = html;
}

function showEvaluationForm() {
  if (state.currentRole !== 'admin') {
    showAlert('เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถประเมินได้', 'warning');
    return;
  }
  
  showModal('บันทึกผลการประเมิน', getEvaluationFormHTML());
  loadTeacherList();
}

function getEvaluationFormHTML() {
  return `
    <form id="evaluationForm" onsubmit="submitEvaluation(event)">
      <div class="form-group">
        <label>เลือกครูที่นิเทศ</label>
        <select id="evalTeacherName" required>
          <option value="">เลือกครู</option>
        </select>
      </div>
      <div class="form-group">
        <label>วันที่นิเทศ</label>
        <input type="date" id="evalDate" required>
      </div>
      <div class="form-group">
        <label>จุดเด่น</label>
        <textarea id="evalStrengths" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>จุดพัฒนา</label>
        <textarea id="evalImprovements" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>ข้อเสนอแนะ</label>
        <textarea id="evalSuggestions" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>ระดับคุณภาพ</label>
        <select id="evalSummary" required>
          <option value="">เลือกระดับ</option>
          <option value="ดีมาก">ดีมาก</option>
          <option value="ดี">ดี</option>
          <option value="พอใช้">พอใช้</option>
          <option value="ปรับปรุง">ปรับปรุง</option>
        </select>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">บันทึกผลการประเมิน</button>
      </div>
    </form>
  `;
}

async function loadTeacherList() {
  const result = await apiCall('getAllTeachers');
  
  if (result.success) {
    const select = document.getElementById('evalTeacherName');
    result.data.forEach(teacher => {
      const option = document.createElement('option');
      option.value = teacher;
      option.textContent = teacher;
      select.appendChild(option);
    });
  }
}

async function submitEvaluation(e) {
  e.preventDefault();
  
  const data = {
    teacherName: document.getElementById('evalTeacherName').value,
    supervisionDate: document.getElementById('evalDate').value,
    strengths: document.getElementById('evalStrengths').value,
    improvements: document.getElementById('evalImprovements').value,
    suggestions: document.getElementById('evalSuggestions').value,
    summary: document.getElementById('evalSummary').value
  };
  
  const result = await apiCall('createEvaluation', data);
  
  if (result.success) {
    showAlert('บันทึกผลการประเมินสำเร็จ', 'success');
    closeModal();
    loadEvaluations();
  } else {
    showAlert(result.message, 'danger');
  }
}

// ==================== ADMIN ====================
async function loadAdminData() {
  if (state.currentRole !== 'admin') {
    showAlert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'danger');
    return;
  }
  
  loadBookings();
}

// ==================== REPORTS ====================
async function loadReports() {
  // Load department report
  const deptResult = await apiCall('getDepartmentReport');
  
  if (deptResult.success) {
    renderDepartmentReport(deptResult.data);
  }
}

function renderDepartmentReport(data) {
  let html = '';
  
  for (const [dept, stats] of Object.entries(data)) {
    html += `
      <tr>
        <td>${dept}</td>
        <td>${stats.total}</td>
        <td>${stats.completed}</td>
        <td>${stats.pending}</td>
        <td>${stats.teachers.length}</td>
      </tr>
    `;
  }
  
  document.getElementById('departmentReportBody').innerHTML = html;
}

async function generateTeacherReport() {
  const teacherName = document.getElementById('reportTeacherSelect').value;
  
  if (!teacherName) {
    showAlert('กรุณาเลือกครู', 'danger');
    return;
  }
  
  const result = await apiCall('getTeacherReport', { teacherName });
  
  if (result.success) {
    renderTeacherReport(result.data);
  }
}

function renderTeacherReport(data) {
  let html = `
    <h3>รายงานรายบุคคล: ${data.teacherName}</h3>
    
    <h4>ประวัติการจอง (${data.bookings.length} รายการ)</h4>
    <table>
      <thead>
        <tr>
          <th>วันที่</th>
          <th>เวลา</th>
          <th>กลุ่มสาระ</th>
          <th>วิชา</th>
          <th>สถานะ</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  data.bookings.forEach(b => {
    html += `
      <tr>
        <td>${formatDate(b.date)}</td>
        <td>${b.time}</td>
        <td>${b.department}</td>
        <td>${b.subject}</td>
        <td><span class="badge badge-${getStatusClass(b.status)}">${b.status}</span></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
    
    <h4>ไฟล์งาน (${data.files.length} รายการ)</h4>
    <table>
      <thead>
        <tr>
          <th>ประเภท</th>
          <th>สถานะ</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  data.files.forEach(f => {
    html += `
      <tr>
        <td>${f.fileType}</td>
        <td><span class="badge badge-${getStatusClass(f.status)}">${f.status}</span></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
    
    <h4>ผลการประเมิน (${data.evaluations.length} รายการ)</h4>
    <table>
      <thead>
        <tr>
          <th>วันที่</th>
          <th>จุดเด่น</th>
          <th>จุดพัฒนา</th>
          <th>ระดับ</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  data.evaluations.forEach(e => {
    html += `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.strengths}</td>
        <td>${e.improvements}</td>
        <td><span class="badge badge-${getSummaryClass(e.summary)}">${e.summary}</span></td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  
  document.getElementById('teacherReportContent').innerHTML = html;
}

// ==================== UTILITIES ====================
function formatDate(dateStr) {
  if (!dateStr) return '-';
  
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('th-TH', options);
}

function getMonthName(month) {
  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                   'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  return months[month];
}

function getStatusClass(status) {
  const classes = {
    'รอดำเนินการ': 'pending',
    'ยืนยันแล้ว': 'confirmed',
    'นิเทศแล้ว': 'completed',
    'ปฏิเสธ': 'rejected',
    'รอตรวจสอบ': 'pending',
    'ผ่าน': 'approved',
    'ปรับปรุง': 'improvement'
  };
  return classes[status] || 'pending';
}

function getSummaryClass(summary) {
  const classes = {
    'ดีมาก': 'approved',
    'ดี': 'confirmed',
    'พอใช้': 'pending',
    'ปรับปรุง': 'improvement'
  };
  return classes[summary] || 'pending';
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>${message}`;
  
  const container = document.querySelector('.main-content');
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

function showModal(title, content) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function showLoading() {
  document.querySelector('.loading').classList.add('active');
}

function hideLoading() {
  document.querySelector('.loading')?.classList.remove('active');
}

function printReport() {
  window.print();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  // Close modal on overlay click
  document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});
