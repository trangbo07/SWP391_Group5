let allAnnouncements = [];
let currentPage = 1;
let pageSize = 5;
let isReversed = false;

document.addEventListener("DOMContentLoaded", () => {
    fetchAnnouncements();

    document.getElementById('btnAddAnnouncement').addEventListener('click', () => {
        openAnnouncementForm();
    });

    document.getElementById('btnReverseList').addEventListener('click', toggleReverseList);

    document.getElementById('selectPageSize').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        paginateAnnouncements();
    });

    document.getElementById('searchInput').addEventListener('input', debounce(fetchAnnouncements, 300));

    document.getElementById('btnPreviousPage').addEventListener('click', (e) => {
        e.preventDefault();
        changePage(-1);
    });

    document.getElementById('btnNextPage').addEventListener('click', (e) => {
        e.preventDefault();
        changePage(1);
    });

    document.getElementById('announcementForm').addEventListener('submit', submitAnnouncementForm);
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
    tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

    try {
        const res = await fetch(`/api/admin/announcements?${params.toString()}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No announcements found.</td></tr>`;
            document.getElementById('paginationInfo').textContent = `Showing 0 to 0 of 0 entries`;
            return;
        }

        allAnnouncements = data;
        currentPage = 1;
        paginateAnnouncements();
    } catch (error) {
        console.error('Fetch failed:', error);
        tableBody.innerHTML = `<tr><td colspan="7">Failed to load announcements.</td></tr>`;
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
        tableBody.innerHTML = `<tr><td colspan="7">No announcements.</td></tr>`;
        info.textContent = `Showing 0 to 0 of ${allAnnouncements.length} entries`;
        return;
    }

    tableBody.innerHTML = pageData.map((a, idx) => `
        <tr>
            <td>${start + idx + 1}</td>
            <td>${a.title}</td>
            <td>${a.content}</td>
            <td>${a.createdAt}</td>
            <td>${a.adminId}</td>
            <td>${a.fullName}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editAnnouncement(${a.announcement_id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${a.announcement_id})">Delete</button>
            </td>
        </tr>
    `).join('');

    info.textContent = `Showing ${start + 1} to ${Math.min(end, allAnnouncements.length)} of ${allAnnouncements.length} entries`;
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

function openAnnouncementForm(announcement = null) {
    const modal = new bootstrap.Modal(document.getElementById('announcementFormModal'));

    document.getElementById('announcementFormTitle').innerHTML = announcement
        ? '<i class="fas fa-edit me-2"></i>Edit Announcement'
        : '<i class="fas fa-plus me-2"></i>Add Announcement';

    document.getElementById('announcementForm').reset();
    document.getElementById('announcementId').value = announcement?.announcement_id || '';
    document.getElementById('title').value = announcement?.title || '';
    document.getElementById('content').value = announcement?.content || '';
    document.getElementById('fullName').value = announcement?.full_name || currentAdminFullName || '';
    document.getElementById('department').value = announcement?.department || currentAdminDepartment || '';

    modal.show();
}

function editAnnouncement(id) {
    const announcement = allAnnouncements.find(a => a.announcement_id === id);
    if (announcement) openAnnouncementForm(announcement);
}

async function deleteAnnouncement(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
        const res = await fetch('/api/admin/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=delete&announcement_id=${id}`
        });

        const result = await res.json();
        if (result.success) {
            alert("Deleted successfully!");
            fetchAnnouncements();
        } else {
            alert("Failed to delete: " + result.message);
        }
    } catch (err) {
        console.error(err);
        alert("Delete error!");
    }
}

async function submitAnnouncementForm(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const action = formData.get("announcement_id") ? "update" : "create";
    formData.append("action", action);

    try {
        const res = await fetch("/api/admin/announcements", {
            method: "POST",
            body: formData
        });

        const result = await res.json();
        if (result.success) {
            alert(result.message);
            bootstrap.Modal.getInstance(document.getElementById('announcementFormModal')).hide();
            fetchAnnouncements();
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Submit failed:", err);
        alert("Submit error!");
    }
}
