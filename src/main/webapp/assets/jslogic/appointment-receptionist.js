// appointment-receptionist.js

let allAppointments = [];
let filteredAppointments = [];
let currentPage = 1;
let pageSize = 25;
let currentAppointmentId = null;
// Thêm biến để xác định chế độ chỉnh sửa
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function() {
    loadAllAppointments();
    setupEventListeners();
});

function setupEventListeners() {
    // Filter event listeners
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('shiftFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('pageSize').addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderAppointments();
    });
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function loadAllAppointments() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const tableBody = document.getElementById('appointmentsTableBody');
    const noDataMessage = document.getElementById('noDataMessage');

    try {
        // Show loading
        loadingIndicator.style.display = 'block';
        tableBody.innerHTML = '';
        noDataMessage.style.display = 'none';

        const response = await fetch('/api/receptionist/appointment?action=getAllAppointments', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const appointments = await response.json();
        allAppointments = Array.isArray(appointments) ? appointments : [];
        filteredAppointments = [...allAppointments];
        
        renderAppointments();

    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('Không thể tải lịch hẹn. Vui lòng thử lại.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const shiftFilter = document.getElementById('shiftFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    filteredAppointments = allAppointments.filter(appointment => {
        // Status filter
        if (statusFilter && appointment.status !== statusFilter) {
            return false;
        }

        // Shift filter
        if (shiftFilter && appointment.shift !== shiftFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchFields = [
                appointment.full_name || '',
                appointment.doctor_full_name || '',
                appointment.doctor_department || '',
                appointment.note || ''
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderAppointments();
}

function renderAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const table = document.getElementById('appointmentsTable');

    if (filteredAppointments.length === 0) {
        tableBody.innerHTML = '';
        table.style.display = 'none';
        noDataMessage.style.display = 'block';
        renderPagination(0);
        return;
    }

    table.style.display = 'table';
    noDataMessage.style.display = 'none';

    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const appointmentsToShow = filteredAppointments.slice(startIndex, endIndex);

    // Render table rows
    tableBody.innerHTML = appointmentsToShow.map(appointment => `
        <tr>
            <td>${appointment.appointment_id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-bold">${escapeHtml(appointment.full_name || 'Không có')}</div>
                        <small class="text-muted">${escapeHtml(appointment.phone || 'Không có')}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="fw-bold">${escapeHtml(appointment.doctor_full_name || 'Không có')}</div>
            </td>
            <td>
                <span class="badge bg-info">${escapeHtml(appointment.doctor_department || 'Không có')}</span>
            </td>
            <td>
                <div>${formatDateTime(appointment.appointment_datetime)}</div>
            </td>
            <td>
                <span class="badge ${getShiftBadgeClass(appointment.shift)}">${getShiftVN(appointment.shift || 'Không có')}</span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(appointment.status)}">${getStatusVN(appointment.status || 'Không có')}</span>
            </td>
            <td>
                <div class="text-truncate" style="max-width: 150px;" title="${escapeHtml(appointment.note || '')}">
                    ${escapeHtml(appointment.note || 'Không có ghi chú')}
                </div>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-primary text-white select-patient-btn" 
                            onclick="viewAppointmentDetail(${appointment.appointment_id})" 
                            data-appointment-id="${appointment.appointment_id}" 
                            data-action="view">
                        <i class="fas fa-eye me-1"></i>Xem
                    </button>
                    <button type="button" class="btn btn-warning text-white select-patient-btn" 
                            onclick="editAppointment(${appointment.appointment_id})" 
                            data-appointment-id="${appointment.appointment_id}" 
                            data-action="edit">
                        <i class="fas fa-edit me-1"></i>Chỉnh sửa
                    </button>
                    ${appointment.status === 'Pending' ? `
                        <button type="button" class="btn btn-success text-white select-patient-btn" 
                                onclick="confirmAppointment(${appointment.appointment_id})" 
                                data-appointment-id="${appointment.appointment_id}" 
                                data-action="confirm">
                            <i class="fas fa-check-circle me-1"></i>Xác nhận
                        </button>
                        <button type="button" class="btn btn-secondary text-white select-patient-btn" 
                                onclick="cancelAppointment(${appointment.appointment_id})" 
                                data-appointment-id="${appointment.appointment_id}" 
                                data-action="cancel">
                            <i class="fas fa-times-circle me-1"></i>Hủy
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    renderPagination(filteredAppointments.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Trước</a>
        </li>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += '<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>';
        if (startPage > 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Tiếp</a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredAppointments.length / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderAppointments();
    }
}

function viewAppointmentDetail(appointmentId, isEdit = false) {
    const appointment = allAppointments.find(app => app.appointment_id === appointmentId);
    if (!appointment) {
        showError('Không tìm thấy lịch hẹn');
        return;
    }
    currentAppointmentId = appointmentId;
    isEditMode = isEdit;

    // Populate modal with appointment details
    document.getElementById('modalAppointmentId').textContent = appointment.appointment_id;
    document.getElementById('modalPatientName').textContent = appointment.full_name || 'Không có';
    document.getElementById('modalPatientPhone').textContent = appointment.phone || 'Không có';
    document.getElementById('modalPatientDob').textContent = appointment.dob || 'Không có';
    document.getElementById('modalPatientGender').textContent = appointment.gender || 'Không có';
    document.getElementById('modalDoctorName').textContent = appointment.doctor_full_name || 'Không có';
    document.getElementById('modalDoctorDepartment').textContent = appointment.doctor_department || 'Không có';
    document.getElementById('modalDateTime').textContent = formatDateTime(appointment.appointment_datetime);
    document.getElementById('modalShift').textContent = getShiftVN(appointment.shift) || 'Không có';
    document.getElementById('modalStatus').textContent = getStatusVN(appointment.status) || 'Không có';
    document.getElementById('modalNote').textContent = appointment.note || 'Không có ghi chú';

    // Nếu là chế độ chỉnh sửa, chuyển các trường sang input
    if (isEdit) {
        // Thay các span thành input (chỉ demo cho các trường cơ bản, bạn có thể mở rộng thêm)
        document.getElementById('modalDoctorName').innerHTML = `<input type='text' id='editDoctorName' class='form-control' value='${appointment.doctor_full_name || ''}'>`;
        document.getElementById('modalDoctorDepartment').innerHTML = `<input type='text' id='editDoctorDepartment' class='form-control' value='${appointment.doctor_department || ''}'>`;
        document.getElementById('modalDateTime').innerHTML = `<input type='datetime-local' id='editDateTime' class='form-control' value='${appointment.appointment_datetime ? appointment.appointment_datetime.substring(0,16) : ''}'>`;
        document.getElementById('modalShift').innerHTML = `<select id='editShift' class='form-control'><option value='Sáng'>Sáng</option><option value='Chiều'>Chiều</option><option value='Tối'>Tối</option></select>`;
        document.getElementById('modalNote').innerHTML = `<textarea id='editNote' class='form-control'>${appointment.note || ''}</textarea>`;
        // Set shift value
        document.getElementById('editShift').value = appointment.shift || 'Sáng';
        // Ẩn nút Chỉnh sửa, hiện nút Lưu
        document.getElementById('btnEditAppointment').style.display = 'none';
        document.getElementById('btnSaveAppointment').style.display = 'inline-block';
    } else {
        document.getElementById('btnEditAppointment').style.display = 'inline-block';
        document.getElementById('btnSaveAppointment').style.display = 'none';
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('appointmentDetailModal'));
    modal.show();
}

function editAppointment(appointmentId) {
    viewAppointmentDetail(appointmentId, true);
}

// Lưu chỉnh sửa lịch hẹn
function saveAppointmentEdit() {
    const appointmentId = currentAppointmentId;
    // Lấy lại thông tin từ input
    // Lưu ý: Để chuẩn, bạn nên dùng select cho bác sĩ, bệnh nhân, ca, ...
    const doctorName = document.getElementById('editDoctorName').value;
    const doctorDepartment = document.getElementById('editDoctorDepartment').value;
    const appointmentDateTime = document.getElementById('editDateTime').value;
    const shift = document.getElementById('editShift').value;
    const note = document.getElementById('editNote').value;
    // Ở đây cần mapping doctorName/department về doctorId, demo tạm lấy lại doctorId cũ
    const appointment = allAppointments.find(app => app.appointment_id === appointmentId);
    const doctorId = appointment.doctor_id;
    const patientId = appointment.patient_id;

    fetch('/api/receptionist/appointment', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'edit',
            appointmentId,
            doctorId,
            patientId,
            appointmentDateTime: appointmentDateTime.replace('T', ' ') + ':00',
            shift,
            note
        })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showSuccess('Cập nhật lịch hẹn thành công!');
            refreshAppointments();
            bootstrap.Modal.getInstance(document.getElementById('appointmentDetailModal')).hide();
        } else {
            showError(result.message || 'Cập nhật lịch hẹn thất bại!');
        }
    })
    .catch(() => showError('Lỗi hệ thống. Vui lòng thử lại sau.'));
}

// Sửa lại hàm cancelAppointment để gọi API thực sự
function cancelAppointment(appointmentId) {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) {
        return;
    }
    fetch('/api/receptionist/appointment', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'cancel',
            appointmentId
        })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showSuccess('Hủy lịch hẹn thành công!');
            refreshAppointments();
        } else {
            showError(result.message || 'Hủy lịch hẹn thất bại!');
        }
    })
    .catch(() => showError('Lỗi hệ thống. Vui lòng thử lại sau.'));
}

function confirmAppointment(appointmentId) {
    console.log('confirmAppointment called with ID:', appointmentId, 'Type:', typeof appointmentId);
    if (!confirm('Bạn có chắc chắn muốn xác nhận lịch hẹn này không?')) {
        return;
    }

    const payload = {
        action: 'confirm',
        appointmentId: Number(appointmentId)
    };
    console.log('Sending payload:', payload);

    fetch('/api/receptionist/appointment', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        console.log('Response status:', res.status);
        return res.json().then(data => ({ ok: res.ok, data }));
    })
    .then(result => {
        console.log('Response data:', result);
        if (result.ok && result.data.success) {
            showSuccess('Lịch hẹn đã được xác nhận và thêm vào danh sách chờ!');
            refreshAppointments();
        } else {
            showError(result.data.message || 'Xác nhận lịch hẹn thất bại.');
        }
    })
    .catch(err => {
        console.error('Error confirming appointment:', err);
        showError('Lỗi hệ thống. Vui lòng thử lại sau.');
    });
}

function createNewAppointment() {
    // This would redirect to create appointment page
    showInfo('Chức năng tạo lịch hẹn mới sẽ được cập nhật sau.');
}

function refreshAppointments() {
    loadAllAppointments();
}

function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('shiftFilter').value = '';
    document.getElementById('searchInput').value = '';
    applyFilters();
}

// Utility functions
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Không có';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'bg-warning';
        case 'confirmed':
            return 'bg-info';
        case 'completed':
            return 'bg-success';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function getShiftBadgeClass(shift) {
    switch (shift?.toLowerCase()) {
        case 'morning':
            return 'bg-light text-dark';
        case 'afternoon':
            return 'bg-warning';
        case 'evening':
            return 'bg-dark';
        default:
            return 'bg-secondary';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showError(message) {
    // Using simple alert for now, can be replaced with toast notifications
    alert('Lỗi: ' + message);
}

function showInfo(message) {
    // Using simple alert for now, can be replaced with toast notifications
    alert('Thông báo: ' + message);
}

function showSuccess(message) {
    // Using simple alert for now, can be replaced with toast notifications
    alert('Thành công: ' + message);
} 

// Hàm chuyển đổi trạng thái sang tiếng Việt
function getStatusVN(status) {
    switch ((status || '').toLowerCase()) {
        case 'pending': return 'Chờ xác nhận';
        case 'confirmed': return 'Đã xác nhận';
        case 'completed': return 'Đã hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status || '';
    }
}
// Hàm chuyển đổi ca sang tiếng Việt
function getShiftVN(shift) {
    switch ((shift || '').toLowerCase()) {
        case 'morning': return 'Sáng';
        case 'afternoon': return 'Chiều';
        case 'evening': return 'Tối';
        default: return shift || '';
    }
} 