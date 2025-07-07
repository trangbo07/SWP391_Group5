let existingPatients = [];
let currentExistingPage = 1;
let existingPageSize = 5;
let existingSearchKeyword = "";

// SEARCH INPUT
document.getElementById('searchExistingPatient').addEventListener('input', debounce(() => {
    existingSearchKeyword = document.getElementById('searchExistingPatient').value.trim().toLowerCase();
    currentExistingPage = 1;
    renderExistingPatients();
}, 400));

// PREVIOUS PAGE
document.getElementById('btnPreviousExisting').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentExistingPage > 1) {
        currentExistingPage--;
        renderExistingPatients();
    }
});

// NEXT PAGE
document.getElementById('btnNextPageExisting').addEventListener('click', (e) => {
    e.preventDefault();
    const totalPages = Math.ceil(filteredExistingPatients().length / existingPageSize);
    if (currentExistingPage < totalPages) {
        currentExistingPage++;
        renderExistingPatients();
    }
});

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function loadUnlinkedPatients() {
    try {
        const response = await fetch(`/api/admin/patients?action=unlinked&accountPatientId=${currentAccountPatientId}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Invalid response, expected array but got:", data);
            existingPatients = [];
        } else {
            existingPatients = data;
        }

        currentExistingPage = 1;
        existingSearchKeyword = "";
        renderExistingPatients();
    } catch (error) {
        console.error("Failed to load:", error);
        existingPatients = [];
        renderExistingPatients();
    }
}

function filteredExistingPatients() {
    if (!Array.isArray(existingPatients)) return [];
    if (!existingSearchKeyword) return existingPatients;

    return existingPatients.filter(p =>
        p.fullName?.toLowerCase().includes(existingSearchKeyword)
    );
}

function renderExistingPatients() {
    const listDiv = document.getElementById('existingPatientList');
    const filtered = filteredExistingPatients();

    const total = filtered.length;
    const start = (currentExistingPage - 1) * existingPageSize;
    const end = Math.min(start + existingPageSize, total);
    const paginated = filtered.slice(start, end);

    listDiv.innerHTML = "";

    if (paginated.length === 0) {
        listDiv.innerHTML = "<div class='text-muted'>No matching patients.</div>";
        return;
    }

    // Tạo bảng
    let table = document.createElement('table');
    table.className = "table table-bordered table-hover table-sm";

    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Full Name</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Address</th>
            </tr>
        </thead>
        <tbody>
            ${paginated.map(p => `
                <tr>
                    <td>
                        <input class="form-check-input" type="checkbox" value="${p.patientId}" id="check-${p.patientId}">
                    </td>
                    <td>${p.patientId}</td>
                    <td>${p.fullName}</td>
                    <td>${p.dob}</td>
                    <td>${p.gender}</td>
                    <td>${p.address}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    listDiv.appendChild(table);

    document.getElementById('existingPatientInfo').textContent =
        `Showing ${total === 0 ? 0 : start + 1} to ${end} of ${total}`;
}

