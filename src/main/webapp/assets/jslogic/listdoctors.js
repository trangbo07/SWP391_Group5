window.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("doctorList");
    const departmentFilter = document.getElementById("departmentFilter");
    const searchInput = document.getElementById("searchInput");
    const clearFiltersBtn = document.getElementById("clearFilters");
    const resultsCount = document.getElementById("resultsCount");
    const sortSelect = document.getElementById("sortSelect");
    const filterAvailableBtn = document.getElementById("filterAvailableDoctors");

    let allDoctors = [];
    let filteredDoctors = [];
    let searchTimeout;
    let patientIdFromSession = "";

    const removeVietnameseTones = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

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
        }
    }

    function filterDoctors() {
        const rawSearch = searchInput.value.trim();
        const searchTerm = removeVietnameseTones(rawSearch);
        const selectedDepartment = departmentFilter.value;

        if (/^\d+$/.test(rawSearch)) {
            filteredDoctors = [];
            renderDoctors(filteredDoctors);
            updateResultsCount();
            return;
        }

        if (searchTerm || selectedDepartment) {
            container.innerHTML = `<div class="col-12 text-center py-4">
                <div class="spinner-border text-primary mb-2" role="status"></div>
                <h6>Đang tìm kiếm bác sĩ...</h6>
            </div>`;
        }

        setTimeout(() => {
            filteredDoctors = allDoctors.filter(d => {
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
        <img src="${d.img || 'https://via.placeholder.com/150'}" class="card-img-top" alt="Ảnh bác sĩ" style="height: 200px; object-fit: cover; border-radius: 0.5rem 0.5rem 0 0;">
        <div class="card-body">
            <h5 class="fw-bold mb-1">${highlightedName}</h5>
            <p class="text-muted"><i class="fas fa-stethoscope me-1"></i>${d.department}</p>
            <div class="d-grid">
                <button class="btn btn-outline-primary view-profile-btn" data-id="${d.doctorId}">
                    <i class="fas fa-eye me-2"></i>Xem hồ sơ
                </button>
            </div>
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

    // Sự kiện lọc & tìm kiếm
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

    document.addEventListener('click', async function (e) {
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
                document.getElementById('bookAppointmentBtn')?.addEventListener('click', () => {
                    // ✅ 1. Lưu thông tin bác sĩ vào localStorage
                    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));

                    // ✅ 2. Chuyển đến trang đặt lịch
                    window.location.href = "./bookappoinmentdoctor.html";
                });
            } catch {
                modalBody.innerHTML = `<div class="text-danger text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h5>Không thể tải thông tin bác sĩ</h5>
                </div>`;
            }
        }
    });

    // Lấy patientId từ session
    try {
        const res = await fetch("/api/session/patient");
        if (!res.ok) throw new Error();
        const data = await res.json();
        patientIdFromSession = data.patientId;
        window.patientIdFromSession = patientIdFromSession;
        try {
            const res = await fetch("/api/session/patient");
            if (!res.ok) throw new Error();
            const data = await res.json();
            patientIdFromSession = data.patientId;
            window.patientIdFromSession = patientIdFromSession;

            // 🟡 GỌI API danh sách bệnh nhân theo accountId
            const patientRes = await fetch(`/api/patient/list-by-account?accountId=${patientIdFromSession}`);
            const patients = await patientRes.json();

            const patientSelect = document.getElementById('appointmentPatientId');
            if (patientSelect && patients.length > 0) {
                // Xóa option cũ (nếu có)
                patientSelect.innerHTML = '<option disabled selected value="">-- Chọn bệnh nhân --</option>';
                patients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.patient_id;
                    option.textContent = patient.full_name;
                    patientSelect.appendChild(option);
                });
            }
        } catch (e) {
            alert("Bạn chưa đăng nhập hoặc không phải tài khoản bệnh nhân!");
            console.error(e);
        }
        const input = document.getElementById('appointmentPatientId') || document.createElement('input');
        input.type = 'hidden';
        input.id = 'appointmentPatientId';
        input.value = patientIdFromSession;
        document.getElementById('bookAppointmentForm')?.appendChild(input);
    } catch {
        alert("Bạn chưa đăng nhập hoặc không phải tài khoản bệnh nhân!");
    }

    // Sự kiện check lịch tự động
    const shiftSelect = document.getElementById('appointmentShift');
    const dateInput = document.getElementById('appointmentDate');
    const doctorIdEl = document.getElementById('appointmentDoctorId');

    const handleShiftOrDateChange = () => {
        const shift = shiftSelect?.value;
        const date = dateInput?.value;
        const docId = doctorIdEl?.value;
        if (shift && date && docId) checkDoctorSchedule(docId, date, shift);
    };

    shiftSelect?.addEventListener('change', handleShiftOrDateChange);
    dateInput?.addEventListener('change', handleShiftOrDateChange);

    // Nút xác nhận đặt lịch
    document.getElementById('confirmBookingBtn')?.addEventListener('click', () => {
        const doctorId = doctorIdEl?.value;
        const patientId = document.getElementById('appointmentPatientId')?.value;
        const date = dateInput?.value;
        const shift = shiftSelect?.value;
        const timeSlot = document.getElementById('selectedTimeSlot')?.value;
        const note = document.getElementById('appointmentNote')?.value || "";

        if (!doctorId || !patientId || !date || !shift || !timeSlot) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        fetch('/api/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctorId, patientId, workingDate: date, shift, timeSlot, note })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    bootstrap.Modal.getOrCreateInstance(document.getElementById('bookAppointmentModal')).hide();
                    document.getElementById('bookAppointmentForm')?.reset();
                    alert(data.message || "Đặt lịch thành công!");
                } else {
                    alert(data.message || "Lịch đã bị trùng vui lòng đặt lại!\nVui lòng thử lại.");
                }
            })
            .catch(() => alert("Có lỗi xảy ra!"));
    });

    filterAvailableBtn?.addEventListener("click", async () => {
        container.innerHTML = `<div class="col-12 text-center py-4">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <h6>Đang tải danh sách bác sĩ có lịch làm việc...</h6>
        </div>`;
        try {
            const res = await fetch("/api/doctors/available");
            filteredDoctors = await res.json();
            console.log(filteredDoctors)
            renderDoctors(filteredDoctors);
            updateResultsCount();
        } catch {
            container.innerHTML = `<div class="col-12 text-center text-danger">Không thể tải danh sách bác sĩ có lịch làm việc.</div>`;
        }
    });

    await fetchDepartments();
    await loadDoctors();
});

// Hàm tạo slot giờ theo ca
function generateTimeSlots(shift) {
    const s = (shift || '').toLowerCase();
    let start = s === 'morning' || s === 'sáng' ? 8 * 60 : 13 * 60;
    let end = s === 'morning' || s === 'sáng' ? 11 * 60 : 17 * 60;
    const slots = [];
    for (let t = start; t < end; t += 30) {
        const h = Math.floor(t / 60).toString().padStart(2, '0');
        const m = (t % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
    }
    return slots;
}

// Hàm kiểm tra lịch bác sĩ
function checkDoctorSchedule(doctorId, workingDate, shift) {
    fetch(`/api/check-doctor-schedule?doctorId=${doctorId}&workingDate=${workingDate}&shift=${shift}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('time-slots');
            const confirmBtn = document.getElementById('confirmBookingBtn');
            container.innerHTML = '';
            confirmBtn.disabled = true;

            if (data.exists) {
                generateTimeSlots(shift).forEach(slot => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.textContent = slot;
                    btn.className = "btn btn-outline-primary m-1";
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('#time-slots button').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        document.getElementById('selectedTimeSlot').value = slot;
                        confirmBtn.disabled = false;
                    });
                    container.appendChild(btn);
                });
            } else {
                container.textContent = 'Không có lịch cho bác sĩ này!';
            }
        })
        .catch(err => console.error("Lỗi kiểm tra lịch:", err));
}
