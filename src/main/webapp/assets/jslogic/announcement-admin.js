let allAnnouncements = [];
let currentPage = 1;
let pageSize = 5;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    fetchAnnouncements();

    document.getElementById('btnReverseList').addEventListener('click', toggleReverseList);

    document.getElementById('selectPageSize').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        paginateAnnouncements();
    });

    document.getElementById('filterStatus').addEventListener('change', fetchAnnouncements)

    document.getElementById('searchInput').addEventListener('input', debounce(fetchAnnouncements, 300));

    document.getElementById('btnPreviousPage').addEventListener('click', (e) => {
        e.preventDefault();
        changePage(-1);
    });

    document.getElementById('btnNextPage').addEventListener('click', (e) => {
        e.preventDefault();
        changePage(1);
    });
});

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

async function fetchAnnouncements() {
    const search = document.getElementById('searchInput').value.trim();
    const filterStatus = document.getElementById('filterStatus').value;

    const params = new URLSearchParams();
    params.append("action", "filter");

    if (search) {
        params.append("search", search);
    }

    if (filterStatus) {
        params.append("status", filterStatus);
    }

    const tableBody = document.getElementById('announcementTableBody');
    tableBody.innerHTML = `<tr><td colspan="7">Đang tải...</td></tr>`;

    try {
        const res = await fetch(`/api/admin/announcements?${params.toString()}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No announcements found.</td></tr>`;
            document.getElementById('paginationInfo').textContent = `Hiển thị 0 đến 0 trong tổng số 0 bản ghi`;
            return;
        }

        allAnnouncements = data;
        currentPage = 1;
        paginateAnnouncements();
    } catch (error) {
        console.error('Lỗi khi tìm kiếm: ', error);
        tableBody.innerHTML = `<tr><td colspan="7">Không tải được dữ liệu thông báo.</td></tr>`;
    }
}

function paginateAnnouncements() {
    const tableBody = document.getElementById('announcementTableBody');
    const info = document.getElementById('paginationInfo');

    const source = isReversed ? [...allAnnouncements].reverse() : allAnnouncements;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = source.slice(start, end);

    if (pageData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">Không có thông báo nào.</td></tr>`;
        info.textContent = `Hiển thị 0 đến 0 trong tổng số ${allAnnouncements.length} bản ghi`;
        return;
    }

    tableBody.innerHTML = pageData.map((a, idx) => `
        <tr>
            <td>${start + idx + 1}</td>
            <td style="white-space: normal; word-wrap: break-word;">${a.title}</td>
            <td style="white-space: normal; word-wrap: break-word;">${a.content}</td>
            <td>${a.createdAt}</td>
            <td>${a.adminId}</td>
            <td>${a.fullName}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editAnnouncement(${a.announcementId})">Chỉnh sửa</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${a.announcementId})">Xóa</button>
            </td>
        </tr>
    `).join('');

    info.textContent = `Hiển thị ${start + 1} đến ${Math.min(end, allAnnouncements.length)} trong tổng số ${allAnnouncements.length} bản ghi`;
}

function toggleReverseList() {
    isReversed = !isReversed;
    const btn = document.getElementById('btnReverseList');
    const icon = btn.querySelector('i');

    btn.classList.toggle('btn-secondary', isReversed);
    btn.classList.toggle('btn-outline-secondary', !isReversed);

    icon.classList.toggle('fa-sort-amount-up-alt', isReversed);
    icon.classList.toggle('fa-sort-amount-down-alt', !isReversed);

    currentPage = 1;
    paginateAnnouncements();
}

function changePage(dir) {
    const maxPage = Math.ceil(allAnnouncements.length / pageSize);
    const newPage = currentPage + dir;
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        paginateAnnouncements();
    }
}

//=================================================================================

function openAnnouncementForm(mode, announcement = null) {
    const modalTitle = document.getElementById('announcementFormTitle');
    const announcementId = document.getElementById('announcementId');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const editOnlyFields = document.getElementById('editOnlyFields');
    const formMessage = document.getElementById('formMessage');

    formMessage.style.display = 'none'; // ẩn message

    if (mode === 'create') {
        modalTitle.innerHTML = `<i class="fas fa-plus me-2"></i> Thêm thông báo`;
        announcementId.value = '';
        titleInput.value = '';
        contentInput.value = '';
        editOnlyFields.innerHTML = '';
    } else if (mode === 'edit' && announcement) {
        modalTitle.innerHTML = `<i class="fas fa-edit me-2"></i> Chỉnh sửa thông báo`;
        announcementId.value = announcement.announcementId;
        titleInput.value = announcement.title;
        contentInput.value = announcement.content;

        editOnlyFields.innerHTML = `
           <div class="row">
        <div class="col-md-6">
          <label class="form-label">Tạo bởi</label>
          <input type="text" class="form-control" readonly value="${announcement.fullName || ''}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Ngày tạo</label>
          <input type="text" class="form-control" readonly value="${announcement.createdAt || ''}">
        </div>
      </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('announcementFormModal'));
    modal.show();
}

document.getElementById('btnAddAnnouncement').addEventListener('click', () => {
    openAnnouncementForm('create');
});

function editAnnouncement(id) {
    const announcement = allAnnouncements.find(a => a.announcementId === id);
    if (!announcement) {
        alert('Không tìm thấy thông báo!');
        return;
    }
    openAnnouncementForm('edit', announcement);
}

//=================================================================================

document.getElementById('announcementForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const validationErrors = validateAnnouncementForm();
    if (validationErrors.length > 0) {
        const html = "<ul class='mb-0'>" + validationErrors.map(err => `<li>${err}</li>`).join('');
        displayAnnouncementFormMessage(html, "danger");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const announcementId = document.getElementById('announcementId').value;
    const action = announcementId ? 'update' : 'create';
    formData.append('action', action);

    try {
        const response = await fetch('/api/admin/announcements', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert(result.message);

                // Close modal and reset form
                bootstrap.Modal.getInstance(document.getElementById('announcementFormModal')).hide();
                form.reset();
                document.getElementById('editOnlyFields').innerHTML = '';

                // Refresh announcements list
                fetchAnnouncements();
            } else {
                displayAnnouncementFormMessage(result.message, "danger");
            }

        } else {
            const rawText = await response.text();
            throw new Error("Phản hồi bất ngờ: " + rawText);
        }

    } catch (error) {
        console.error('Gửi lỗi: ', error);
        displayAnnouncementFormMessage("Gửi không thành công: " + error.message, "danger");
    }
});

function displayAnnouncementFormMessage(message, type = 'info') {
    const msgDiv = document.getElementById('formMessage');
    msgDiv.style.display = 'block';
    msgDiv.className = `mb-3 alert alert-${type}`;
    msgDiv.innerHTML = message;
}

function validateAnnouncementForm() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();

    const errors = [];

    if (!title) {
        errors.push("Tiêu đề không được để trống.");
    } else if (title.length < 5) {
        errors.push("Tiêu đề phải có ít nhất 5 ký tự.");
    }

    if (!content) {
        errors.push("Nội dung không được để trống.");
    } else if (content.length < 10) {
        errors.push("Nội dung phải có ít nhất 10 ký tự.");
    }

    return errors;
}

async function deleteAnnouncement(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này không?")) return;

    try {
        const res = await fetch('/api/admin/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=delete&announcement_id=${encodeURIComponent(id)}`
        });

        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const result = await res.json();

            if (result.success) {
                alert("Thông báo đã được xóa thành công!");
                fetchAnnouncements(); // Load lại danh sách
            } else {
                alert("Không xóa được: " + result.message);
            }
        } else {
            const rawText = await res.text();
            throw new Error("Phản hồi bất ngờ: " + rawText);
        }

    } catch (err) {
        console.error("Xóa lỗi: ", err);
        alert("Xóa không thành công: " + err.message);
    }
}







