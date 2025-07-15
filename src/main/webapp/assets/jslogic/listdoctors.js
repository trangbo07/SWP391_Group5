// ✅ KHÔNG lặp lại DOMContentLoaded và lặp lại listener `click` nữa. Gộp và rút gọn lại

// Hàm xử lý DOMContentLoaded chính
async function initDoctorPage() {
    const container = document.getElementById("doctorList");
    const departmentFilter = document.getElementById("departmentFilter");
    const searchInput = document.getElementById("searchInput");
    const clearFiltersBtn = document.getElementById("clearFilters");
    const resultsCount = document.getElementById("resultsCount");
    const sortSelect = document.getElementById("sortSelect");
    const filterAvailableBtn = document.getElementById("filterAvailableDoctors"); // Thêm dòng này

    let allDoctors = [];
    let filteredDoctors = [];
    let searchTimeout;

    const removeVietnameseTones = (str) => {
        return str.normalize("NFD")
            .replace(/\u0300-\u036f/g, "")
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
        if (/^\\d+$/.test(rawSearch)) {
            filteredDoctors = [];
            renderDoctors(filteredDoctors);
            updateResultsCount();
            return;
        }

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
                // Chỉ so sánh với tên
                const normalizedName = removeVietnameseTones(d.fullName);
                const matchesSearch = !searchTerm || normalizedName.includes(searchTerm);
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
            resultsCount.textContent = count === total ? `Hiển thị ${count} bác sĩ` : `Hiển thị ${count} trong tổng số ${total} bác sĩ`;
        }
    }

    function renderDoctors(doctors) {
        if (doctors.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-4">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">Không tìm thấy bác sĩ</h4>
                <p class="text-muted">Thử thay đổi từ khóa hoặc bộ lọc</p>
                <button class="btn btn-primary" onclick="clearAllFilters()">
                    <i class="fas fa-times me-2"></i>Xóa bộ lọc
                </button>
            </div>`;
            return;
        }

        const searchTerm = searchInput.value.trim();

        container.innerHTML = doctors.map(d => {
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

            return `<div class="col-xl-3 col-lg-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0 hover-shadow transition-all">
                    <h5 class="fw-bold mb-1">${highlightedName}</h5>
                    <p class="text-muted"><i class="fas fa-stethoscope me-1"></i>${d.department}</p>
                    <div class="d-grid">
                        <button class="btn btn-outline-primary view-profile-btn" data-id="${d.doctorId}">
                            <i class="fas fa-eye me-2"></i>Xem hồ sơ
                        </button>
                    </div>
                </div>
            </div>`;
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

    window.clearAllFilters = clearAllFilters;

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

    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('view-profile-btn')) {
            const doctorId = e.target.getAttribute('data-id');
            const modalBody = document.getElementById('doctorDetailModalBody');
            const doctorModal = new bootstrap.Modal(document.getElementById('doctorDetailModal'));

            modalBody.innerHTML = `<div class="text-center py-4">
                <div class="spinner-border text-primary mb-3"></div>
                <h5>Đang tải thông tin bác sĩ...</h5>
            </div>`;
            doctorModal.show();

            try {
                const res = await fetch(`/api/doctor-details?id=${doctorId}`);
                const doctor = await res.json();

                modalBody.innerHTML = `<div class="row justify-content-center mt-2">
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

                const bookBtn = document.getElementById('bookAppointmentBtn');
                if (bookBtn) {
                    bookBtn.addEventListener('click', () => {
                        bootstrap.Modal.getOrCreateInstance(document.getElementById('doctorDetailModal')).hide();
                        document.getElementById('bookAppointmentForm').reset();
                        document.getElementById('appointmentDoctorName').value = doctor.fullName;
                        document.getElementById('appointmentDoctorId').value = doctor.doctorId;

                        const bookModal = new bootstrap.Modal(document.getElementById('bookAppointmentModal'));
                        bookModal.show();

                        const shift = document.getElementById('appointmentShift').value;
                        const workingDate = document.getElementById('appointmentDate').value;
                        if (shift && workingDate) checkDoctorSchedule(doctor.doctorId, workingDate, shift);
                    });
                }
            } catch (err) {
                modalBody.innerHTML = `<div class="text-danger text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h5>Không thể tải thông tin bác sĩ</h5>
                </div>`;
            }
        }
    });

    await fetchDepartments();
    await loadDoctors();

    // Gắn sự kiện cho nút lọc bác sĩ có lịch làm việc
    if (filterAvailableBtn) {
        filterAvailableBtn.addEventListener("click", async () => {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="spinner-border text-primary mb-2" role="status"></div>
                    <h6>Đang tải danh sách bác sĩ có lịch làm việc...</h6>
                </div>
            `;
            try {
                const res = await fetch("/api/doctors/available");
                const doctors = await res.json();
                filteredDoctors = doctors;
                renderDoctors(filteredDoctors);
                updateResultsCount();
            } catch (err) {
                container.innerHTML = `<div class="col-12 text-center text-danger">Không thể tải danh sách bác sĩ có lịch làm việc.</div>`;
            }
        });
    }
}

function generateTimeSlots(shift) {
    let slots = [];
    let start = shift === 'morning' || shift === 'Sáng' ? 8 * 60 : 13 * 60;
    let end = shift === 'morning' || shift === 'Sáng' ? 11 * 60 : 17 * 60;

    for (let time = start; time < end; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    return slots;
}

function checkDoctorSchedule(doctorId, workingDate, shift) {
    fetch(`/api/check-doctor-schedule?doctorId=${doctorId}&workingDate=${workingDate}&shift=${shift}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('time-slots');
            const confirmBtn = document.getElementById('confirmBookingBtn');
            container.innerHTML = '';
            confirmBtn.disabled = true; // Reset nút xác nhận

            if (data.exists) {
                generateTimeSlots(shift).forEach(slot => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.textContent = slot;
                    btn.className = "btn btn-outline-primary m-1";

                    btn.addEventListener('click', () => {
                        // Remove active từ các nút khác
                        document.querySelectorAll('#time-slots button').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        // Gán giá trị giờ vào input ẩn
                        const selectedTimeInput = document.getElementById('selectedTimeSlot');
                        if (selectedTimeInput) selectedTimeInput.value = slot;

                        // Bật nút xác nhận
                        confirmBtn.disabled = false;
                    });

                    container.appendChild(btn);
                });
            } else {
                container.textContent = 'Không có lịch cho bác sĩ này!';
            }
        })
        .catch(err => console.error("Lỗi khi kiểm tra lịch bác sĩ:", err));
}

// Gắn sự kiện tự động kiểm tra lịch khi thay đổi shift hoặc ngày
window.addEventListener("DOMContentLoaded", () => {
    initDoctorPage();

    const shiftSelect = document.getElementById('appointmentShift');
    const dateInput = document.getElementById('appointmentDate');

    function handleShiftOrDateChange() {
        const shift = shiftSelect.value;
        const workingDate = dateInput.value;
        const doctorId = document.getElementById('appointmentDoctorId').value;
        if (shift && workingDate && doctorId) checkDoctorSchedule(doctorId, workingDate, shift);
    }

    shiftSelect?.addEventListener('change', handleShiftOrDateChange);
    dateInput?.addEventListener('change', handleShiftOrDateChange);
});
window.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) {
        console.error("Không tìm thấy input #searchInput");
        return;
    }
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterDoctors, 300);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    initDoctorPage();

    // Sự kiện auto check lịch khi đổi ca/ngày
    const shiftSelect = document.getElementById('appointmentShift');
    const dateInput = document.getElementById('appointmentDate');
    function handleShiftOrDateChange() {
        const shift = shiftSelect?.value;
        const workingDate = dateInput?.value;
        const doctorId = document.getElementById('appointmentDoctorId')?.value;
        if (shift && workingDate && doctorId) {
            checkDoctorSchedule(doctorId, workingDate, shift);
        }
    }
    shiftSelect?.addEventListener('change', handleShiftOrDateChange);
    dateInput?.addEventListener('change', handleShiftOrDateChange);

    // ✅ Gắn sự kiện xác nhận đặt lịch
    const confirmBtn = document.getElementById('confirmBookingBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const doctorIdEl = document.getElementById('appointmentDoctorId');
            const workingDateEl = document.getElementById('appointmentDate');
            const shiftEl = document.getElementById('appointmentShift');
            const timeSlotEl = document.getElementById('selectedTimeSlot');

            if (!doctorIdEl || !workingDateEl || !shiftEl || !timeSlotEl) {
                alert("Thiếu phần tử trong DOM. Vui lòng mở đúng modal.");
                return;
            }

            const doctorId = doctorIdEl.value;
            const workingDate = workingDateEl.value;
            const shift = shiftEl.value;
            const timeSlot = timeSlotEl.value;

            if (!doctorId || !workingDate || !shift || !timeSlot) {
                alert("Vui lòng chọn đầy đủ thông tin.");
                return;
            }

            fetch('/api/book-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, workingDate, shift, timeSlot })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Đặt lịch thành công!");
                        bootstrap.Modal.getOrCreateInstance(document.getElementById('bookAppointmentModal')).hide();
                    } else {
                        alert("Đặt lịch thất bại. Vui lòng thử lại.");
                    }
                })
                .catch(err => {
                    console.error("Lỗi khi đặt lịch:", err);
                    alert("Có lỗi xảy ra!");
                });
        });
    } else {
        console.warn("Không tìm thấy nút #confirmBookingBtn trong DOM.");
    }
});
