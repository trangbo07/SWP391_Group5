let allDiagnosisData = []; // Lưu toàn bộ dữ liệu ban đầu

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let patientId = urlParams.get("patientId");

    if (!patientId) {
        try {
            const sessionRes = await fetch("/api/session/patient", {
                credentials: "include"
            });
            if (!sessionRes.ok) throw new Error("Không thể lấy patientId từ session");

            const sessionData = await sessionRes.json();
            patientId = sessionData.patientId;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    try {
        const spinner = document.getElementById("loadingSpinner");
        const tableContainer = document.getElementById("tableContainer");

        spinner.style.display = "block"; // Hiện spinner

        const res = await fetch(`/DiagnosisServlet?patientId=${patientId}`);
        if (!res.ok) throw new Error("Không thể lấy dữ liệu chẩn đoán");

        const data = await res.json();
        console.log("Diagnosis list:", data);
        allDiagnosisData = data;

        if (data.length > 0) {
            tableContainer.style.display = "block"; // Hiện bảng
        } else {
            tableContainer.style.display = "none"; // Ẩn nếu không có dữ liệu
        }

        renderDiagnosisTable(data);
    } catch (err) {
        console.error("Lỗi khi lấy chẩn đoán:", err);
    } finally {
        document.getElementById("loadingSpinner").style.display = "none"; // Ẩn spinner
    }
});

// 🔍 Lọc theo tên bác sĩ
document.getElementById("searchName").addEventListener("input", () => {
    const keyword = document.getElementById("searchName").value.trim().toLowerCase();
    const filtered = allDiagnosisData.filter(record =>
        record.fullName?.toLowerCase().includes(keyword)
    );
    renderDiagnosisTable(filtered);
});

document.getElementById("searchGender").addEventListener("change", () => {
    applyFilters();
});

// ❌ Xóa lọc
document.getElementById("resetButton").addEventListener("click", () => {
    document.getElementById("searchName").value = "";
    document.getElementById("searchGender").value = "";
    renderDiagnosisTable(allDiagnosisData); // Hiển thị lại toàn bộ
});


// Hiển thị bảng
function renderDiagnosisTable(data) {
    const tbody = document.getElementById("diagnosisTableBody");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6'>Không có dữ liệu.</td></tr>";
        document.getElementById("tableContainer").style.display = "none"; // Ẩn bảng nếu không có dữ liệu
        return;
    }

    document.getElementById("tableContainer").style.display = "block"; // Hiện bảng nếu có dữ liệu
    document.getElementById("totalDiagnosis").textContent = data.length;
    data.forEach((record, index) => {
        const row = document.createElement("tr");
        row.className = "diagnosis-row";
        row.innerHTML = `
            <td><i class="fas fa-user me-2"></i>${record.fullName || 'N/A'}</td>
            <td><i class="fas fa-calendar me-2"></i>${record.dob ? new Date(record.dob).toLocaleDateString('en-GB') : 'N/A'}</td>
            <td><i class="fas fa-venus-mars me-2"></i>${record.gender || 'N/A'}</td>
            <td><i class="fas fa-disease me-2"></i>${record.disease || 'N/A'}</td>
            <td><i class="fas fa-stethoscope me-2"></i>${record.conclusion || 'N/A'}</td>
            <td><i class="fas fa-pills me-2"></i>${record.treatmentPlan || 'N/A'}</td>
        `;

        row.addEventListener("click", () => {
            document.querySelectorAll('.diagnosis-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            renderDiagnosisDetail(record);
        });

        tbody.appendChild(row);

        if (index === 0) {
            row.classList.add('active');
            renderDiagnosisDetail(record);
        }
    });
}

function applyFilters() {
    const nameKeyword = document.getElementById("searchName").value.trim().toLowerCase();
    const selectedGender = document.getElementById("searchGender").value;

    let filtered = allDiagnosisData;

    // Lọc theo tên nếu có từ khóa
    if (nameKeyword !== "") {
        filtered = filtered.filter(record =>
            record.fullName?.toLowerCase().includes(nameKeyword)
        );
    }

    // Lọc theo giới tính nếu có chọn
    if (selectedGender !== "") {
        filtered = filtered.filter(record => record.gender === selectedGender);
    }

    renderDiagnosisTable(filtered);
}
// Hiển thị chi tiết chẩn đoán
function renderDiagnosisDetail(record) {
    document.getElementById("detailPatientName").textContent = record.fullName || "---";
    document.getElementById("detailDOB").textContent = record.dob ? new Date(record.dob).toLocaleDateString('en-GB') : "---";
    document.getElementById("detailGender").textContent = record.gender || "---";
    document.getElementById("detailDisease").textContent = record.disease || "---";
    document.getElementById("detailConclusion").textContent = record.conclusion || "---";
    document.getElementById("detailTreatmentPlan").textContent = record.treatmentPlan || "---";
}
