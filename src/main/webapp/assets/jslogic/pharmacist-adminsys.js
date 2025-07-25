let allPharmacists = [];
let currentPage = 1;
let pageSize = 5;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    loadSelectFilter('status', 'filterStatus');
    loadSelectFilter('eduLevel', 'filterEduLevel');
    fetchPharmacistsWithFilter();

    document.getElementById('filterStatus').addEventListener('change', fetchPharmacistsWithFilter);
    document.getElementById('filterEduLevel').addEventListener('change', fetchPharmacistsWithFilter);
    document.getElementById('searchInput').addEventListener('input', debounce(fetchPharmacistsWithFilter, 400));
    document.getElementById('btnPreviousPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(-1);
    });
    document.getElementById('btnNextPage').addEventListener('click', e => {
        e.preventDefault();
        changePage(1);
    });
});

async function fetchPharmacistsWithFilter() {
    const status = document.getElementById('filterStatus')?.value || '';
    const eduLevel = document.getElementById('filterEduLevel')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    const tableBody = document.getElementById('pharmacistListTableBody');
    const info = document.getElementById('paginationInfo');

    tableBody.innerHTML = '<tr><td colspan="9">Đang tải...</td></tr>';

    const params = new URLSearchParams({action: 'filter'});
    if (status) params.append("status", status);
    if (eduLevel) params.append("eduLevel", eduLevel);
    if (search) params.append("search", search);

    try {
        const response = await fetch('/api/admin/pharmacists?' + params.toString(), {
            method: 'GET',
            credentials: 'include'
        });
        const pharmacists = await response.json();

        if (!Array.isArray(pharmacists) || pharmacists.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9">Không tìm thấy dược sĩ nào.</td></tr>';
            if (info) info.innerText = `Hiển thị 0 đến 0 trong tổng số 0 bản ghi`;
            return;
        }

        allPharmacists = pharmacists;
        currentPage = 1;
        paginatePharmacists();

    } catch (error) {
        console.error('Lỗi khi tìm kiếm dược sĩ:', error);
        tableBody.innerHTML = '<tr><td colspan="9">Không tải được dữ liệu tài khoản dược sĩ</td></tr>';
    }
}

function paginatePharmacists() {
    const tableBody = document.getElementById('pharmacistListTableBody');
    const info = document.getElementById('paginationInfo');

    const sourceList = isReversed ? [...allPharmacists].reverse() : allPharmacists;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sourceList.slice(start, end);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="9">Không tìm thấy dược sĩ nào.</td></tr>';
        info.innerText = `Hiển thị 0 đến 0 trong tổng số ${allPharmacists.length} bản ghi`;
        return;
    }

    tableBody.innerHTML = pageData.map((p, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${p.fullName}</td>
            <td>${p.username}</td>
            <td>${p.email}</td>
            <td>${p.status === 'Enable' ? 'Kích hoạt' : 'Vô hiệu hóa'}</td>
            <td>${p.phone}</td>
            <td>${p.eduLevel}</td>
            <td><img src="${p.img}" style="width: 40px; height: 40px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-sm btn-info me-1"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#pharmacistViewCanvas"
                            onclick="viewPharmacist(${p.pharmacistId})">Chi tiết</button>
                <button class="btn btn-sm btn-warning me-1" onclick="editPharmacist(${p.pharmacistId})">Chỉnh sửa</button>
                <button class="btn btn-sm ${p.status === 'Enable' ? 'btn-danger' : 'btn-success'}"
                        onclick="togglePharmacistStatus(${p.accountPharmacistId}, '${p.status}')">
                    ${p.status === 'Enable' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
            </td>
        </tr>
    `).join('');

    const formattedStart = String(start + 1).padStart(2, '0');
    const formattedEnd = String(Math.min(end, allPharmacists.length)).padStart(2, '0');
    info.innerText = `Hiển thị ${formattedStart} đến ${formattedEnd} trong tổng số ${allPharmacists.length} bản ghi`;
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
    paginatePharmacists();
});

document.getElementById('selectPageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    paginatePharmacists();
});

function changePage(direction) {
    const newPage = currentPage + direction;
    const maxPage = Math.ceil(allPharmacists.length / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        paginatePharmacists();
    }
}

function loadSelectFilter(field, selectId) {
    fetch(`/api/admin/pharmacists?action=distinct&field=${field}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById(selectId);
            if (!select) return;

            let fl = field === 'status' ? 'trạng thái' :
                field === 'eduLevel' ? 'trình độ' :
                    field;

            select.innerHTML = `<option value="">Tất cả ${fl}</option>`;
            (data?.values || []).forEach(val => {
                let displayVal = val;
                if (field === "status") {
                    val === "Disable" ? 'Kích hoạt' :
                        val === "Enable" ? 'Vô hiệu hóa' :
                            val;
                }
                select.innerHTML += `<option value="${val}">${displayVal}</option>`;
            });
        })
        .catch(err => console.error(`Lỗi tải ${field}:`, err));
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

//=====================================================================================

function viewPharmacist(pharmacistId) {
    const p = allPharmacists.find(ph => ph.pharmacistId === pharmacistId);
    if (!p) return;

    selectedPharmacistIdForReset = pharmacistId;

    document.getElementById('viewPharmacistId').textContent = p.pharmacistId;
    document.getElementById('viewAccountPharmacistId').textContent = p.accountPharmacistId;
    document.getElementById('viewUsername').textContent = p.username;
    document.getElementById('viewEmail').textContent = p.email;
    document.getElementById('viewFullName').textContent = p.fullName;
    document.getElementById('viewPhone').textContent = p.phone;
    document.getElementById('viewEduLevel').textContent = p.eduLevel;
    document.getElementById('viewStatus').textContent = p.status === "Disable" ? 'Kích hoạt' :
                                                                                    p.status === "Enable" ? 'Vô hiệu hóa' :
                                                                                        p.status;
    document.getElementById('viewImg').src = p.img || '';
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

function resetPharmacistPassword() {
    if (!selectedPharmacistIdForReset) {
        alert("Vui lòng chọn một dược sĩ");
        return;
    }
    const accountPharmacistId = document.getElementById('viewAccountPharmacistId').textContent.trim();

    fetch("/api/admin/pharmacists", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: "action=resetPassword&accountPharmacistId=" + accountPharmacistId
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                fetchPharmacistsWithFilter();
                const canvasEl = document.getElementById('pharmacistViewCanvas');
                bootstrap.Offcanvas.getOrCreateInstance(canvasEl).hide();
            }
        })
        .catch(err => alert("Lỗi: " + err));
}

//=====================================================================================

document.getElementById('cancelPharmacistForm').addEventListener('click', () => {
    document.getElementById('pharmacistFormCard').style.display = 'none';
    document.getElementById("pharmacistSelectionCard").style.display = 'block';
});

document.getElementById('btnAddPharmacist').addEventListener('click', () => {
    openPharmacistForm('add');
});

function editPharmacist(pharmacistId) {
    const pharmacist = allPharmacists.find(p => p.pharmacistId === pharmacistId);
    if (pharmacist) {
        openPharmacistForm('edit', pharmacist);
    }
}

async function openPharmacistForm(mode, pharmacist = null) {
    const formCard = document.getElementById('pharmacistFormCard');
    const selectionCard = document.getElementById('pharmacistSelectionCard');
    const form = document.getElementById('pharmacistForm');
    const title = document.getElementById('pharmacistFormTitle');
    formCard.style.display = 'block';
    selectionCard.style.display = 'none';
    form.reset();

    await loadSelectForForm('eduLevel', 'eduLevel', 'customEduLevel');

    if (mode === 'edit' && pharmacist) {
        title.innerHTML = '<i class="fas fa-edit me-2"></i>Chỉnh sửa dược sĩ';
        const previewImg = document.getElementById('previewImg');
        if (pharmacist.img && pharmacist.img !== '') {
            previewImg.src = pharmacist.img;
            previewImg.style.display = 'block';
        } else {
            previewImg.style.display = 'none';
        }

        document.getElementById('accountPharmacistId').value = pharmacist.accountPharmacistId;
        document.getElementById('pharmacistId').value = pharmacist.pharmacistId;
        document.getElementById('fullName').value = pharmacist.fullName;
        document.getElementById('username').value = pharmacist.username;
        document.getElementById('email').value = pharmacist.email;
        document.getElementById('phone').value = pharmacist.phone;
        document.getElementById('status').value = pharmacist.status;
        document.getElementById('img').value = '';

        document.getElementById('eduLevel').value = pharmacist.eduLevel;

        document.getElementById('customEduLevel').classList.add('d-none');
        document.getElementById('customEduLevel').removeAttribute('name');
        document.getElementById('customEduLevel').value = '';
        const messageBox = document.getElementById('formMessage');
        messageBox.style.display = 'none';
    } else {
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Thêm dược sĩ';
        const previewImg = document.getElementById('previewImg');
        previewImg.src = '/assets/images/uploads/default.jpg';
        previewImg.style.display = 'none';

        document.getElementById('pharmacistId').value = '';
        document.getElementById('fullName').value = '';
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('img').value = '';

        document.getElementById('eduLevel').selectedIndex = 0;
        document.getElementById('status').selectedIndex = 0;

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
        const response = await fetch(`/api/admin/pharmacists?action=distinct&field=${field}`);
        const data = await response.json();
        const select = document.getElementById(selectId);

        if (select) {
            select.innerHTML = '';
            const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
            select.innerHTML += `<option value="" disabled selected>Please select ${capitalized}</option>`;
            (data?.values || []).forEach(val => {
                let displayVal = val;
                if (field === "status") {
                    displayVal = val === "Disable" ? 'Kích hoạt' :
                        val === "Enable" ? 'Vô hiệu hóa' :
                            val;
                }
                select.innerHTML += `<option value="${val}">${displayVal}</option>`;
            });
            select.innerHTML += `<option value="Other">Other</option>`;
            if (inputId) handleCustomInput(selectId, inputId);
        }
    } catch (error) {
        console.error(`Lỗi tải các tùy chọn cho ${field}:`, error);
    }
}

function handleCustomInput(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);

    if (!select || !input) return;

    const originalName = select.getAttribute("name");

    select.addEventListener("change", () => {
        if (select.value === "Other") {
            input.classList.remove("d-none");
            input.setAttribute("name", originalName);
            select.removeAttribute("name");
        } else {
            input.classList.add("d-none");
            input.removeAttribute("name");
            select.setAttribute("name", originalName);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    handleCustomInput("eduLevel", "customEduLevel");
});

document.getElementById('pharmacistForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validatePharmacistForm();

    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('') + "</ul>";
        displayFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const pharmacistId = document.getElementById('pharmacistId').value;
    const action = pharmacistId ? 'update' : 'create';
    formData.append('action', action);

    const customEdu = document.getElementById('customEduLevel');
    if (!formData.get('eduLevel') && customEdu && customEdu.value.trim() !== "") {
        formData.set('eduLevel', customEdu.value.trim());
    }

    try {
        const response = await fetch('/api/admin/pharmacists', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('pharmacistFormCard').style.display = 'none';
                document.getElementById('pharmacistSelectionCard').style.display = 'block';
                fetchPharmacistsWithFilter();
            } else {
                displayFormMessage(result.message, result.success ? "success" : "danger");
            }
        } else {
            const rawText = await response.text();
            throw new Error("Phản hồi bất ngờ: " + rawText);
        }

    } catch (error) {
        console.error('Lưu không thành công:', error);
        displayFormMessage("Lưu không thành công: " + error.message, "danger");
    }
});

function displayFormMessage(message, type = 'info') {
    const msgDiv = document.getElementById('formMessage');
    msgDiv.style.display = 'block';
    msgDiv.className = `mb-3 alert alert-${type}`;
    msgDiv.innerHTML = message;
}

function validatePharmacistForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const usernameRaw = document.getElementById('username').value;
    const username = usernameRaw.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const eduLevel = document.getElementById('eduLevel').value.trim() || document.getElementById('customEduLevel').value.trim();

    const fullNameRegex = /^[A-Za-zÀ-ỹ]{2,}(?: [A-Za-zÀ-ỹ]{2,})+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;

    const errors = [];

    if (!fullName || !fullNameRegex.test(fullName)) {
        errors.push("Họ và tên phải có ít nhất hai từ, chỉ chứa chữ cái.");
    }

    if (!username) {
        errors.push("Tên đăng nhập không được để trống hoặc chỉ chứa khoảng trắng.");
    } else if (username.length < 6) {
        errors.push("Tên đăng nhập phải có ít nhất 6 ký tự.");
    }

    if (!emailRegex.test(email)) {
        errors.push("Định dạng email không hợp lệ.");
    }

    if (!phoneRegex.test(phone)) {
        errors.push("Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0.");
    }

    if (!eduLevel) {
        errors.push("Trình độ học vấn không được để trống.");
    }

    return errors;
}

//=====================================================================================

function togglePharmacistStatus(accountPharmacistId, currentStatus) {
    const newStatus = currentStatus === 'Enable' ? 'Disable' : 'Enable';

    fetch('/api/admin/pharmacists', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: createFormData({
            action: 'updateStatus',
            accountPharmacistId: accountPharmacistId,
            status: newStatus
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                fetchPharmacistsWithFilter(); // Gọi lại danh sách đã lọc
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Có gì đó không ổn!");
        });
}

function createFormData(data) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return formData;
}

