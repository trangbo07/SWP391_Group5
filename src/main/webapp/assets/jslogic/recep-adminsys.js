let allReceptionist = [];
let currentPage = 1;
let pageSize = 5;
let selectedReceptionistIdForReset = null;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    loadSelectFilter('status', 'filterReceptionistStatus');

    fetchReceptionistsWithFilter();

    // Gắn sự kiện cho bộ lọc
    document.getElementById('filterReceptionistStatus').addEventListener('change', fetchReceptionistsWithFilter);
    document.getElementById('receptionistSearchInput').addEventListener('input', debounce(fetchReceptionistsWithFilter, 400));

    document.getElementById('btnPreviousReceptionistPage').addEventListener('click', e => {
        e.preventDefault();
        changeReceptionistPage(-1);
    });

    document.getElementById('btnNextReceptionistPage').addEventListener('click', e => {
        e.preventDefault();
        changeReceptionistPage(1);
    });
});

async function fetchReceptionistsWithFilter() {
    const status = document.getElementById('filterReceptionistStatus')?.value || '';
    const search = document.getElementById('receptionistSearchInput')?.value || '';
    const tableBody = document.getElementById('receptionistTableBody');
    const info = document.getElementById('receptionistPaginationInfo');

    tableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

    const params = new URLSearchParams({ action: 'filter' });
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    try {
        const response = await fetch('/api/admin/receptionists?' + params.toString(), {
            method: 'GET',
            credentials: 'include'
        });
        const receptionists = await response.json();

        if (!Array.isArray(receptionists) || receptionists.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">No receptionists found.</td></tr>';
            if (info) info.innerText = `Showing 0 to 0 of 0 entries`;
            return;
        }

        allReceptionists = receptionists;
        currentReceptionistPage = 1;
        paginateReceptionists();

    } catch (error) {
        console.error('Error fetching receptionists:', error);
        tableBody.innerHTML = '<tr><td colspan="8">Failed to load receptionist data.</td></tr>';
    }
}

function paginateReceptionists() {
    const tableBody = document.getElementById('receptionistTableBody');
    const info = document.getElementById('receptionistPaginationInfo');

    const sourceList = isReversed ? [...allReceptionists].reverse() : allReceptionists;

    const start = (currentReceptionistPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sourceList.slice(start, end);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="8">No receptionists available.</td></tr>';
        info.innerText = `Showing 0 to 0 of ${allReceptionists.length} entries`;
        return;
    }

    tableBody.innerHTML = pageData.map((r, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${r.fullName}</td>
            <td>${r.username}</td>
            <td>${r.email}</td>
            <td>${r.status}</td>
            <td>${r.phone}</td>
            <td><img src="${r.img}" style="width: 40px; height: 40px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-sm btn-info me-1"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#receptionistViewCanvas"
                        onclick="viewReceptionist(${r.receptionistId})">View</button>
                <button class="btn btn-sm btn-warning me-1" onclick="editReceptionist(${r.receptionistId})">Edit</button>
                <button class="btn btn-sm ${r.status === 'Enable' ? 'btn-danger' : 'btn-success'}"
                        onclick="toggleReceptionistStatus(${r.accountStaffId}, '${r.status}')">
                    ${r.status === 'Enable' ? 'Disable' : 'Enable'}
                </button>
            </td>
        </tr>
    `).join('');

    const formattedStart = String(start + 1).padStart(2, '0');
    const formattedEnd = String(Math.min(end, allReceptionists.length)).padStart(2, '0');
    info.innerText = `Showing ${formattedStart} to ${formattedEnd} of ${allReceptionists.length} entries`;
}

document.getElementById('btnReverseReceptionistList').addEventListener('click', () => {
    isReversed = !isReversed;

    const btn = document.getElementById('btnReverseReceptionistList');
    const icon = btn.querySelector('i');

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

    currentReceptionistPage = 1;
    paginateReceptionists();
});

document.getElementById('selectReceptionistPageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentReceptionistPage = 1;
    paginateReceptionists();
});

function changeReceptionistPage(direction) {
    const newPage = currentReceptionistPage + direction;
    const maxPage = Math.ceil(allReceptionists.length / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
        currentReceptionistPage = newPage;
        paginateReceptionists();
    }
}

function loadSelectFilter(field, selectId) {
    fetch(`/api/admin/receptionists?action=distinct&field=${field}`)
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

//======================================================================================

function viewReceptionist(receptionistId) {
    const r = allReceptionists.find(rc => rc.receptionistId === receptionistId);
    if (!r) return;

    selectedReceptionistIdForReset = receptionistId; // lưu để dùng cho reset

    document.getElementById('viewReceptionistId').textContent = r.receptionistId;
    document.getElementById('viewAccountStaffId').textContent = r.accountStaffId;
    document.getElementById('viewUsername').textContent = r.username;
    document.getElementById('viewPassword').value = r.password || '********';
    document.getElementById('viewEmail').textContent = r.email;
    document.getElementById('viewFullName').textContent = r.fullName;
    document.getElementById('viewPhone').textContent = r.phone;
    document.getElementById('viewStatus').textContent = r.status;
    document.getElementById('viewRole').textContent = r.role;
    document.getElementById('viewImg').src = r.img || '';
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

function resetReceptionistPassword() {
    if (!selectedReceptionistIdForReset) {
        alert("Please select a receptionist.");
        return;
    }
    const accountStaffId = document.getElementById('viewAccountStaffId').textContent.trim();

    fetch("/api/admin/receptionists", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=resetPassword&accountStaffId=" + accountStaffId
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                fetchReceptionistsWithFilter();
                const canvasEl = document.getElementById('receptionistViewCanvas');
                bootstrap.Offcanvas.getOrCreateInstance(canvasEl).hide();
            }
        })
        .catch(err => alert("Error: " + err));
}

//==================================================================================

document.getElementById('cancelReceptionistForm').addEventListener('click', () => {
    document.getElementById('receptionistFormCard').style.display = 'none';
    document.getElementById("receptionistSelectionCard").style.display = 'block';
});

document.getElementById('btnAddReceptionist').addEventListener('click', () => {
    openReceptionistForm('add');
});

function editReceptionist(receptionistId) {
    const receptionist = allReceptionists.find(r => r.receptionistId === receptionistId);
    if (receptionist) {
        openReceptionistForm('edit', receptionist);
    }
}

function openReceptionistForm(mode, receptionist = null) {
    const formCard = document.getElementById('receptionistFormCard');
    const selectionCard = document.getElementById('receptionistSelectionCard');
    const form = document.getElementById('receptionistForm');
    const title = document.getElementById('receptionistFormTitle');
    formCard.style.display = 'block';
    selectionCard.style.display = 'none';
    form.reset();

    const previewImg = document.getElementById('previewImg');
    const messageBox = document.getElementById('formMessage');
    messageBox.style.display = 'none';

    if (mode === 'edit' && receptionist) {
        title.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Receptionist';

        previewImg.src = receptionist.img || '/assets/images/uploads/default.jpg';
        previewImg.style.display = receptionist.img ? 'block' : 'none';

        document.getElementById('accountStaffId').value = receptionist.accountStaffId;
        document.getElementById('receptionistId').value = receptionist.receptionistId;
        document.getElementById('fullName').value = receptionist.fullName;
        document.getElementById('username').value = receptionist.username;
        document.getElementById('email').value = receptionist.email;
        document.getElementById('phone').value = receptionist.phone;
        document.getElementById('status').value = receptionist.status;
        document.getElementById('img').value = '';
    } else {
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Add Receptionist';

        previewImg.src = '/assets/images/uploads/default.jpg';
        previewImg.style.display = 'none';

        document.getElementById('receptionistId').value = '';
        document.getElementById('fullName').value = '';
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('img').value = '';
        document.getElementById('status').selectedIndex = 0;
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

document.getElementById('receptionistForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validateReceptionistForm();

    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('') + "</ul>";
        displayFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const receptionistId = document.getElementById('receptionistId').value;
    const action = receptionistId ? 'update' : 'create';
    formData.append('action', action);

    try {
        const response = await fetch('/api/admin/receptionists', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('receptionistFormCard').style.display = 'none';
                document.getElementById('receptionistSelectionCard').style.display = 'block';
                fetchReceptionistsWithFilter();
            } else {
                displayFormMessage(result.message, "danger");
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

function validateReceptionistForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

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

    return errors;
}

function displayFormMessage(message, type = 'info') {
    const msgDiv = document.getElementById('formMessage');
    msgDiv.style.display = 'block';
    msgDiv.className = `mb-3 alert alert-${type}`;
    msgDiv.innerHTML = message;
}

//==================================================================================

function toggleReceptionistStatus(account_staff_id, currentStatus) {
    const newStatus = currentStatus === 'Enable' ? 'Disable' : 'Enable';

    fetch('/api/admin/receptionists', {
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
                fetchReceptionistsWithFilter();
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







