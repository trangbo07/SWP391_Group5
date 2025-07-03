document.addEventListener("DOMContentLoaded", async () => {
    const loadingElement = document.getElementById("recordTableBody");

    try {
        // ✅ B1: Lấy patientId từ session thông qua API riêng
        const sessionRes = await fetch("/api/session/patient", {
            credentials: "include"
        });

        if (!sessionRes.ok) throw new Error("Không thể lấy patientId từ session");

        const sessionData = await sessionRes.json();
        const patientId = sessionData.patientId;

        console.log("Lấy được patientId từ session:", patientId);

        // ✅ B2: Gọi API summary với patientId lấy được
        const res = await fetch(`/api/records/summary?patientId=${patientId}`, {
            credentials: "include"
        });

        if (!res.ok) throw new Error("Server error");

        const records = await res.json();
        const tableBody = document.getElementById("recordTableBody");
        tableBody.innerHTML = "";

        if (records.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không có hồ sơ nào.</td></tr>`;
            return;
        }
        console.log("patientId đang dùng trong vòng lặp:", patientId);
        records.forEach((r, index) => {
            const imageUrl = r.avatarUrl || "../assets/assets/images/dashboard/default.png";
            const row = `
  <tr data-item="list">
    <th scope="row">${index + 1}</th>
    <td>
      <div class="d-flex align-items-center gap-3">
        <h5 class="mb-0">${r.doctorName}</h5>
      </div>
    </td>
    <td>${r.clinicName}</td>
    <td>${r.reason}</td>
    <td>${r.note || "-------"}</td>
    <td>
      <a href="diagnosis-patient.html?patientId=${patientId}" class="d-inline-block pe-2" title="Xem chuẩn đoán">
        <span class="text-info"><i class="bi bi-clipboard2-heart"></i></span>
      </a>
      <a href="prescription.html?patientId=${patientId}" class="d-inline-block pe-2" title="Xem đơn thuốc">
        <span class="text-success"><i class="bi bi-capsule"></i></span>
      </a>
      <a href="invoice.html?patientId=${patientId}" class="d-inline-block pe-2" title="Xem hóa đơn">
        <span class="text-warning"><i class="bi bi-receipt"></i></span>
      </a>
      <a href="examination-patient.html?patientId=${patientId}" class="d-inline-block pe-2" title="Xem kết quả khám">
        <span class="text-primary"><i class="bi bi-activity"></i></span>
      </a>
    </td>
  </tr>
`;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

    } catch (err) {
        console.error("Không thể tải hồ sơ bệnh án:", err);
        document.getElementById("recordTableBody").innerHTML =
            `<tr><td colspan="6" class="text-danger">Không thể tải dữ liệu.</td></tr>`;
    }
});