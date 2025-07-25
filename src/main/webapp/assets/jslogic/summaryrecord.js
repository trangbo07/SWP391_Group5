document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("recordTableBody");
    const nameInput = document.getElementById("searchName");
    const genderSelect = document.getElementById("searchGender");
    const resetButton = document.getElementById("resetButton");

    let allRecords = [];
    let filteredRecords = [];
    let currentPage = 1;
    let pageSize = 10;

    const pageSizeSelect = document.getElementById("pageSizeSelect");
    const paginationNav = document.getElementById("paginationNav");

    function renderTable() {
        tableBody.innerHTML = "";
        if (filteredRecords.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không có hồ sơ nào.</td></tr>`;
            renderPagination(0, 1, 1);
            return;
        }
        // Phân trang
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pageData = filteredRecords.slice(start, end);
        pageData.forEach((r, index) => {
            const patientData = JSON.stringify(r).replace(/"/g, '&quot;');
            const row = `
  <tr data-item="list">
    <th scope="row">${start + index + 1}</th>
    <td>
      <div class="d-flex align-items-center gap-3">
        <h5 class="mb-0">${r.fullName}</h5>
      </div>
    </td>
    <td>${r.dob}</td>
    <td>${r.gender}</td>
    <td>${r.address}</td>
    <td>
      <a href="#" onclick="goToMedicineRecord('${patientData}')" 
         class="d-inline-block pe-2 text-info" 
         title="Xem Chi tiết">
         <i class="bi bi-capsule-pill"></i>
      </a>
    </td>
  </tr>`;
            tableBody.innerHTML += row;
        });
        renderPagination(filteredRecords.length, currentPage, pageSize);
    }

    function renderPagination(totalItems, currentPage, pageSize) {
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        let html = '';
        html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}"><a class="page-link" href="#" data-page="prev">Trang trước</a></li>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item${i === currentPage ? ' active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}"><a class="page-link" href="#" data-page="next">Trang sau</a></li>`;
        paginationNav.innerHTML = html;
    }

    function filterAndRender() {
        const nameFilter = nameInput.value.trim().toLowerCase();
        const genderFilter = genderSelect.value;
        filteredRecords = allRecords.filter(record => {
            const matchesName = (record.fullName || '').toLowerCase().includes(nameFilter);
            const matchesGender = genderFilter ? record.gender === genderFilter : true;
            return matchesName && matchesGender;
        });
        currentPage = 1;
        renderTable();
    }

    paginationNav.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            let page = e.target.getAttribute('data-page');
            const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
            if (page === 'prev') {
                if (currentPage > 1) currentPage--;
            } else if (page === 'next') {
                if (currentPage < totalPages) currentPage++;
            } else {
                page = parseInt(page);
                if (!isNaN(page)) currentPage = page;
            }
            renderTable();
        }
    });

    pageSizeSelect.addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderTable();
    });

    try {
        const sessionRes = await fetch("/api/session/patient", {
            credentials: "include"
        });

        if (!sessionRes.ok) throw new Error("Không thể lấy patientId từ session");

        const sessionData = await sessionRes.json();
        const patientId = sessionData.patientId;

        const res = await fetch(`/api/records/summary?patientId=${patientId}`, {
            credentials: "include"
        });

        if (!res.ok) throw new Error("Lỗi server khi tải hồ sơ");

        allRecords = await res.json();
        filteredRecords = allRecords;
        renderTable();

        nameInput.addEventListener("input", filterAndRender);
        genderSelect.addEventListener("change", filterAndRender);
        resetButton.addEventListener("click", () => {
            nameInput.value = "";
            genderSelect.value = "";
            filterAndRender();
        });

    } catch (err) {
        console.error("Không thể tải hồ sơ bệnh án:", err);
        tableBody.innerHTML =
            `<tr><td colspan="6" class="text-danger">Không thể tải dữ liệu.</td></tr>`;
        renderPagination(0, 1, 1);
    }
});

// Gửi dữ liệu sang medicineRecord.html
function goToMedicineRecord(patientJson) {
    const patient = JSON.parse(patientJson);
    sessionStorage.setItem("patientInfo", JSON.stringify(patient));
    window.location.href = `medicineRecord.html?patientId=${patient.patientId}`;
}
