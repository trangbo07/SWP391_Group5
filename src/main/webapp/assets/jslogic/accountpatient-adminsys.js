let allAccountPatients = [];
let currentPage = 1;
let pageSize = 5;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    loadSelectFilterAccountPatient('status', 'filterStatus');
    fetchPatientsWithFilter();

    document.getElementById('filterStatus').addEventListener('change', fetchPatientsWithFilter);
    document.getElementById('searchInput').addEventListener('input', debounce(fetchPatientsWithFilter, 400));

    document.getElementById('btnPreviousPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(-1);
    });

    document.getElementById('btnNextPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(1);
    });

    document.getElementById('selectPageSize').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        paginateAccountPatients();
    });
});

async function fetchPatientsWithFilter() {
    const status = document.getElementById('filterStatus')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    const tableBody = document.getElementById('accountPatientTableBody');
    const info = document.getElementById('paginationInfo');

    tableBody.innerHTML = '<tr><td colspan="6">Đang tải...</td></tr>';

    const params = new URLSearchParams({action: 'filter'});
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    try {
        const response = await fetch('/api/admin/accountpatients?' + params.toString(), {
            method: 'GET',
            credentials: 'include'
        });
        const patients = await response.json();

        if (!Array.isArray(patients) || patients.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">Không tìm thấy bệnh nhân nào.</td></tr>';
            if (info) info.innerText = `Hiển thị 0 đến 0 trong tổng số 0 bản ghi`;
            return;
        }

        allAccountPatients = patients;
        currentPage = 1;
        paginateAccountPatients();

    } catch (error) {
        console.error('Lỗi khi tìm kiếm tài khoản :', error);
        tableBody.innerHTML = '<tr><td colspan="6">Không tải được dữ liệu tài khoản bệnh nhân.</td></tr>';
    }
}

function paginateAccountPatients() {
    const tableBody = document.getElementById('accountPatientTableBody');
    const info = document.getElementById('paginationInfo');

    const sourceList = isReversed ? [...allAccountPatients].reverse() : allAccountPatients;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sourceList.slice(start, end);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="6">Không có dữ liệu có sẵn.</td></tr>';
        info.innerText = `Hiển thị 0 đến 0 trong tổng số ${allAccountPatients.length} bản ghi`;
        return;
    }

    tableBody.innerHTML = pageData.map((p, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${p.username}</td>
            <td>${p.email}</td>
            <td>${p.status === 'Enable' ? 'Kích hoạt' : 'Vô hiệu hóa'}</td>
            <td><img src="${p.img}" style="width: 40px; height: 40px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-sm btn-info me-1"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#accountPatientViewCanvas"
                        onclick="viewAccountPatient(${p.accountPatientId})">Chi tiết</button>
                <button class="btn btn-sm btn-warning me-1"
                        onclick="editAccountPatient(${p.accountPatientId})">Chỉnh sửa</button>
                <button class="btn btn-sm ${p.status === 'Enable' ? 'btn-danger' : 'btn-success'}"
                        onclick="toggleAccountPatientStatus(${p.accountPatientId}, '${p.status}')">
                    ${p.status === 'Enable' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
                <button class="btn btn-sm btn-secondary"
                        onclick="viewPatientsOfAccount(${p.accountPatientId})">
                    Danh sách bệnh nhân
                </button>
            </td>
        </tr>
    `).join('');

    info.innerText = `Hiển thị ${start + 1} đến ${Math.min(end, allAccountPatients.length)} trong tổng số ${allAccountPatients.length} bản ghi`;
}

function changePage(direction) {
    const newPage = currentPage + direction;
    const maxPage = Math.ceil(allAccountPatients.length / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        paginateAccountPatients();
    }
}

function loadSelectFilterAccountPatient(field, selectId) {
    fetch(`/api/admin/accountpatients?action=distinct&field=${field}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById(selectId);
            if (!select) return;

            let fl = field === 'status' ? 'trạng thái' :
                    field;

            select.innerHTML = `<option value="">Tất cả ${fl}</option>`;
            (data?.values || []).forEach(val => {
                if (field === "status") {
                    displayVal = val === "Enable" ? 'Kích hoạt' :
                        val === "Disable" ? 'Vô hiệu hóa' :
                            val;
                }
                select.innerHTML += `<option value="${val}">${displayVal}</option>`;
            });
        })
        .catch(err => console.error(`Lỗi tải ${field}:`, err));
}

document.getElementById('selectPageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    paginateAccountPatients();
});

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
    paginateAccountPatients();
});

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//===============================================================================================================

function viewAccountPatient(accountPatientId) {
    const a = allAccountPatients.find(ap => ap.accountPatientId === accountPatientId);
    if (!a) return;

    selectedAccountPatientIdForReset = accountPatientId;

    document.getElementById('viewAccountPatientId').textContent = a.accountPatientId;
    document.getElementById('viewUsername').textContent = a.username;
    document.getElementById("viewPassword").value = a.password || '********';
    document.getElementById('viewEmail').textContent = a.email;
    document.getElementById('viewStatus').textContent = a.status === "Disable" ? 'Kích hoạt' :
                                                                                    a.status === "Enable" ? 'Vô hiệu hóa' :
                                                                                        a.status ;
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

function resetAccountPatientPassword() {
    if (!selectedAccountPatientIdForReset) {
        alert("Vui lòng chọn một tài khoản.");
        return;
    }

    const accountPatientId = document.getElementById('viewAccountPatientId').textContent.trim();

    fetch("/api/admin/accountpatients", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: "action=resetPassword&accountPatientId=" + accountPatientId
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                fetchPatientsWithFilter();
                const canvasEl = document.getElementById('accountPatientViewCanvas');
                bootstrap.Offcanvas.getOrCreateInstance(canvasEl).hide();
            }
        })
        .catch(err => alert("Lỗi: " + err));
}

//===============================================================================================================

document.getElementById('cancelAccountPatientForm').addEventListener('click', () => {
    document.getElementById('accountPatientFormCard').style.display = 'none';
    document.getElementById("accountPatientSelectionCard").style.display = 'block';
});

document.getElementById('btnAddAccountPatient').addEventListener('click', () => {
    openAccountPatientForm('add');
});

function editAccountPatient(accountPatientId) {
    const acc = allAccountPatients.find(p => p.accountPatientId === accountPatientId);
    if (acc) {
        openAccountPatientForm('edit', acc);
    }
}

async function openAccountPatientForm(mode, acc = null) {
    const formCard = document.getElementById('accountPatientFormCard');
    const selectionCard = document.getElementById('accountPatientSelectionCard');
    const form = document.getElementById('accountPatientForm');
    const title = document.getElementById('accountPatientFormTitle');

    formCard.style.display = 'block';
    selectionCard.style.display = 'none';
    form.reset();

    if (mode === 'edit' && acc) {
        title.innerHTML = '<i class="fas fa-edit me-2"></i>Chỉnh sửa tài khoản';
        const previewImg = document.getElementById('previewImg');
        if (acc.img && acc.img !== '') {
            previewImg.src = acc.img;
            previewImg.style.display = 'block';
        } else {
            previewImg.style.display = 'none';
        }

        document.getElementById('accountPatientId').value = acc.accountPatientId;
        document.getElementById('username').value = acc.username;
        document.getElementById('email').value = acc.email;
        document.getElementById('status').value = acc.status;
        document.getElementById('img').value = '';

        document.getElementById('formMessage').style.display = 'none';
    } else {
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Thêm tài khoản';
        const previewImg = document.getElementById('previewImg');
        previewImg.src = '/assets/images/uploads/default.jpg';
        previewImg.style.display = 'none';

        document.getElementById('accountPatientId').value = '';
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        document.getElementById('status').selectedIndex = 0;
        document.getElementById('img').value = '';

        document.getElementById('formMessage').style.display = 'none';
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

document.getElementById('accountPatientForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validateAccountPatientForm();
    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('') + "</ul>";
        displayFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const accountPatientId = document.getElementById('accountPatientId').value;
    const action = accountPatientId ? 'update' : 'create';
    formData.append('action', action);

    try {
        const response = await fetch('/api/admin/accountpatients', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('accountPatientFormCard').style.display = 'none';
                document.getElementById('accountPatientSelectionCard').style.display = 'block';
                fetchPatientsWithFilter();
            } else {
                displayFormMessage(result.message, result.success ? "success" : "danger");
            }

        } else {
            const rawText = await response.text();
            throw new Error("Phản hồi bất ngờ: " + rawText);
        }

    } catch (error) {
        console.error('Gửi không thành công:', error);
        displayFormMessage("Gửi không thành công:" + error.message, "danger");
    }
});

function displayFormMessage(message, type = 'info') {
    const msgDiv = document.getElementById('formMessage');
    msgDiv.style.display = 'block';
    msgDiv.className = `mb-3 alert alert-${type}`;
    msgDiv.innerHTML = message;
}

function validateAccountPatientForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errors = [];

    if (!username) {
        errors.push("Tên đăng nhập không được để trống hoặc chỉ chứa khoảng trắng.");
    } else if (username.length < 6) {
        errors.push("Tên đăng nhập phải có ít nhất 6 ký tự.");
    }

    if (!emailRegex.test(email)) {
        errors.push("Định dạng email không hợp lệ.");
    }

    return errors;
}

//============================================================================================================

function toggleAccountPatientStatus(account_patient_id, currentStatus) {
    const newStatus = currentStatus === 'Enable' ? 'Disable' : 'Enable';

    fetch('/api/admin/accountpatients', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: createFormData({
            action: 'updateStatus',
            account_patient_id: account_patient_id,
            status: newStatus
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                fetchPatientsWithFilter();
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Đã xảy ra lỗi!");
        });
}

function createFormData(data) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return formData;
}

//============================================================================================================

function viewPatientsOfAccount(accountPatientId) {
    window.location.href = `/view/listpatient-adminsys.html?accountPatientId=${accountPatientId}`;
}