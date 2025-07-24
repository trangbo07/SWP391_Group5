let allAppointments = [];
let currentPage = 1;
const pageSize = 7;

// Hàm dùng chung để fetch theo action
async function fetchAppointmentsByAction(action) {
    const tableBody = document.getElementById("appointmentTableBody");
    const info = document.getElementById("paginationInfo");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7">Đang tải...</td></tr>';

    try {
        const res = await fetch('/api/doctor/appointment', {
            method: 'POST', credentials: 'include', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify({action: action})
        });

        const appointments = await res.json();

        if (!Array.isArray(appointments) || appointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">Không có lịch hẹn nào.</td></tr>';
            if (info) info.innerText = `Hiển thị 0 đến 0 trên 0 mục`;
            return;
        }

        allAppointments = Array.isArray(appointments) ? appointments : [];
        currentPage = 1;
        paginateAppointments();


    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="7">Lỗi khi tải dữ liệu</td></tr>';
    }
}

function paginateAppointments() {
    const tableBody = document.getElementById("appointmentTableBody");
    const info = document.getElementById("paginationInfo");
    if (!tableBody) return;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = allAppointments.slice(start, end);

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">Không có lịch hẹn nào.</td></tr>';
        if (info) info.innerText = `Hiển thị 0 đến 0 trên ${allAppointments.length} mục`;
        return;
    }

    pageData.forEach((a, index) => {
        // Đảm bảo nút luôn là tiếng Việt, không lấy text từ backend
        const viewBtn = `<button class="btn btn-primary text-white select-patient-btn" data-appointment-id="${a.appointment_id}" data-action="view">
                                    <i class="fas fa-eye me-1"></i>Xem
                                </button>`;
        const cancelBtn = `<button class="btn btn-secondary text-white select-patient-btn" data-appointment-id="${a.appointment_id}" data-action="cancel">
                                    <i class="fas fa-times-circle me-1"></i>Huỷ
                                </button>`;

        let actionButtons = viewBtn;

        // Chỉ hiển thị "Hoàn tất" và "Huỷ" nếu trạng thái không phải Cancelled hoặc Completed
        if (a.status !== "Cancelled" && a.status !== "Completed") {
            actionButtons = `<div class="d-flex gap-2">
                                ${viewBtn}
                                ${cancelBtn}
                            </div>`;
        }


        const row = `
        <tr>
            <td>${start + index + 1}</td>
            <td>${a.full_name}</td>
            <td>${a.appointment_datetime}</td>
            <td>${a.shift}</td>
            <td>${a.status}</td>
            <td>${a.note || ''}</td>
            <td>${actionButtons}</td>
        </tr>
    `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    if (info) {
        const formattedStart = String(start + 1).padStart(2, '0');
        const formattedEnd = String(Math.min(end, allAppointments.length)).padStart(2, '0');
        info.innerText = `Hiển thị ${formattedStart} đến ${formattedEnd} trên ${allAppointments.length} mục`;
    }
}

async function countAppointmentsToday(action) {
    try {
        const response = await fetch('/api/doctor/appointment', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: action})
        });

        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }

        const appointments = await response.json();
        return appointments;
    } catch (error) {
        console.error('Error counting appointments:', error);
        return 0;
    }
}

async function handleView(id) {
    console.log("View appointment", id);
    const canvas = new bootstrap.Offcanvas('#offcanvasAppointmentEdit');
    canvas.show();

    try {
        const res = await fetch(`/api/doctor/appointment?action=detail&id=${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });


        if (!res.ok) {
            throw new Error("Failed to fetch appointment");
        }

        const data = await res.json();

        document.getElementById("patient_id").value = data.patient_id;
        document.getElementById("full_name").value = data.full_name;
        document.getElementById("dob").value = data.dob;
        document.getElementById("gender").value = data.gender;
        document.getElementById("phone").value = data.phone;
        document.getElementById("appointment_datetime").value = data.appointment_datetime;
        document.getElementById("shift").value = data.shift;
        document.getElementById("status").value = data.status;
        document.getElementById("note").value = data.note || '';

        const cancelBtn = document.getElementById("cancelAppointmentBtn");

        document.querySelectorAll(".cancelAppointmentBtn").forEach(btn => {
            if (data.status === 'Confirmed') {
                btn.style.display = 'inline-block';
                btn.onclick = () => handleCancel(id);
            } else {
                btn.style.display = 'none';
                btn.onclick = null;
            }
        });

    } catch (error) {
        console.error("Error fetching appointment:", error);
    }
}

async function handleCancel(id) {
    if (!confirm("Bạn có chắc chắn muốn huỷ lịch hẹn này?")) return;

    try {
        const res = await fetch(`/api/doctor/appointment?action=cancel&id=${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error("Cancel failed");

        alert("Huỷ lịch hẹn thành công.");

        const canvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasAppointmentEdit'));
        if (canvas) canvas.hide();


        await fetchAppointmentsByAction('Upcoming');

    } catch (err) {
        console.error("Cancel failed:", err);
        alert("Huỷ lịch hẹn thất bại.");
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    fetchAppointmentsByAction('Upcoming');

    const NOA = document.getElementById("countappointmenttoday");
    if (NOA) {
        try {
            const noa = await countAppointmentsToday("Count");
            NOA.innerText = `${noa} lịch hẹn hôm nay`;
        } catch (err) {
            NOA.innerText = `Lỗi khi tải số lượng lịch hẹn`;
        }
    }

    document.getElementById("appointmentTableBody").addEventListener("click", function (e) {
        const target = e.target.closest("button");

        if (!target) return;

        const action = target.getAttribute("data-action");
        const appointmentId = target.getAttribute("data-appointment-id");

        switch (action) {
            case "view":
                handleView(appointmentId);
                break;
            case "cancel":
                handleCancel(appointmentId);
                break;
        }
    });

    document.getElementById("appointmentUpcoming")?.addEventListener("click", (e) => {
        e.preventDefault();
        fetchAppointmentsByAction('Upcoming');
    });

    document.getElementById("appointmentComplete")?.addEventListener("click", (e) => {
        e.preventDefault();
        fetchAppointmentsByAction('Completed');
    });

    document.getElementById("appointmentClosed")?.addEventListener("click", (e) => {
        e.preventDefault();
        fetchAppointmentsByAction('Cancelled');
    });

    document.getElementById("countappointmenttoday")?.addEventListener("click", async (e) => {
        e.preventDefault();
        const NOA = document.getElementById("countappointmenttoday");
        const noa = await countAppointmentsToday("Count");
        NOA.innerText = `${noa} lịch hẹn hôm nay`;
    });

    document.querySelector(".card-navigation a:nth-child(1)")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            paginateAppointments();
        }
    });

    document.querySelector(".card-navigation a:nth-child(2)")?.addEventListener("click", (e) => {
        e.preventDefault();
        const totalPages = Math.ceil(allAppointments.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            paginateAppointments();
        }
    });
});


function toggleSchedule() {
    const container = document.getElementById("scheduleContainer");
    container.classList.toggle("d-none");
}


document.getElementById("searchAppointmentBtn").addEventListener("click", async () => {
    const keyword = document.getElementById("searchKeyword").value.trim();
    const activeTabBtn = document.querySelector("#appointment-table-tab .nav-link.active");
    const status = activeTabBtn ? activeTabBtn.getAttribute("data-action") : "";

    // Nếu không nhập từ khoá thì gọi lại lịch hẹn theo tab đang chọn
    if (keyword === "") {
        fetchAppointmentsByAction(status || 'Upcoming');
        return;
    }

    const mappedStatus = (status === "Upcoming") ? "Pending" : status;

    try {
        const res = await fetch('/api/doctor/appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                action: "Search",      // thêm dòng này để xác định action
                keyword: keyword,
                status: mappedStatus
            })
        });

        if (!res.ok) throw new Error("Server error");

        const result = await res.json();

        // Gọi lại paginateAppointments với dữ liệu mới
        allAppointments = Array.isArray(result) ? result : [];
        currentPage = 1;
        paginateAppointments();
    } catch (err) {
        console.error("Search failed:", err);
        document.getElementById("appointmentTableBody").innerHTML = `<tr><td colspan="7">Tìm kiếm thất bại</td></tr>`;
    }
});


