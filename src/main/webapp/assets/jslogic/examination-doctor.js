let allWaitlist = [];
let selectedWaitlist = null;
let selectedSymptoms = [];

async function loadWaitlist() {
    const loadingSpinner = document.getElementById("loadingSpinner");
    const tableContainer = document.getElementById("tableContainer");
    const errorMessage = document.getElementById("errorMessage");

    try {
        loadingSpinner.style.display = "flex";
        tableContainer.style.display = "none";
        errorMessage.classList.add("d-none");

        const response = await fetch('/api/doctor/waitlist?action=waitlist', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Không thể tải danh sách chờ');

        const waitlists = await response.json();
        console.log(waitlists)
        loadingSpinner.style.display = "none";

        if (!waitlists || waitlists.length === 0) {
            errorMessage.classList.remove("d-none");
            errorMessage.innerHTML = '<i class="fas fa-info-circle me-2"></i>Không có bệnh nhân trong danh sách chờ.';
            return;
        }

        allWaitlist = waitlists;
        tableContainer.style.display = "block";
        renderWaitlistTable();

    } catch (error) {
        console.error("Error loading waitlist:", error);
        loadingSpinner.style.display = "none";
        errorMessage.classList.remove("d-none");
        errorMessage.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Không thể tải danh sách chờ.';
    }
}

function renderWaitlistTable() {
    const tableBody = document.getElementById("waitListTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = '';

    allWaitlist.forEach((waitlist, index) => {
        const statusClass = getStatusClass(waitlist.status);

        const row = document.createElement("tr");
        row.className = "waitlist-row";

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><i class="fas fa-user me-2"></i>${waitlist.patient_id || 'Không có'}</td>
            <td><i class="fas fa-door-open me-2"></i>Phòng ${waitlist.room_id || 'Không có'}</td>
            <td><i class="fas fa-calendar-plus me-2"></i>${formatDate(waitlist.registered_at)}</td>
            <td><i class="fas fa-hourglass-start me-2"></i>${formatTime(waitlist.estimated_time)}</td>
            <td><i class="fas fa-calendar-check me-2"></i>${formatDateTime(waitlist.appointment_datetime)}</td>
            <td><span class="${statusClass}">${getStatusText(waitlist.status) || 'Không xác định'}</span></td>
            <td><i class="fas fa-vial me-2"></i>${getVisitTypeText(waitlist.visittype) || 'Không xác định'}</td>
            <td><i class="fas fa-sticky-note me-2"></i>${waitlist.note || 'Không có ghi chú'}</td>
            <td><i class="fas fa-clock me-2"></i>${waitlist.shift || 'Không có'}</td>
            <td>
                ${generateActionButton(waitlist)}
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Hàm lấy class CSS cho status
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'waiting':
            return 'badge bg-warning text-dark';
        case 'inprogress':
            return 'badge bg-info';
        case 'skipped':
            return 'badge bg-secondary';
        case 'completed':
            return 'badge bg-success';
        default:
            return 'badge bg-light text-dark';
    }
}

function getStatusText(status) {
    switch ((status || '').toLowerCase()) {
        case 'waiting': return 'Chờ khám';
        case 'inprogress': return 'Đang khám';
        case 'skipped': return 'Bỏ qua';
        case 'completed': return 'Đã khám';
        default: return status || 'Không xác định';
    }
}

function getVisitTypeText(type) {
    switch ((type || '').toLowerCase()) {
        case 'initial': return 'Khám ban đầu';
        case 'result': return 'Tái khám';
        default: return type || 'Không xác định';
    }
}

// Hàm tạo button action phù hợp theo status và visit type
function generateActionButton(waitlist) {
    const status = waitlist.status?.toLowerCase();
    const visitType = waitlist.visittype?.toLowerCase();
    const waitlistId = waitlist.waitlist_id;

    if (visitType === 'result') {
        return `
            <button class="btn btn-sm btn-warning" disabled>
                <i class="fas fa-vial me-1"></i>Đang kiểm tra kết quả
            </button>
        `;
    }

    switch (status) {
        case 'waiting':
            return `
                <button class="btn btn-sm btn-primary select-patient-btn" data-waitlist-id="${waitlistId}">
                    <i class="fas fa-stethoscope me-1"></i>Chọn khám
                </button>
            `;

        case 'inprogress':
            return `
                <button class="btn btn-sm btn-info" disabled>
                    Đang khám
                </button>
            `;

        case 'completed':
            return `
                <button class="btn btn-sm btn-success" disabled>
                    <i class="fas fa-check-circle me-1"></i>Hoàn thành
                </button>
            `;

        case 'skipped':
            return `
                <button class="btn btn-sm btn-secondary" disabled>
                    <i class="fas fa-forward me-1"></i>Bỏ qua
                </button>
            `;

        default:
            return `
                <button class="btn btn-sm btn-outline-secondary" disabled>
                    <i class="fas fa-question me-1"></i>Không xác định
                </button>
            `;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'Không có';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}

function formatTime(dateStr) {
    if (!dateStr) return 'Không có';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'Không có';
    const date = new Date(dateStr);
    return date.toLocaleString();
}

// Hàm chọn bệnh nhân để khám
async function selectPatientForExamination(waitlistId) {
    try {
        const response = await fetch(`/api/doctor/waitlist?action=detail&id=${waitlistId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Không thể lấy thông tin chi tiết bệnh nhân');

        const waitlist = await response.json();
        selectedWaitlist = waitlist;

        // Set thông tin bệnh nhân
        document.getElementById("patientId").textContent = waitlist.patient_id ?? 'Không có';
        document.getElementById("patientName").textContent = waitlist.full_name ?? 'Không có';
        document.getElementById("patientAge").textContent = waitlist.dob ? calculateAge(waitlist.dob) : 'Không có';
        document.getElementById("patientGender").textContent = waitlist.gender ?? 'Không có';
        document.getElementById("patientPhone").textContent = waitlist.phone ?? 'Không có';

        // Thông tin lịch hẹn
        const appointmentDate = waitlist.appointment_datetime;
        document.getElementById("appointmentInfo").textContent = appointmentDate
            ? `${formatDate(appointmentDate)} lúc ${formatTime(appointmentDate)}`
            : 'Không có';

        document.getElementById("patientNote").textContent = waitlist.note ?? 'Không có';

        // Gán ID cho form
        document.getElementById("selectedWaitlistId").value = waitlist.waitlist_id ?? '';

        // Ẩn khu chọn bệnh nhân, hiện form khám
        document.getElementById("patientSelectionCard").style.display = "none";
        document.getElementById("examinationCard").style.display = "block";


        resetExaminationForm();

    } catch (error) {
        console.error(error);
        showAlert('Không thể lấy thông tin chi tiết bệnh nhân', 'danger');

        // Reset thông tin về N/A
        ["patientId", "patientName", "patientAge", "patientGender", "patientPhone", "appointmentInfo", "patientNote"]
            .forEach(id => document.getElementById(id).textContent = 'Không có');
    }
}

function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

function resetExaminationForm() {
    document.getElementById("examinationForm").reset();
    selectedSymptoms = [];

    // Reset symptom tags
    document.querySelectorAll('.symptom-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
}


function backToPatientSelection() {
    document.getElementById("examinationCard").style.display = "none";
    document.getElementById("patientSelectionCard").style.display = "block";
    selectedWaitlist = null;
    selectedSymptoms = [];
}

// Hàm xử lý symptom tags
function handleSymptomTagClick(tag) {
    const symptom = tag.getAttribute('data-symptom');

    if (tag.classList.contains('selected')) {
        tag.classList.remove('selected');
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    } else {
        tag.classList.add('selected');
        selectedSymptoms.push(symptom);
    }
}


async function saveExamination(formData) {
    try {
        console.log("patientId =", document.getElementById("patientId").textContent);
        const examinationData = {
            patientId: parseInt( document.getElementById("patientId").textContent),
            waitlistId: parseInt(document.getElementById("selectedWaitlistId").value),
            symptomsDescription: formData.get('symptomsDescription'),
            preliminaryDiagnosis: formData.get('preliminaryDiagnosis')
        };

        // console.log("DEBUG CHECK:");
        // console.log("patientId:", examinationData.patientId);
        // console.log("waitlistId:", examinationData.waitlistId);
        // console.log("symptomsDescription:", examinationData.symptomsDescription);
        // console.log("preliminaryDiagnosis:", examinationData.preliminaryDiagnosis);

        const response = await fetch('/api/doctor/examination', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(examinationData)
        });

        if (!response.ok) {
            throw new Error('Không thể lưu thông tin khám');
        }

        const result = await response.json();

        if (result.success) {
            showAlert('Đã lưu thông tin khám thành công!', 'success');

            // Cập nhật trạng thái appointment thành InProgress
            await updateWaitlistStatus(examinationData.waitlistId, 'InProgress');

            // Quay lại danh sách bệnh nhân
            setTimeout(() => {
                backToPatientSelection();
                loadWaitlist();
            }, 1000);
        } else {
            throw new Error(result.message || 'Không thể lưu thông tin khám');
        }

    } catch (error) {
        console.error("Error saving examination:", error);
        showAlert('Không thể lưu thông tin khám. Vui lòng thử lại.', 'danger');
    }
}

// Hàm cập nhật trạng thái waitlist
async function updateWaitlistStatus(waitlistId, status) {
    try {
        const response = await fetch('/api/doctor/waitlist', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                waitlistId: waitlistId,
                status: status
            })
        });

        if (!response.ok) {
            console.error('Không thể cập nhật trạng thái waitlist');
        }
    } catch (error) {
        console.error("Error updating waitlist status:", error);
    }
}

// Hàm hiển thị alert
function showAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;

    // Tự động ẩn alert sau 5 giây
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 500);
}


document.addEventListener('DOMContentLoaded', function() {
    loadWaitlist();

    document.getElementById("waitListTableBody").addEventListener('click', function(e) {
        const selectBtn = e.target.closest('.select-patient-btn');
        if (selectBtn) {
            const waitlist_id = selectBtn.getAttribute('data-waitlist-id');
            selectPatientForExamination(waitlist_id);
        }
    });

    document.getElementById("symptomsContainer").addEventListener('click', function(e) {
        if (e.target.classList.contains('symptom-tag')) {
            handleSymptomTagClick(e.target);
        }
    });

    document.getElementById("backToSelection").addEventListener('click', function() {
        backToPatientSelection();
    });


    document.getElementById("examinationForm").addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);


        if (!formData.get('symptomsDescription').trim()) {
            showAlert('Vui lòng mô tả triệu chứng', 'danger');
            return;
        }

        if (!formData.get('preliminaryDiagnosis').trim()) {
            showAlert('Vui lòng nhập chẩn đoán sơ bộ', 'danger');
            return;
        }


        saveExamination(formData);
    });


    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            loadWaitlist();
        }
    });
});


function validateExaminationForm(formData) {
    const errors = [];

    if (!formData.get('symptomsDescription').trim()) {
        errors.push('Mô tả triệu chứng là bắt buộc');
    }

    if (!formData.get('preliminaryDiagnosis').trim()) {
        errors.push('Chẩn đoán sơ bộ là bắt buộc');
    }

    return errors;
}