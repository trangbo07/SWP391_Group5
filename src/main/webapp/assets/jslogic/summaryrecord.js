document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("recordTableBody");
    const nameInput = document.getElementById("searchName");
    const genderSelect = document.getElementById("searchGender");
    const resetButton = document.getElementById("resetButton");

    let allRecords = []; // Dữ liệu gốc để lọc

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

        if (!res.ok) throw new Error("Server error");

        allRecords = await res.json(); // lưu vào mảng gốc

        renderTable(allRecords);

        // 👇 Tự động lọc khi gõ tên
        nameInput.addEventListener("input", () => {
            filterAndRender();
        });

        // 👇 Tự động lọc khi đổi giới tính
        genderSelect.addEventListener("change", () => {
            filterAndRender();
        });

        // 👇 Xóa lọc
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
      <a href="diagnosis-patient.html?patientId=${r.patientId}" class="d-inline-block pe-2" title="Xem chuẩn đoán">
        <span class="text-info"><i class="bi bi-clipboard2-heart"></i></span>
      </a>
      <a href="prescription.html?patientId=${r.patientId}" class="d-inline-block pe-2" title="Xem đơn thuốc">
        <span class="text-success"><i class="bi bi-capsule"></i></span>
      </a>
      <a href="invoice.html?patientId=${r.patientId}" class="d-inline-block pe-2" title="Xem hóa đơn">
        <span class="text-warning"><i class="bi bi-receipt"></i></span>
      </a>
      <a href="examination-patient.html?patientId=${r.patientId}" class="d-inline-block pe-2" title="Xem kết quả khám">
        <span class="text-primary"><i class="bi bi-activity"></i></span>
      </a>
    </td>
  </tr>
`;
            tableBody.insertAdjacentHTML("beforeend", row);
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
