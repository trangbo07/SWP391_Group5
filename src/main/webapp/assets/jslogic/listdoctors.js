document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("doctorList");
    const departmentFilter = document.getElementById("departmentFilter");
    const searchInput = document.getElementById("searchInput");
    const clearFiltersBtn = document.getElementById("clearFilters");
    const resultsCount = document.getElementById("resultsCount");
    const sortSelect = document.getElementById("sortSelect");

    let allDoctors = [];
    let filteredDoctors = [];

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    };

    async function fetchDepartments() {
        try {
            const res = await fetch("/api/doctors/departments");
            const departments = await res.json();
            departments.forEach(dep => {
                const option = document.createElement("option");
                option.value = dep;
                option.textContent = dep;
                departmentFilter.appendChild(option);
            });
        } catch (err) {
            console.error("Error loading departments:", err);
        }
    }

    async function loadDoctors() {
        try {
            const res = await fetch("/api/doctors");
            allDoctors = await res.json();
            filteredDoctors = [...allDoctors];
            renderDoctors(filteredDoctors);
            updateResultsCount();
        } catch (err) {
            container.innerHTML = `<div class="col-12 text-center text-danger">Không thể tải danh sách bác sĩ.</div>`;
            console.error(err);
        }
    }

    function filterDoctors() {
        const rawSearch = searchInput.value.trim();
        const searchTerm = removeVietnameseTones(rawSearch);
        const selectedDepartment = departmentFilter.value;

        // Chỉ hiển thị loading khi có từ khóa tìm kiếm
        if (searchTerm || selectedDepartment) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="spinner-border text-primary mb-2" role="status"></div>
                    <h6>Đang tìm kiếm bác sĩ...</h6>
                </div>
            `;
        }

        setTimeout(() => {
            filteredDoctors = allDoctors.filter(d => {
                // Chuẩn hóa tên bác sĩ và các thông tin khác
                const normalizedName = removeVietnameseTones(d.fullName);
                const normalizedDepartment = removeVietnameseTones(d.department);
                const normalizedEmail = removeVietnameseTones(d.email || "");
                const normalizedPhone = removeVietnameseTones(d.phone || "");
                const normalizedEduLevel = removeVietnameseTones(d.eduLevel || "");
                
                // Tạo chuỗi tìm kiếm tổng hợp
                const searchText = `${normalizedName} ${normalizedDepartment} ${normalizedEmail} ${normalizedPhone} ${normalizedEduLevel}`;
                
                // Kiểm tra tìm kiếm
                const matchesSearch = !searchTerm || searchText.includes(searchTerm);
                
                // Kiểm tra bộ lọc chuyên khoa
                const matchesDepartment = !selectedDepartment || d.department === selectedDepartment;
                
                return matchesSearch && matchesDepartment;
            });

            sortDoctors();
            renderDoctors(filteredDoctors);
            updateResultsCount();
        }, 200);
    }

    function sortDoctors() {
        const sortBy = sortSelect.value;
        filteredDoctors.sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.fullName.localeCompare(b.fullName, 'vi');
                case 'name-desc': return b.fullName.localeCompare(a.fullName, 'vi');
                case 'department': return a.department.localeCompare(b.department, 'vi');
                default: return 0;
            }
        });
    }

    function updateResultsCount() {
        const count = filteredDoctors.length;
        const total = allDoctors.length;
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm && count > 0) {
            resultsCount.innerHTML = `Tìm thấy <strong>${count}</strong> bác sĩ cho "<strong>${searchTerm}</strong>"`;
        } else if (searchTerm && count === 0) {
            resultsCount.innerHTML = `Không tìm thấy bác sĩ nào cho "<strong>${searchTerm}</strong>"`;
        } else {
            resultsCount.textContent = count === total
                ? `Hiển thị ${count} bác sĩ`
                : `Hiển thị ${count} trong tổng số ${total} bác sĩ`;
        }
    }

    function renderDoctors(doctors) {
        if (doctors.length === 0) {
            const searchTerm = searchInput.value.trim();
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">Không tìm thấy bác sĩ</h4>
                    ${searchTerm ? `<p class="text-muted">Không có kết quả cho "<strong>${searchTerm}</strong>"</p>` : ''}
                    <p class="text-muted">Thử thay đổi từ khóa hoặc bộ lọc</p>
                    <button class="btn btn-primary" onclick="clearAllFilters()">
                        <i class="fas fa-times me-2"></i>Xóa bộ lọc
                    </button>
                </div>`;
            return;
        }

        const searchTerm = searchInput.value.trim();
        
        container.innerHTML = doctors.map(d => {
            // Highlight tên bác sĩ nếu có từ khóa tìm kiếm
            let highlightedName = d.fullName;
            if (searchTerm) {
                const normalizedName = removeVietnameseTones(d.fullName);
                const normalizedSearch = removeVietnameseTones(searchTerm);
                const index = normalizedName.indexOf(normalizedSearch);
                if (index !== -1) {
                    const before = d.fullName.substring(0, index);
                    const match = d.fullName.substring(index, index + searchTerm.length);
                    const after = d.fullName.substring(index + searchTerm.length);
                    highlightedName = `${before}<mark class="bg-warning">${match}</mark>${after}`;
                }
            }

            return `
            <div class="col-xl-3 col-lg-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0 hover-shadow transition-all" 
                     tabindex="0" 
                     role="button" 
                     aria-label="Xem thông tin bác sĩ ${d.fullName}"
                     onkeypress="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.querySelector('[data-id='${d.doctorId}']).click(); }">

                        <h5 class="fw-bold mb-1">${highlightedName}</h5>
                        <p class="text-muted"><i class="fas fa-stethoscope me-1"></i>${d.department}</p>
                        <div class="d-grid">
                            <button class="btn btn-outline-primary view-profile-btn" 
                                    data-id="${d.doctorId}">
                                <i class="fas fa-eye me-2"></i>Xem hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    function clearAllFilters() {
        searchInput.value = '';
        departmentFilter.value = '';
        sortSelect.value = 'name';
        filteredDoctors = [...allDoctors];
        sortDoctors();
        renderDoctors(filteredDoctors);
        updateResultsCount();
        searchInput.focus();
    }

    // Event listeners
    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterDoctors, 300);
    });

    searchInput?.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterDoctors();
            searchInput.blur();
        }
    });

    departmentFilter?.addEventListener('change', filterDoctors);
    sortSelect?.addEventListener('change', () => {
        sortDoctors();
        renderDoctors(filteredDoctors);
    });
    clearFiltersBtn?.addEventListener('click', clearAllFilters);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            clearAllFilters();
        }
    });

    window.clearAllFilters = clearAllFilters;

    await fetchDepartments();
    await loadDoctors();
});

document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('view-profile-btn')) {
        e.preventDefault();
        const doctorId = e.target.getAttribute('data-id');
        const modalBody = document.getElementById('doctorDetailModalBody');
        const doctorModal = new bootstrap.Modal(document.getElementById('doctorDetailModal'));

        modalBody.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary mb-3"></div>
                <h5>Đang tải thông tin bác sĩ...</h5>
            </div>`;
        doctorModal.show();

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
                                      
                                        <h4 class="fw-bold mt-2 mb-0">${doctor.fullName}</h4>
                                        <span class="badge bg-info text-dark mb-2">${doctor.department}</span>
                                        <button class="btn btn-success mt-2 w-100" id="bookAppointmentBtn" data-id="${doctor.doctorId}">
                                            <i class="fas fa-calendar-plus me-2"></i>Đặt lịch hẹn
                                        </button>
                                    </div>
                                    <div class="col-md-8">
                                        <ul class="list-group list-group-flush">
                                            <li class="list-group-item"><strong>SĐT:</strong> ${doctor.phone || 'Chưa cập nhật'}</li>
                                            <li class="list-group-item"><strong>Trình độ:</strong> ${doctor.eduLevel || 'Chưa cập nhật'}</li>
                                            <li class="list-group-item"><strong>Email:</strong> ${doctor.email || 'Chưa cập nhật'}</li>
                                            <li class="list-group-item"><strong>Vai trò:</strong> ${doctor.role || 'Chưa cập nhật'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            // Thêm sự kiện click cho nút đặt lịch hẹn
            const bookBtn = document.getElementById('bookAppointmentBtn');
            if (bookBtn) {
                bookBtn.addEventListener('click', function() {
                    // Truyền thông tin bác sĩ sang modal đặt lịch
                    document.getElementById('appointmentDoctorName').value = doctor.fullName;
                    document.getElementById('appointmentDoctorId').value = doctor.doctorId;
                    // Reset form đặt lịch
                    document.getElementById('bookAppointmentForm').reset();
                    document.getElementById('appointmentDoctorName').value = doctor.fullName;
                    document.getElementById('appointmentDoctorId').value = doctor.doctorId;
                    // Hiện modal đặt lịch
                    const bookModal = new bootstrap.Modal(document.getElementById('bookAppointmentModal'));
                    bookModal.show();
                });
            }
        } catch (err) {
            modalBody.innerHTML = `
                <div class="text-danger text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h5>Không thể tải thông tin bác sĩ</h5>
                </div>`;
        }
    }

    // Thêm sự kiện click cho nút Đặt lịch hẹn (bookAppointmentBtn)
    if (e.target && e.target.id === 'bookAppointmentBtn') {
        e.preventDefault();
        const doctorId = e.target.getAttribute('data-id');
        // Chuyển hướng sang trang appointment-patient.html và truyền doctorId qua query string
        window.location.href = '/src/main/webapp/view/appointment-patient.html?doctorId=' + doctorId;
    }
});