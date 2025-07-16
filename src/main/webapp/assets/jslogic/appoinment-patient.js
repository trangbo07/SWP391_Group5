let allAppointments = [];
let currentPage     = 1;
const pageSize      = 7;

// --- FEEDBACK LOGIC ---

let currentFeedbackDoctorId = null;
let currentFeedbackAppointment = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAppointmentsByStatus('Pending'); // Load Pending appointments by default

    // Tab buttons event listeners
    document.querySelectorAll('.btn-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            loadAppointmentsByStatus(action); // Load theo status cụ thể
        });
    });

    // Search functionality
    document.getElementById('searchAppointmentBtn').addEventListener('click', () => {
        const keyword = document.getElementById('searchKeyword').value;
        searchAppointments(keyword);
    });

    document.getElementById('searchKeyword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const keyword = e.target.value;
            searchAppointments(keyword);
        }
    });

    document.getElementById('btnPreviousPage')
        .addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage();
            }
        });

    document.getElementById('btnNextPage')
        .addEventListener('click', () => {
            const totalPages = Math.ceil(allAppointments.length / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                renderPage();
            }
        });

    document.getElementById('appointmentTableBody')
        .addEventListener('click', onAppointmentButtonClick);

    // Nút FeedBack trong offcanvas chi tiết appointment
    const feedbackBtn = document.querySelector('.feedbackAppointmentBtn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', openFeedbackModal);
    }
    // Nút gửi feedback trong modal
    const submitBtn = document.getElementById('submitFeedbackBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitFeedback);
    }
});

// 1. Fetch toàn bộ appointments theo trạng thái Upcoming (Pending)
async function loadAppointments() {
    const tbody = document.getElementById('appointmentTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Loading…</td></tr>';

    try {
        console.log('Starting to fetch appointments...');

        const res = await fetch('/api/patient/appointment', {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-Type':'application/json'}
        });

        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Server error response:', errorText);
            throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }

        const responseText = await res.text();
        console.log('Raw response:', responseText);

        allAppointments = JSON.parse(responseText);
        console.log('Appointments loaded:', allAppointments);
        console.log('Number of appointments:', allAppointments.length);

        currentPage = 1;
        renderPage();
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7">Error loading</td></tr>';
        console.error('Error loading appointments:', err);
    }
}

// Load appointments by status
async function loadAppointmentsByStatus(status) {
    const tbody = document.getElementById('appointmentTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Loading…</td></tr>';

    try {
        console.log('Loading appointments with status:', status);

        const res = await fetch('/api/patient/appointment', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ action: status })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Server error response:', errorText);
            throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }

        const responseText = await res.text();
        console.log('Raw response for status', status, ':', responseText);

        allAppointments = JSON.parse(responseText);
        console.log('Appointments loaded for status', status, ':', allAppointments);

        currentPage = 1;
        renderPage();
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7">Error loading</td></tr>';
        console.error('Error loading appointments by status:', err);
    }
}

// Search appointments
function searchAppointments(keyword) {
    if (!keyword.trim()) {
        loadAppointmentsByStatus('Pending'); // Load Pending appointments when search is empty
        return;
    }

    const filtered = allAppointments.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(keyword.toLowerCase()) ||
        appointment.dateTime.toLowerCase().includes(keyword.toLowerCase()) ||
        appointment.shift.toLowerCase().includes(keyword.toLowerCase()) ||
        appointment.status.toLowerCase().includes(keyword.toLowerCase()) ||
        (appointment.note && appointment.note.toLowerCase().includes(keyword.toLowerCase()))
    );

    allAppointments = filtered;
    currentPage = 1;
    renderPage();
}


// 2. Render 1 page
function renderPage() {
    const tbody = document.getElementById('appointmentTableBody');
    const info  = document.getElementById('paginationInfo');
    const start = (currentPage - 1) * pageSize;
    const end   = start + pageSize;
    const page  = allAppointments.slice(start, end);
    globalDoctorIds = [];
    if (!page.length) {
        tbody.innerHTML = '<tr><td colspan="7">No appointments</td></tr>';
        info.innerText = `Showing 0 to 0 of ${allAppointments.length}`;
        return;
    }

    tbody.innerHTML = '';
    page.forEach((a, idx) => {
        const viewBtn   = `<button class="btn btn-sm btn-primary" data-action="detail" data-appointment-id="${a.appointmentId}">
            <i class="fas fa-eye me-1"></i>View
        </button>`;
        const cancelBtn = `<button class="btn btn-sm btn-danger ms-1" data-action="cancel" data-appointment-id="${a.appointmentId}">
            <i class="fas fa-times me-1"></i>Cancel
        </button>`;

        // Chỉ hiển thị nút Cancel cho các status có thể hủy
        // Pending và Confirmed có thể hủy, Completed và Cancelled không thể
        const canCancel = ['Pending', 'Confirmed'].includes(a.status);
        const actions   = canCancel ? `${viewBtn} ${cancelBtn}` : viewBtn;

        // Tạo status badge với màu sắc
        const statusBadge = getStatusBadge(a.status);

        tbody.insertAdjacentHTML('beforeend', `
<tr>
  <td>${start + idx + 1}</td>
  <td><strong>${a.doctorName}</strong></td>
  <td>${a.dateTime}</td>
  <td><span class="badge bg-info">${a.shift}</span></td>
  <td>${statusBadge}</td>
  <td>${a.note || '-'}</td>
  <td>${actions}</td>
</tr>`);
    });

    info.innerText = `Showing ${start + 1} to ${Math.min(end, allAppointments.length)} of ${allAppointments.length}`;
}

// Tạo status badge với màu sắc
function getStatusBadge(status) {
    const statusConfig = {
        'Pending': 'bg-warning',
        'Confirmed': 'bg-success',
        'Completed': 'bg-primary',
        'Cancelled': 'bg-danger'
    };

    const badgeClass = statusConfig[status] || 'bg-secondary';
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

// 3. Xử lý click nút View/Cancel
function onAppointmentButtonClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const id     = btn.dataset.appointmentId;

    if (action === 'detail') {
        showAppointmentDetail(id);
    } else if (action === 'cancel') {
        cancelAppointment(id);
    }
}

// Hiển thị chi tiết appointment trong modal
async function showAppointmentDetail(appointmentId) {
    try {
        const res = await fetch(`/api/patient/appointment?action=detail&id=${appointmentId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const appointment = await res.json();

        // Điền thông tin vào modal
        document.getElementById('patient_id').value = appointment.patientId || '';
        document.getElementById('full_name').value = appointment.patientName || '';
        document.getElementById('dob').value = appointment.dob || '';
        document.getElementById('gender').value = appointment.gender || '';
        document.getElementById('phone').value = appointment.phone || '';
        document.getElementById('appointment_id').value = appointment.appointmentId || '';
        document.getElementById('doctor_name').value = appointment.doctorName || '';
        document.getElementById('appointment_datetime').value = appointment.dateTime || '';
        document.getElementById('shift').value = appointment.shift || '';
        document.getElementById('edu_level').value = appointment.eduLevel || '';
        document.getElementById('status').value = appointment.status || '';
        document.getElementById('note').value = appointment.note || '';

        // Lưu lại doctorId cho feedback
        currentFeedbackDoctorId = appointment.doctorId;
        currentFeedbackAppointment = appointment;

        // Hiển thị modal
        const modal = new bootstrap.Offcanvas(document.getElementById('offcanvasAppointmentEdit'));
        modal.show();

    } catch (error) {
        console.error('Error fetching appointment detail:', error);
        showAlert('Error loading appointment details', 'error');
    }
}

// Hủy appointment
async function cancelAppointment(appointmentId) {
    // Tìm thông tin appointment để hiển thị trong confirm
    const appointment = allAppointments.find(a => a.appointmentId == appointmentId);
    if (!appointment) {
        showAlert('Appointment not found', 'error');
        return;
    }

    // Điền thông tin vào modal
    document.getElementById('cancelDoctorName').textContent = appointment.doctorName;
    document.getElementById('cancelDateTime').textContent = appointment.dateTime;
    document.getElementById('cancelShift').textContent = appointment.shift;
    document.getElementById('cancelStatus').textContent = appointment.status;

    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('cancelConfirmModal'));
    modal.show();

    // Xử lý khi user xác nhận hủy
    document.getElementById('confirmCancelBtn').onclick = async () => {
        modal.hide();
        await performCancel(appointmentId);
    };
}

// Thực hiện hủy appointment
async function performCancel(appointmentId) {
    try {
        const res = await fetch(`/api/patient/appointment?action=cancel&id=${appointmentId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
            showAlert('Appointment cancelled successfully', 'success');
            loadAppointments(); // Reload the list
        } else {
            showAlert(result.message || 'Failed to cancel appointment', 'error');
        }

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showAlert('Error cancelling appointment', 'error');
    }
}

// Hiển thị alert đẹp
function showAlert(message, type = 'info') {
    const alertClass = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    }[type] || 'info';

    const alertHtml = `
        <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Thêm alert vào đầu card-body
    const cardBody = document.querySelector('.card-body');
    cardBody.insertAdjacentHTML('afterbegin', alertHtml);

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        const alert = cardBody.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}


