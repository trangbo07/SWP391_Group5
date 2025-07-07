let allPatients = [];
let currentPatientPage = 1;
let patientPageSize = 5;
let isPatientReversed = false;
let currentAccountPatientId = null;
let selectedPatientId = null;

document.addEventListener("DOMContentLoaded", () => {
    currentAccountPatientId = getAccountPatientIdFromURL();
    if (currentAccountPatientId) {
        fetchPatientsOfAccount(currentAccountPatientId);
    }

    document.getElementById('filterGender').addEventListener('change', () => {
        fetchPatientsOfAccount(currentAccountPatientId);
    });
    document.getElementById('searchInput').addEventListener('input', debounce(() => {
        fetchPatientsOfAccount(currentAccountPatientId);
    }, 400));


    document.getElementById('selectPageSize')?.addEventListener('change', (e) => {
        patientPageSize = parseInt(e.target.value);
        currentPatientPage = 1;
        paginatePatients();
    });

    document.getElementById('btnReverseList')?.addEventListener('click', () => {
        isPatientReversed = !isPatientReversed;

        const btn = document.getElementById('btnReverseList');
        const icon = btn.querySelector('i');

        if (isPatientReversed) {
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

        currentPatientPage = 1;
        paginatePatients();
    });

    document.getElementById('btnPreviousPage')?.addEventListener('click', () => {
        changePatientPage(-1);
    });

    document.getElementById('btnNextPage')?.addEventListener('click', () => {
        changePatientPage(1);
    });
});

function getAccountPatientIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('accountPatientId');
}

async function fetchPatientsOfAccount(accountPatientId) {
    const tableBody = document.getElementById('patientTableBody');
    const info = document.getElementById('patientPaginationInfo');

    tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    // Lấy các filter còn lại
    const gender = document.getElementById('filterGender')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    console.log(search);
    console.log(gender);

    const queryParams = new URLSearchParams({
        accountPatientId,
        gender,
        search
    });

    try {
        const response = await fetch(`/api/admin/patients?${queryParams.toString()}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No patients found.</td></tr>';
            if (info) info.innerText = `Showing 0 to 0 of 0 entries`;
            return;
        }

        allPatients = data;
        currentPatientPage = 1;
        paginatePatients();
    } catch (err) {
        console.error("Error fetching patients:", err);
        tableBody.innerHTML = '<tr><td colspan="5">Failed to load patients.</td></tr>';
    }
}

function paginatePatients() {
    const tableBody = document.getElementById('patientTableBody');
    const info = document.getElementById('patientPaginationInfo');

    const sourceList = isPatientReversed ? [...allPatients].reverse() : allPatients;

    const start = (currentPatientPage - 1) * patientPageSize;
    const end = start + patientPageSize;
    const pageData = sourceList.slice(start, end);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="5">No data available.</td></tr>';
        if (info) info.innerText = `Showing 0 to 0 of ${allPatients.length} entries`;
        return;
    }

    tableBody.innerHTML = pageData.map((p, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${p.fullName}</td>
            <td>${p.dob}</td>
            <td>${p.gender}</td>
            <td>${p.phone}</td>
            <td>${p.address}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editPatient(${p.patientId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient(${p.patientId})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
    info.innerText = `Showing ${start + 1} to ${Math.min(end, allPatients.length)} of ${allPatients.length} entries`;

}

function changePatientPage(direction) {
    const newPage = currentPatientPage + direction;
    const maxPage = Math.ceil(allPatients.length / patientPageSize);
    if (newPage >= 1 && newPage <= maxPage) {
        currentPatientPage = newPage;
        paginatePatients();
    }
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    }
}

//========================================================================================

document.getElementById('cancelPatientForm').addEventListener('click', () => {
    document.getElementById('patientFormCard').style.display = 'none';
    document.getElementById("patientManagerCard").style.display = 'block';
});

document.getElementById('btnAddPatient').addEventListener('click', () => {
    openPatientForm('add');
});

document.getElementById('cancelPatientForm2').addEventListener('click', () => {
    document.getElementById('patientFormCard').style.display = 'none';
    document.getElementById('patientManagerCard').style.display = 'block';
});

function editPatient(patientId) {
    const p = allPatients.find(p => p.patientId === patientId);
    if (p) {
        openPatientForm('edit', p);
    }
}

function openPatientForm(mode, patient = null) {
    const formCard = document.getElementById('patientFormCard');
    const selectionCard = document.getElementById('patientManagerCard');
    const form = document.getElementById('patientForm');

    formCard.style.display = 'block';
    selectionCard.style.display = 'none';
    form.reset();

    document.getElementById('add-new-tab').classList.add('active');
    document.getElementById('add-existing-tab').classList.remove('active');
    document.getElementById('add-new-pane').classList.add('show', 'active');
    document.getElementById('add-existing-pane').classList.remove('show', 'active');

    if (mode === 'edit' && patient) {
        document.getElementById('patientId').value = patient.patientId;
        document.getElementById('patientFullName').value = patient.fullName;
        document.getElementById('patientDob').value = patient.dob;
        document.getElementById('patientGender').value = patient.gender;
        document.getElementById('patientPhone').value = patient.phone;
        document.getElementById('patientAddress').value = patient.address;
        document.getElementById('patientAccountPatientId').value = patient.accountPatientId;
    } else {
        document.getElementById("patientFormTab").style.display = 'flex';
        document.getElementById('patientId').value = '';
        document.getElementById('patientAccountPatientId').value = currentAccountPatientId;
        document.getElementById('patientGender').value = '';

        loadUnlinkedPatients?.();
    }
}

document.getElementById('patientForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validatePatientForm();
    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('') + "</ul>";
        displayPatientFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const patientId = document.getElementById('patientId').value;
    const action = patientId ? 'update' : 'create';
    console.log('Action:', action);
    formData.append('action', action);

    try {
        const response = await fetch('/api/admin/patients', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('patientFormCard').style.display = 'none';
                document.getElementById('patientManagerCard').style.display = 'block';
                fetchPatientsOfAccount(currentAccountPatientId);
            } else {
                displayPatientFormMessage(result.message, "danger");
            }

        } else {
            const rawText = await response.text();
            throw new Error("Unexpected response: " + rawText);
        }

    } catch (error) {
        console.error('Submit error:', error);
        displayPatientFormMessage("Submit failed: " + error.message, "danger");
    }
});

function displayPatientFormMessage(message, type = 'info') {
    let msgDiv = document.getElementById('patientFormMessage');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'patientFormMessage';
        msgDiv.className = `mb-3 alert alert-${type}`;
        const form = document.getElementById('patientForm');
        form.prepend(msgDiv);
    }
    msgDiv.style.display = 'block';
    msgDiv.className = `mb-3 alert alert-${type}`;
    msgDiv.innerHTML = message;
}

function validatePatientForm() {
    const fullName = document.getElementById('patientFullName').value.trim();
    const dob = document.getElementById('patientDob').value;
    const gender = document.getElementById('patientGender').value;
    const phone = document.getElementById('patientPhone').value.trim();
    const address = document.getElementById('patientAddress').value.trim();

    const errors = [];

    if (!fullName) errors.push("Full Name is required.");

    if (!dob) {
        errors.push("Date of Birth is required.");
    } else {
        const selectedDate = new Date(dob);
        const now = new Date();

        if (isNaN(selectedDate.getTime())) {
            errors.push("Invalid Date of Birth.");
        } else if (selectedDate > now) {
            errors.push("Date of Birth cannot be in the future (including time).");
        }
    }

    // Gender
    if (!gender) errors.push("Gender is required.");

    // Phone
    if (!phone) {
        errors.push("Phone number is required.");
    } else if (!/^0\d{9}$/.test(phone)) {
        errors.push("Phone must be exactly 10 digits and start with 0.");
    }

    // Address
    if (!address) errors.push("Address is required.");

    return errors;
}

document.getElementById('btnBackToAccount').addEventListener('click', () => {
    window.location.href = '/view/listaccountpatient-adminsys.html'; // hoặc URL bạn muốn quay lại
});

//========================================================================================

document.getElementById('btnAttachExistingPatient').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('#existingPatientList input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 bệnh nhân để thêm.");
        return;
    }

    const selectedPatientIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    try {
        const response = await fetch('/api/admin/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                action: 'link-multiple',
                accountPatientId: currentAccountPatientId,
                patientIds: selectedPatientIds.join(',')
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message || "Add successfully!");
            document.getElementById('patientFormCard').style.display = 'none';
            document.getElementById('patientManagerCard').style.display = 'block';
            fetchPatientsOfAccount(currentAccountPatientId); // reload danh sách
        } else {
            alert("Lỗi: " + (result.message || "Add failed!"));
        }

    } catch (error) {
        console.error("Add failed:", error);
        alert("Add failed!");
    }
});

async function deletePatient(patientId) {
    if (!confirm("Are you sure you want to remove this patient from your account?")) return;

    try {
        const response = await fetch(`/api/admin/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                action: 'unlink',
                patientId: patientId,
                accountPatientId: currentAccountPatientId
            })
        });

        const result = await response.json();
        if (result.success) {
            alert("Removed link successfully!");
            fetchPatientsOfAccount(currentAccountPatientId); // reload danh sách
        } else {
            alert("Gỡ thất bại: " + result.message);
        }
    } catch (error) {
        console.error("Error removing patient:", error);
        alert("An error occurred while sending the request.");
    }
}

