document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("doctorList");
    const departmentFilter = document.getElementById("departmentFilter");

    // Fetch and render department options
    try {
        const depRes = await fetch("/api/doctors/departments");
        const departments = await depRes.json();
        if (Array.isArray(departments) && departmentFilter) {
            departments.forEach(dep => {
                const option = document.createElement("option");
                option.value = dep;
                option.textContent = dep;
                departmentFilter.appendChild(option);
            });
        }
    } catch (err) {
        // Không cần xử lý, dropdown sẽ chỉ có "Tất cả chuyên khoa"
    }

    let allDoctors = [];

    async function loadDoctors() {
        try {
            const res = await fetch("/api/doctors");
            allDoctors = await res.json();
            renderDoctors(allDoctors);
        } catch (err) {
            container.innerHTML = `<div class="text-danger">Không thể tải danh sách bác sĩ.</div>`;
            console.error(err);
        }
    }

    function renderDoctors(doctors) {
        let html = "";
        doctors.forEach(d => {
            html += `
            <div class="col-xl-3 col-lg-4 col-sm-6">
                <div class="p-5 card text-center">
                    <div class="mt-5">
                        <img src="${d.avatarUrl}" alt="doctor-img"
                             class="img-fluid rounded-circle p-1 border border-danger avatar"
                             height="100" width="100" loading="lazy">
                    </div>
                    <div class="mt-5 d-inline-block bg-primary-subtle px-3 py-2 rounded-pill">
                        <span class="fw-500">1000+ Appointment Completed</span>
                    </div>
                    <h3 class="mt-4 mb-2">${d.fullName}</h3>
                    <h6 class="text-body fw-normal">${d.department}</h6>
                    <div class="d-flex gap-3 justify-content-center mt-5">
                        <button class="btn btn-secondary view-profile-btn" data-id="${d.doctorId}">View Profile</button>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    // Lọc khi chọn chuyên khoa
    if (departmentFilter) {
        departmentFilter.addEventListener("change", () => {
            const selected = departmentFilter.value;
            if (!selected) {
                renderDoctors(allDoctors);
            } else {
                renderDoctors(allDoctors.filter(d => d.department === selected));
            }
        });
    }

    // Initial load
    loadDoctors();
});

document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('view-profile-btn')) {
        e.preventDefault();
        const doctorId = e.target.getAttribute('data-id');

        // Sử dụng modal Bootstrap để hiển thị chi tiết bác sĩ
        const modalBody = document.getElementById('doctorDetailModalBody');
        const doctorModal = new bootstrap.Modal(document.getElementById('doctorDetailModal'));

        try {
            const res = await fetch(`/api/doctor-details?id=${doctorId}`);
            const doctor = await res.json();
            modalBody.innerHTML = `
                <div class="row justify-content-center mt-2">
                    <div class="col-lg-10">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-4 text-center border-end">
                                        <img src="/assets/assets/images/doctor/${doctorId}.webp" 
                                             class="img-fluid rounded-circle shadow mb-3 border border-3 border-primary" 
                                             width="140" height="140" alt="avatar"
                                             onerror="this.src='/assets/assets/images/avatar/default-avatar.png'">
                                        <h4 class="fw-bold mt-2 mb-0">${doctor.fullName}</h4>
                                        <span class="badge bg-info text-dark mb-2">${doctor.department}</span>
                                    </div>
                                    <div class="col-md-8">
                                        <ul class="list-group list-group-flush">
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <strong><i class="fas fa-phone me-2"></i>Số điện thoại:</strong> 
                                                <span class="text-primary">${doctor.phone || 'Chưa cập nhật'}</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <strong><i class="fas fa-graduation-cap me-2"></i>Trình độ:</strong> 
                                                <span class="text-success">${doctor.eduLevel || 'Chưa cập nhật'}</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <strong><i class="fas fa-envelope me-2"></i>Email:</strong> 
                                                <span class="text-info">${doctor.email || 'Chưa cập nhật'}</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <strong><i class="fas fa-user-tag me-2"></i>Vai trò:</strong> 
                                                <span class="text-warning">${doctor.role || 'Chưa cập nhật'}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            doctorModal.show();
        } catch (err) {
            modalBody.innerHTML = `
                <div class="text-danger text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h5>Không thể tải thông tin bác sĩ</h5>
                    <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
                </div>
            `;
            doctorModal.show();
        }
    }
});

// Function để ẩn thông tin chi tiết bác sĩ
function hideDoctorDetail() {
    document.getElementById('doctorDetailContainer').style.display = 'none';
}