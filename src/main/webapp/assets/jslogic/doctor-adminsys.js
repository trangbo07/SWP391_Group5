let allDoctors = [];
let currentPage = 1;
let pageSize = 5;
let selectedDoctorIdForReset = null;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    loadSelectFilter('status', 'filterStatus');
    loadSelectFilter('eduLevel', 'filterEduLevel');
    loadSelectFilter('department', 'filterDepartment');
    fetchDoctorsWithFilter();

    document.getElementById('filterStatus').addEventListener('change', fetchDoctorsWithFilter);
    document.getElementById('filterEduLevel').addEventListener('change', fetchDoctorsWithFilter);
    document.getElementById('filterDepartment').addEventListener('change', fetchDoctorsWithFilter);
    document.getElementById('searchInput').addEventListener('input', debounce(fetchDoctorsWithFilter, 400));
    document.getElementById('btnPreviousPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(-1);
    });
    document.getElementById('btnNextPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(1);
    });
});

async function fetchDoctorsWithFilter() {
    const status = document.getElementById('filterStatus')?.value || '';
    const eduLevel = document.getElementById('filterEduLevel')?.value || '';
    const department = document.getElementById('filterDepartment')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    const tableBody = document.getElementById('doctorListTableBody');
    const info = document.getElementById('paginationInfo');

    tableBody.innerHTML = '<tr><td colspan="10">Loading...</td></tr>';

    const params = new URLSearchParams({action: 'filter'});
    if (status) params.append("status", status);
    if (eduLevel) params.append("eduLevel", eduLevel);
    if (department) params.append("department", department);
    if (search) params.append("search", search);

    try {
        const response = await fetch('/api/admin/doctors?' + params.toString(), {
            method: 'GET',
            credentials: 'include'
        });
        const doctors = await response.json();

        if (!Array.isArray(doctors) || doctors.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10">No doctors found.</td></tr>';
            if (info) info.innerText = `Showing 0 to 0 of 0 entries`;
            return;
        }

        allDoctors = doctors;
        currentPage = 1;
        paginateDoctors();

    } catch (error) {
        console.error('Error fetching doctors:', error);
        tableBody.innerHTML = '<tr><td colspan="10">Failed to load doctor data.</td></tr>';
    }
}

function paginateDoctors() {
    const tableBody = document.getElementById('doctorListTableBody');
    const info = document.getElementById('paginationInfo');

    const sourceList = isReversed ? [...allDoctors].reverse() : allDoctors;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sourceList.slice(start, end);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="10">No doctors available.</td></tr>';
        info.innerText = `Showing 0 to 0 of ${allDoctors.length} entries`;
        return;
    }

    tableBody.innerHTML = pageData.map((d, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${d.fullName}</td>
            <td>${d.username}</td>
            <td>${d.email}</td>
            <td>${d.status}</td>
            <td>${d.phone}</td>
            <td>${d.department}</td>
            <td>${d.eduLevel}</td>
            <td><img src="${d.img}" style="width: 40px; height: 40px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-sm btn-info me-1"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#doctorViewCanvas"
                            onclick="viewDoctor(${d.doctorId})">View</button>
                <button class="btn btn-sm btn-warning me-1" onclick="editDoctor(${d.doctorId})">Edit</button>
                <button class="btn btn-sm ${d.status === 'Enable' ? 'btn-danger' : 'btn-success'}"
                        onclick="toggleDoctorStatus(${d.accountStaffId}, '${d.status}')">
                    ${d.status === 'Enable' ? 'Disable' : 'Enable'}
                </button>
            </td>
        </tr>
    `).join('');

    const formattedStart = String(start + 1).padStart(2, '0');
    const formattedEnd = String(Math.min(end, allDoctors.length)).padStart(2, '0');
    info.innerText = `Showing ${formattedStart} to ${formattedEnd} of ${allDoctors.length} entries`;
}

document.getElementById('btnReverseList').addEventListener('click', () => {
    isReversed = !isReversed;

    const btn = document.getElementById('btnReverseList');
    const icon = btn.querySelector('i');

    // Đổi icon và class để hiển thị trạng thái
    if (isReversed) {
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-secondary');
        icon.classList.remove('fa-sort-amount-down-alt');
        icon.classList.add('fa-sort-amount-up-alt');
    } else {
        btn.classList.add('btn-outline-secondary');
        btn.classList.remove('btn-secondary');
        icon.classList.add('fa-sort-amount-down-alt');
        icon.classList.remove('fa-sort-amount-up-alt');
    }

    currentPage = 1;
    paginateDoctors();
});

document.getElementById('selectPageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    paginateDoctors();
});

function changePage(direction) {
    const newPage = currentPage + direction;
    const maxPage = Math.ceil(allDoctors.length / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        paginateDoctors();
    }
}

function loadSelectFilter(field, selectId) {
    fetch(`/api/admin/doctors?action=distinct&field=${field}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = `<option value="">All ${capitalize(field)}</option>`;
            (data?.values || []).forEach(val => {
                select.innerHTML += `<option value="${val}">${val}</option>`;
            });
        })
        .catch(err => console.error(`Error loading ${field}:`, err));
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

//===============================================================================================================

function viewDoctor(doctorId) {
    const d = allDoctors.find(doc => doc.doctorId === doctorId);
    if (!d) return;

    selectedDoctorIdForReset = doctorId; // lưu để dùng cho reset

    document.getElementById('viewDoctorId').textContent = d.doctorId;
    document.getElementById('viewAccountStaffId').textContent = d.accountStaffId;
    document.getElementById('viewUsername').textContent = d.username;
    document.getElementById("viewPassword").value = d.password || '********';
    document.getElementById('viewEmail').textContent = d.email;
    document.getElementById('viewFullName').textContent = d.fullName;
    document.getElementById('viewDepartment').textContent = d.department;
    document.getElementById('viewPhone').textContent = d.phone;
    document.getElementById('viewEduLevel').textContent = d.eduLevel;
    document.getElementById('viewStatus').textContent = d.status;
    document.getElementById('viewRole').textContent = d.role;
    document.getElementById('viewImg').src = d.img || '';
}

function togglePasswordVisibility() {
    const pwdInput = document.getElementById("viewPassword");
    const icon = document.getElementById("togglePasswordIcon");
    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        pwdInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function resetDoctorPassword() {
    if (!selectedDoctorIdForReset) {
        alert("Please select a doctor.");
        return;
    }
    const accountStaffId = document.getElementById('viewAccountStaffId').textContent.trim();

    fetch("/api/admin/doctors", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: "action=resetPassword&accountStaffId=" + accountStaffId
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message)
            if (data.success) {
                fetchDoctorsWithFilter();
                const canvasEl = document.getElementById('doctorViewCanvas');
                let doctorId = document.getElementById('viewDoctorId').textContent.trim();
                bootstrap.Offcanvas.getOrCreateInstance(canvasEl).hide();
            }
        })
        .catch(err => alert("Error: " + err));
}

//===============================================================================================================
document.getElementById('cancelDoctorForm').addEventListener('click', () => {
    document.getElementById('doctorFormCard').style.display = 'none';
    document.getElementById("doctorSelectionCard").style.display = 'block';
});

document.getElementById('btnAddDoctor').addEventListener('click', () => {
    openDoctorForm('add');
});

function editDoctor(doctorId) {
    const doctor = allDoctors.find(d => d.doctorId === doctorId);
    if (doctor) {
        openDoctorForm('edit', doctor);
    }
}

async function openDoctorForm(mode, doctor = null) {
    const formCard = document.getElementById('doctorFormCard');
    const selectionCard = document.getElementById('doctorSelectionCard');
    const form = document.getElementById('doctorForm');
    const title = document.getElementById('doctorFormTitle');
    formCard.style.display = 'block';
    selectionCard.style.display = 'none';
    form.reset();

    // Luôn load select trước khi gán value
    await loadSelectForForm('department', 'department', 'customDepartment');
    await loadSelectForForm('eduLevel', 'eduLevel', 'customEduLevel');

    if (mode === 'edit' && doctor) {
        title.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Doctor';
        const previewImg = document.getElementById('previewImg');
        if (doctor.img && doctor.img !== '') {
            previewImg.src = doctor.img;
            previewImg.style.display = 'block';
        } else {
            previewImg.style.display = 'none';
        }

        document.getElementById('accountStaffId').value = doctor.accountStaffId;
        document.getElementById('doctorId').value = doctor.doctorId;
        document.getElementById('fullName').value = doctor.fullName;
        document.getElementById('username').value = doctor.username;
        document.getElementById('email').value = doctor.email;
        document.getElementById('phone').value = doctor.phone;
        document.getElementById('status').value = doctor.status;
        document.getElementById('img').value = '';

        document.getElementById('department').value = doctor.department;
        document.getElementById('eduLevel').value = doctor.eduLevel;

        // Reset custom input
        document.getElementById('customDepartment').classList.add('d-none');
        document.getElementById('customDepartment').removeAttribute('name');
        document.getElementById('customDepartment').value = '';

        document.getElementById('customEduLevel').classList.add('d-none');
        document.getElementById('customEduLevel').removeAttribute('name');
        document.getElementById('customEduLevel').value = '';
        const messageBox = document.getElementById('formMessage');
        messageBox.style.display = 'none';
    } else {
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Add Doctor';
        const previewImg = document.getElementById('previewImg');
        previewImg.src = '/assets/images/uploads/default.jpg';
        previewImg.style.display = 'none';

        document.getElementById('doctorId').value = '';
        document.getElementById('fullName').value = '';
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('img').value = '';

        document.getElementById('department').selectedIndex = 0;
        document.getElementById('eduLevel').selectedIndex = 0;
        document.getElementById('status').selectedIndex = 0;

        document.getElementById('customDepartment').classList.add('d-none');
        document.getElementById('customDepartment').removeAttribute('name');
        document.getElementById('customDepartment').value = '';

        document.getElementById('customEduLevel').classList.add('d-none');
        document.getElementById('customEduLevel').removeAttribute('name');
        document.getElementById('customEduLevel').value = '';
        const messageBox = document.getElementById('formMessage');
        messageBox.style.display = 'none';
    }
}

document.getElementById('img').addEventListener('change', function () {
    const file = this.files[0];
    const previewImg = document.getElementById('previewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.style.display = 'none';
    }
});

async function loadSelectForForm(field, selectId, inputId = null) {
    try {
        const response = await fetch(`/api/admin/doctors?action=distinct&field=${field}`);
        const data = await response.json();
        const select = document.getElementById(selectId);

        if (select) {
            select.innerHTML = '';
            const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
            select.innerHTML += `<option value="" disabled selected>Please select ${capitalized}</option>`;
            (data?.values || []).forEach(val => {
                select.innerHTML += `<option value="${val}">${val}</option>`;
            });
            select.innerHTML += `<option value="Other">Other</option>`;
            if (inputId) handleCustomInput(selectId, inputId);
        }
    } catch (error) {
        console.error(`Error loading options for ${field}:`, error);
    }
}

function handleCustomInput(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);

    const handleChange = () => {
        if (select.value === "Other") {
            input.classList.remove("d-none");
            input.setAttribute("name", select.getAttribute("name"));
            select.removeAttribute("name");
        } else {
            input.classList.add("d-none");
            input.removeAttribute("name");
            select.setAttribute("name", selectId);
        }
    };
    select.addEventListener("change", handleChange);
    handleChange();
}

document.addEventListener("DOMContentLoaded", () => {
    handleCustomInput("eduLevel", "customEduLevel");
    handleCustomInput("department", "customDepartment");
});

document.getElementById('doctorForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validateDoctorForm();

    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('') + "</ul>";
        displayFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const doctorId = document.getElementById('doctorId').value;
    const action = doctorId ? 'update' : 'create';
    formData.append('action', action);

    const customDept = document.getElementById('customDepartment');
    if (!formData.get('department') && customDept && customDept.value.trim() !== "") {
        formData.set('department', customDept.value.trim());
    }

    const customEdu = document.getElementById('customEduLevel');
    if (!formData.get('eduLevel') && customEdu && customEdu.value.trim() !== "") {
        formData.set('eduLevel', customEdu.value.trim());
    }

    try {
        const response = await fetch('/api/admin/doctors', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('doctorFormCard').style.display = 'none';
                document.getElementById('doctorSelectionCard').style.display = 'block';
                fetchDoctorsWithFilter();
            } else {
                displayFormMessage(result.message, result.success ? "success" : "danger");
            }

        } else {
            const rawText = await response.text();
            throw new Error("Unexpected response: " + rawText);
        }

    } catch (error) {
        console.error('Submit error:', error);
        displayFormMessage("Submit failed: " + error.message, "danger");
    }
});

function displayFormMessage(message, type = 'info') {
    const msgDiv = document.getElementById('formMessage');
    msgDiv.style.display = 'block';
    msgDiv.className = `mb-3 alert alert-${type}`;
    msgDiv.innerHTML = message;
}

function validateDoctorForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const usernameRaw = document.getElementById('username').value;
    const username = usernameRaw.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value.trim() || document.getElementById('customDepartment').value.trim();
    const eduLevel = document.getElementById('eduLevel').value.trim() || document.getElementById('customEduLevel').value.trim();

    const fullNameRegex = /^[A-Za-zÀ-ỹ]{2,}(?: [A-Za-zÀ-ỹ]{2,})+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;

    const errors = [];

    if (!fullName || !fullNameRegex.test(fullName)) {
        errors.push("Full Name must have at least two words, only letters.");
    }

    if (!username) {
        errors.push("Username cannot be empty or only whitespace.");
    } else if (username.length < 6) {
        errors.push("Username must be at least 6 characters long.");
    }

    if (!emailRegex.test(email)) {
        errors.push("Invalid email format.");
    }

    if (!phoneRegex.test(phone)) {
        errors.push("Phone must be exactly 10 digits and start with 0.");
    }

    if (!department) {
        errors.push("Department cannot be empty.");
    }

    if (!eduLevel) {
        errors.push("Education Level cannot be empty.");
    }

    return errors;
}

//===============================================================================

function toggleDoctorStatus(account_staff_id, currentStatus) {
    const newStatus = currentStatus === 'Enable' ? 'Disable' : 'Enable';

    fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: createFormData({
            action: 'updateStatus',
            account_staff_id: account_staff_id,
            status: newStatus
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                fetchDoctorsWithFilter();
            } else {
                alert("Failed: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Something went wrong!");
        });
}

function createFormData(data) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return formData;
}
