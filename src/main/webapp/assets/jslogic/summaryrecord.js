document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("recordTableBody");
    const nameInput = document.getElementById("searchName");
    const genderSelect = document.getElementById("searchGender");
    const resetButton = document.getElementById("resetButton");

    let allRecords = [];

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
        renderTable(allRecords);

        nameInput.addEventListener("input", () => filterAndRender());
        genderSelect.addEventListener("change", () => filterAndRender());

        resetButton.addEventListener("click", () => {
            nameInput.value = "";
            genderSelect.value = "";
            renderTable(allRecords);
        });

    } catch (err) {
        console.error("Không thể tải hồ sơ bệnh án:", err);
        tableBody.innerHTML =
            `<tr><td colspan="6" class="text-danger">Không thể tải dữ liệu.</td></tr>`;
    }

    function renderTable(records) {
        tableBody.innerHTML = "";
        if (records.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không có hồ sơ nào.</td></tr>`;
            return;
        }

        records.forEach((r, index) => {
            const patientData = JSON.stringify(r).replace(/"/g, '&quot;');
            const row = `
  <tr data-item="list">
    <th scope="row">${index + 1}</th>
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
    }

    function filterAndRender() {
        const nameFilter = nameInput.value.trim().toLowerCase();
        const genderFilter = genderSelect.value;

        const filtered = allRecords.filter(record => {
            const matchesName = record.fullName.toLowerCase().includes(nameFilter);
            const matchesGender = genderFilter ? record.gender === genderFilter : true;
            return matchesName && matchesGender;
        });

        renderTable(filtered);
    }
});

// Gửi dữ liệu sang medicineRecord.html
function goToMedicineRecord(patientJson) {
    const patient = JSON.parse(patientJson);
    sessionStorage.setItem("patientInfo", JSON.stringify(patient));
    window.location.href = `medicineRecord.html?patientId=${patient.patientId}`;
}
