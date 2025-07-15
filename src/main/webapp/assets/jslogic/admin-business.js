// ... existing code ...

function convertShift(shiftVi) {
    switch (shiftVi) {
        case 'Sáng': return 'Morning';
        case 'Chiều': return 'Afternoon';
        case 'Tối': return 'Evening';
        default: return shiftVi;
    }
}
// Hàm mở modal danh sách bác sĩ
async function openDoctorListModal() {
    const res = await fetch('/api/doctors');
    const doctors = await res.json();
    const container = document.getElementById('doctorListContainer');
    container.innerHTML = doctors.map(d => `
        <div class="col-xl-3 col-lg-4 col-sm-6 mb-4">
            <div class="card h-100 shadow-sm border-0 hover-shadow transition-all" 
                 tabindex="0" 
                 role="button" 
                 aria-label="Tạo lịch cho bác sĩ ${d.fullName}"
                 onclick="openCreateScheduleModal(${d.doctorId}, '${d.fullName.replace(/'/g, "\\'")}', '${d.department.replace(/'/g, "\\'")}')">
                <div class="card-body text-center">
                    <img src="${d.avatar || '/assets/images/avatars/default.png'}" class="rounded-circle mb-2" width="80" height="80" alt="avatar">
                    <h5 class="fw-bold mb-1">${d.fullName}</h5>
                    <p class="text-muted"><i class="fas fa-stethoscope me-1"></i>${d.department}</p>
                    <button class="btn btn-outline-primary mt-2" 
                        onclick="event.stopPropagation(); openCreateScheduleModal(${d.doctorId}, '${d.fullName.replace(/'/g, "\\'")}', '${d.department.replace(/'/g, "\\'")}')">
                        <i class="fas fa-calendar-plus me-2"></i>Tạo lịch
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    var myModal = new bootstrap.Modal(document.getElementById('doctorListModal'));
    myModal.show();
}

// Gán lại sự kiện cho nút
const addBtn = document.getElementById('addDoctorScheduleBtn');
if (addBtn) addBtn.onclick = openDoctorListModal;

async function loadAvailableRooms() {
    const res = await fetch('/api/rooms/available');
    const rooms = await res.json();
    console.log(rooms); // Đã có
    const select = document.getElementById('roomId');
    console.log(select); // Thêm dòng này
    if (!select) alert('Không tìm thấy select#roomId trong DOM!');
    select.innerHTML = rooms.map(r => `<option value="${r.roomId}">${r.roomName}</option>`).join('');
}

// Hàm mở modal tạo lịch
window.openCreateScheduleModal = function(doctorId, fullName, department) {
    document.getElementById('modalDoctorId').value = doctorId;

    document.getElementById('modalDoctorName').value = fullName + ' (' + department + ')';
    loadAvailableRooms(); // <-- Thêm dòng này để load phòng
    var myModal = new bootstrap.Modal(document.getElementById('createScheduleModal'));
    myModal.show();
}

function isValidScheduleDate(workingDate, shift) {
    const today = new Date();
    const inputDate = new Date(workingDate);
    // So sánh ngày
    if (inputDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        return { valid: false, message: "Ngày làm việc phải từ hôm nay trở đi." };
    }
    // Nếu là hôm nay, kiểm tra ca làm
    if (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
    ) {
        // Lấy giờ hiện tại
        const nowHour = today.getHours();
        // Quy ước: Sáng < Chiều < Tối
        const shiftOrder = { "Morning": 1, "Afternoon": 2, "Evening": 3 };
        let currentShift;
        if (nowHour < 12) currentShift = "Morning";
        else if (nowHour < 18) currentShift = "Afternoon";
        else currentShift = "Evening";
        if (shiftOrder[shift] <= shiftOrder[currentShift]) {
            return { valid: false, message: "Ca làm phải lớn hơn ca hiện tại." };
        }
    }
    return { valid: true };
}

// Xử lý submit form tạo lịch
const scheduleForm = document.getElementById('scheduleForm');
if (scheduleForm) {
    scheduleForm.onsubmit = async function(e) {
        e.preventDefault();
        const doctorId = document.getElementById('modalDoctorId').value;
        const workingDate = document.getElementById('workingDate').value;
        const shift = convertShift(document.getElementById('shift').value);
        const roomId = document.getElementById('roomId').value;
        const note = document.getElementById('note').value;

        // Validate ngày và ca
        const dateCheck = isValidScheduleDate(workingDate, shift);
        if (!dateCheck.valid) {
            alert("❌ " + dateCheck.message);
            return;
        }
        // Validate các trường khác nếu cần
        if (!roomId) {
            alert("❌ Vui lòng chọn phòng.");
            return;
        }
        console.log(doctorId);
        console.log(workingDate);
        console.log(shift);
        console.log(roomId);
        console.log(note);
        // Check trùng lịch
        const checkUrl = `/api/schedule/check?doctorId=${doctorId}&workingDate=${workingDate}&shift=${shift}`;
        const checkRes = await fetch(checkUrl);
        const result = await checkRes.json();
        if (result.exists) {
            alert("❌ Bác sĩ đã có lịch trong ca này.");
            return;
        }
        // Gửi tạo lịch
        const createRes = await fetch('/api/schedule/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include', // 👈 BẮT BUỘC để gửi cookie session
            body: JSON.stringify({
                doctorId,
                workingDate,
                shift,
                roomId,
                note
            })
        });
        if (createRes.ok) {
            const data = await createRes.json();
            if (data.success) {
                alert("✅ Tạo lịch thành công!");
                scheduleForm.reset();
                bootstrap.Modal.getInstance(document.getElementById('createScheduleModal')).hide();
            } else {
                alert("⚠️ Tạo lịch thất bại: " + data.message);
            }
        } else if (createRes.status === 401) {
            console.log("🚫 Bạn chưa đăng nhập hoặc không có quyền!");
        } else {
            alert("⚠️ Lỗi tạo lịch.");
        }
    }
}

// ... existing code ...