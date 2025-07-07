let allAdmins = [];
let currentPage = 1;
let pageSize = 5;
let selectedAdminIdForReset = null;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    loadSelectFilter('status', 'filterStatus');
    loadSelectFilter('role', 'filterRole');
    loadSelectFilter('department', 'filterDepartment');
    fetchAdminsWithFilter();

    document.getElementById('filterStatus').addEventListener('change', fetchAdminsWithFilter);
    document.getElementById('filterRole').addEventListener('change', fetchAdminsWithFilter);
    document.getElementById('filterDepartment').addEventListener('change', fetchAdminsWithFilter);
    document.getElementById('searchInput').addEventListener('input', debounce(fetchAdminsWithFilter, 400));
    document.getElementById('btnPreviousPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(-1);
    });
    document.getElementById('btnNextPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(1);
    });
    document.getElementById('role').addEventListener('change', () => {
        const deptSelect = document.getElementById('department');
        const customInput = document.getElementById('customDepartment');

        deptSelect.selectedIndex = 0;
        deptSelect.setAttribute('name', 'department');
        customInput.classList.add('d-none');
        customInput.removeAttribute('name');
        customInput.value = '';
    });

});

async function fetchAdminsWithFilter() {
    const status = document.getElementById('filterStatus')?.value || '';
    const role = document.getElementById('filterRole')?.value || '';
    const department = document.getElementById('filterDepartment')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    const tableBody = document.getElementById('adminTableBody');
    const info = document.getElementById('paginationInfo');

    tableBody.innerHTML = '<tr><td colspan="10">Loading...</td></tr>';

    const params = new URLSearchParams({action: 'filter'});
    if (status) params.append("status", status);
    if (role) params.append("role", role);
    if (department) params.append("department", department);
    if (search) params.append("search", search);

    try {
        const response = await fetch('/api/admin/admins?' + params.toString(), {
            method: 'GET',
            credentials: 'include'
        });
        const admins = await response.json();

        if (!Array.isArray(admins) || admins.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10">No admins found.</td></tr>';
            if (info) info.innerText = `Showing 0 to 0 of 0 entries`;
            return;
        }

        allAdmins = admins;
        currentPage = 1;
        paginateAdmins();

    } catch (error) {
        console.error('Error fetching admins:', error);
        tableBody.innerHTML = '<tr><td colspan="10">Failed to load admin data.</td></tr>';
    }
}

function paginateAdmins() {
    const tableBody = document.getElementById('adminTableBody');
    const info = document.getElementById('paginationInfo');

    const sourceList = isReversed ? [...allAdmins].reverse() : allAdmins;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sourceList.slice(start, end);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="10">No admins available.</td></tr>';
        info.innerText = `Showing 0 to 0 of ${allAdmins.length} entries`;
        return;
    }

    tableBody.innerHTML = pageData.map((a, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${a.fullName}</td>
            <td>${a.username}</td>
            <td>${a.email}</td>
            <td>${a.status}</td>
            <td>${a.phone}</td>
            <td>${a.department}</td>
            <td>
              ${a.role === 'AdminSys' ? 'Admin System' :
                    a.role === 'AdminBusiness' ? 'Admin Business' :
                        a.role}
            </td>

            <td><img src="${a.img}" style="width: 40px; height: 40px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-sm btn-info me-1"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#adminViewCanvas"
                        onclick="viewAdmin(${a.adminId})">View</button>
                <button class="btn btn-sm btn-warning me-1" onclick="editAdmin(${a.adminId})">Edit</button>
                <button class="btn btn-sm ${a.status === 'Enable' ? 'btn-danger' : 'btn-success'}"
                        onclick="toggleAdminStatus(${a.accountStaffId}, '${a.status}')">
                    ${a.status === 'Enable' ? 'Disable' : 'Enable'}
                </button>
            </td>
        </tr>
    `).join('');

    const formattedStart = String(start + 1).padStart(2, '0');
    const formattedEnd = String(Math.min(end, allAdmins.length)).padStart(2, '0');
    info.innerText = `Showing ${formattedStart} to ${formattedEnd} of ${allAdmins.length} entries`;
}

document.getElementById('btnReverseList').addEventListener('click', () => {
    isReversed = !isReversed;

    const btn = document.getElementById('btnReverseList');
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

    currentPage = 1;
    paginateAdmins();
});

document.getElementById('selectPageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    paginateAdmins();
});

function changePage(direction) {
    const newPage = currentPage + direction;
    const maxPage = Math.ceil(allAdmins.length / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        paginateAdmins();
    }
}

function loadSelectFilter(field, selectId) {
    fetch(`/api/admin/admins?action=distinct&field=${field}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById(selectId);
            if (!select) return;

            select.innerHTML = `<option value="">All ${capitalize(field)}</option>`;

            (data?.values || []).forEach(val => {
                let displayVal = val;

                if (field === "role") {
                    displayVal = val === "AdminSys" ? "Admin System" :
                        val === "AdminBusiness" ? "Admin Business" :
                            val; // fallback
                }

                select.innerHTML += `<option value="${val}">${displayVal}</option>`;
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

function viewAdmin(adminId) {
    const a = allAdmins.find(ad => ad.adminId === adminId);
    if (!a) return;

    selectedAdminIdForReset = adminId;

    document.getElementById('viewAdminId').textContent = a.adminId;
    document.getElementById('viewAccountStaffId').textContent = a.accountStaffId;
    document.getElementById('viewUsername').textContent = a.username;
    document.getElementById("viewPassword").value = a.password || '********';
    document.getElementById('viewEmail').textContent = a.email;
    document.getElementById('viewFullName').textContent = a.fullName;
    document.getElementById('viewDepartment').textContent = a.department;
    document.getElementById('viewPhone').textContent = a.phone;
    document.getElementById('viewStatus').textContent = a.status;
    document.getElementById('viewRole').textContent = a.role;
    document.getElementById('viewImg').src = a.img || '';
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

function resetAdminPassword() {
    if (!selectedAdminIdForReset) {
        alert("Please select an admin.");
        return;
    }
    const accountStaffId = document.getElementById('viewAccountStaffId').textContent.trim();

    fetch("/api/admin/admins", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: "action=resetPassword&accountStaffId=" + accountStaffId
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message)
            if (data.success) {
                fetchAdminsWithFilter();
                const canvasEl = document.getElementById('adminViewCanvas');
                bootstrap.Offcanvas.getOrCreateInstance(canvasEl).hide();
            }
        })
        .catch(err => alert("Error: " + err));
}

//===============================================================================================================

document.getElementById('cancelAdminForm').addEventListener('click', () => {
    document.getElementById('adminFormCard').style.display = 'none';
    document.getElementById("adminSelectionCard").style.display = 'block';
});

document.getElementById('btnAddAdmin').addEventListener('click', () => {
    openAdminForm('add');
});

function editAdmin(adminId) {
    const admin = allAdmins.find(a => a.adminId === adminId);
    if (admin) {
        openAdminForm('edit', admin);
    }
}

async function openAdminForm(mode, admin = null) {
    const formCard = document.getElementById('adminFormCard');
    const selectionCard = document.getElementById('adminSelectionCard');
    const form = document.getElementById('adminForm');
    const title = document.getElementById('adminFormTitle');
    formCard.style.display = 'block';
    selectionCard.style.display = 'none';
    form.reset();

    await loadSelectForForm('department', 'department', 'customDepartment');

    if (mode === 'edit' && admin) {
        title.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Admin';
        const previewImg = document.getElementById('previewImgAdmin');
        if (admin.img && admin.img !== '') {
            previewImg.src = admin.img;
            previewImg.style.display = 'block';
        } else {
            previewImg.style.display = 'none';
        }

        document.getElementById('accountStaffId').value = admin.accountStaffId;
        document.getElementById('adminId').value = admin.adminId;
        document.getElementById('fullName').value = admin.fullName;
        document.getElementById('username').value = admin.username;
        document.getElementById('email').value = admin.email;
        document.getElementById('phone').value = admin.phone;
        document.getElementById('status').value = admin.status;
        document.getElementById('role').value = admin.role;
        document.getElementById('img').value = '';

        document.getElementById('department').value = admin.department;

        document.getElementById('customDepartment').classList.add('d-none');
        document.getElementById('customDepartment').removeAttribute('name');
        document.getElementById('customDepartment').value = '';

        document.getElementById('formMessage').style.display = 'none';
    } else {
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Add Admin';
        const previewImg = document.getElementById('previewImgAdmin');
        previewImg.src = '/assets/images/uploads/default.jpg';
        previewImg.style.display = 'none';

        document.getElementById('adminId').value = '';
        document.getElementById('fullName').value = '';
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('img').value = '';

        document.getElementById('department').selectedIndex = 0;
        document.getElementById('status').selectedIndex = 0;
        document.getElementById('role').selectedIndex = 0;

        document.getElementById('customDepartment').classList.add('d-none');
        document.getElementById('customDepartment').removeAttribute('name');
        document.getElementById('customDepartment').value = '';

        document.getElementById('formMessage').style.display = 'none';
    }
}

document.getElementById('img').addEventListener('change', function () {
    const file = this.files[0];
    const previewImg = document.getElementById('previewImgAdmin');

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
        const response = await fetch(`/api/admin/admins?action=distinct&field=${field}`);
        const data = await response.json();
        const select = document.getElementById(selectId);

        if (select) {
            select.innerHTML = '';
            const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
            select.innerHTML += `<option value="" disabled selected>Please select ${capitalized}</option>`;

            (data?.values || []).forEach(val => {
                let displayVal = val;

                if (field === "role") {
                    displayVal = val === "AdminSys" ? "Admin System" :
                        val === "AdminBusiness" ? "Admin Business" :
                            val;
                }

                select.innerHTML += `<option value="${val}">${displayVal}</option>`;
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

    select.addEventListener("change", () => {
        if (select.value === "Other") {
            input.classList.remove("d-none");
            input.setAttribute("name", select.getAttribute("name"));
            select.removeAttribute("name");
        } else {
            input.classList.add("d-none");
            input.removeAttribute("name");
            select.setAttribute("name", selectId);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    handleCustomInput("department", "customDepartment");
});

document.getElementById('adminForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validateAdminForm();

    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('') + "</ul>";
        displayFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const adminId = document.getElementById('adminId').value;
    const action = adminId ? 'update' : 'create';
    formData.append('action', action);

    const customDept = document.getElementById('customDepartment');
    if (!formData.get('department') && customDept && customDept.value.trim() !== "") {
        formData.set('department', customDept.value.trim());
    }

    try {
        const response = await fetch('/api/admin/admins', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('adminFormCard').style.display = 'none';
                document.getElementById('adminSelectionCard').style.display = 'block';
                fetchAdminsWithFilter();
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

function validateAdminForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value.trim() || document.getElementById('customDepartment').value.trim();

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

    return errors;
}

//===============================================================================================================

function toggleAdminStatus(account_staff_id, currentStatus) {
    const newStatus = currentStatus === 'Enable' ? 'Disable' : 'Enable';

    fetch('/api/admin/admins', {
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
                fetchAdminsWithFilter();
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