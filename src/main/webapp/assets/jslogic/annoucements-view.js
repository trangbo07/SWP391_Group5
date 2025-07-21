let allAnnouncements = [];
let currentPageAnnouncement = 1;
const pageSizeAnnouncement = 7;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link.btn-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.nav-link.btn-tab').forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');
            currentPageAnnouncement = 1;
            fetchAnnouncements();
        });
    });

    document.getElementById('searchInput').addEventListener('input', debounce(fetchAnnouncements, 300));

    // Gắn sự kiện phân trang
    document.getElementById('btnPreviousPage').addEventListener('click', e => {
        e.preventDefault();
        if (currentPageAnnouncement > 1) {
            currentPageAnnouncement--;
            renderAnnouncements();
        }
    });

    document.getElementById('btnNextPage').addEventListener('click', e => {
        e.preventDefault();
        const maxPage = Math.ceil(allAnnouncements.length / pageSizeAnnouncement);
        if (currentPageAnnouncement < maxPage) {
            currentPageAnnouncement++;
            renderAnnouncements();
        }
    });

    fetchAnnouncements();
    setupWebSocketList();
});

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

async function fetchAnnouncements() {
    const activeTab = document.querySelector('.nav-link.btn-tab.active');
    let status = '';
    if (activeTab) {
        if (activeTab.id === 'annReadTab') status = 'Read';
        else if (activeTab.id === 'annUnreadTab') status = 'Unread';
        else status = 'All';
    }

    const search = document.getElementById('searchInput').value.trim();

    // Build query params
    const params = new URLSearchParams();
    params.append('action', 'filter');
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);

    try {
        const res = await fetch('/api/announcements?' + params.toString(), {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) throw new Error('Không thể tải thông báo');

        const data = await res.json();

        allAnnouncements = Array.isArray(data) ? data : [];
        currentPageAnnouncement = 1;

        renderAnnouncements();

        updateCountAnnouncement(allAnnouncements);
    } catch (err) {
        console.error(err);
        document.getElementById('announcementList').innerHTML = `<li class="list-group-item text-danger">Lỗi tải thông báo</li>`;
    }
}

function renderAnnouncements() {
    const listEl = document.getElementById('announcementList');
    const infoEl = document.getElementById('paginationInfo');

    if (!listEl || !infoEl) return;

    const start = (currentPageAnnouncement - 1) * pageSizeAnnouncement;
    const end = start + pageSizeAnnouncement;
    const pageItems = allAnnouncements.slice(start, end);

    if (pageItems.length === 0) {
        listEl.innerHTML = `<li class="list-group-item text-center">Không tìm thấy thông báo nào.</li>`;
        infoEl.textContent = `Hiển thị 0 đến 0 trong tổng số ${allAnnouncements.length} bản ghi`;
        return;
    }

    listEl.innerHTML = pageItems.map((a, idx) => `
    <li class="list-group-item d-flex flex-column gap-1 p-3 border-bottom hover-light announcement-item ${a.isRead ? 'read' : 'unread'}" 
    data-id="${a.announcementId}" 
    data-title="${a.title}" 
    data-content="${a.content}" 
    data-created="${a.createdAt}" 
    data-author="${a.createdBy ?? a.fullName ?? ''}" 
    title="${a.title}">
        
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-1 text-truncate ${a.isRead ? '' : 'fw-bold'}" style="max-width: 240px;" title="${a.title}">
                ${a.title}
            </h6>
            <small class="text-muted fst-italic">${new Date(a.createdAt).toLocaleDateString()}</small>
        </div>
    
        <small class="text-truncate ${a.isRead ? 'text-secondary' : ''}" style="max-width: 240px;" title="${a.content}">
            ${a.content}
        </small>
    </li>
    `).join('');

    infoEl.textContent = `Hiển thị ${start + 1} đến ${Math.min(end, allAnnouncements.length)} trong tổng số ${allAnnouncements.length} bản ghi`;

    listEl.onclick = async (e) => {
        const item = e.target.closest('.announcement-item');
        if (!item) return;

        // Hiển thị modal chi tiết
        showAnnouncementModal(
            item.dataset.title,
            item.dataset.content,
            item.dataset.created,
            item.dataset.author
        );

        // Nếu đã đọc rồi thì thôi
        const id = item.dataset.id;
        if (!id || item.classList.contains('read')) return;

        try {
            // Gọi API markRead
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=markRead&id=${encodeURIComponent(id)}`
            });

            if (!res.ok) {
                console.error('Đánh dấu đọc không thành công: ', await res.text());
                return;
            }

            item.classList.remove('unread');
            item.classList.add('read');
            item.querySelector('h6')
                ?.classList.remove('fw-bold', 'text-dark');
            item.querySelector('.badge-new')?.remove();

            const idxAll = allAnnouncements.findIndex(a => a.announcementId == id);
            if (idxAll > -1) allAnnouncements[idxAll].isRead = true;

            const idxDrop = announcements?.findIndex?.(a => a.announcementId == id);
            if (idxDrop > -1) announcements[idxDrop].isRead = true;

            const counter = document.getElementById('announcementCounter');
            if (counter) {
                const num = Math.max(0, (parseInt(counter.textContent || '0', 10) - 1));
                counter.textContent = num > 0 ? num : '';
            }
            fetchAnnouncements();
            updateUnreadCounter();
        } catch (err) {
            console.error('Đánh dấu đọc không thành công: ', err);
        }
    };
}

function updateCountAnnouncement(data) {
    const countEl = document.getElementById('countannoucement');
    if (!countEl) return;
    const unreadCount = data.filter(a => !a.isRead).length;
    countEl.textContent = `${unreadCount} thông báo mới`;
}

document.getElementById('markAllReadBtn').addEventListener('click', async () => {
    if (!confirm('Bạn có muốn đánh dấu đã đọc thông báo này không?')) return;

    try {
        const res = await fetch('/api/announcements', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'action=mark-all-read'
        });
        if (!res.ok) throw new Error(await res.text());

        allAnnouncements.forEach(a => a.isRead = true);
        renderAnnouncements();
        updateCountAnnouncement(allAnnouncements);
        updateUnreadCounter();

        loadAnnouncements();

        alert('Tất cả thông báo được đánh dấu là đã đọc!');
    } catch (err) {
        console.error('Lỗi đánh dấu đã đọc:', err);
        alert('Không thể đánh dấu tất cả là đã đọc');
    }
});

function setupWebSocketList() {
    wsAnn = new WebSocket(wsUrl);

    wsAnn.onopen = () => {
        console.log('WS connected');
        wsRetry = 1000;          // reset back‑off
    };

    wsAnn.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
                case 'full': {
                    // Server gửi toàn bộ list; cập nhật local + render
                    allAnnouncements = msg.data || [];
                    currentPageAnnouncement = 1;
                    renderAnnouncements();
                    updateCountAnnouncement(allAnnouncements);
                    updateUnreadCounter?.();          // gọi được hàm dropdown nếu có
                    break;
                }
                case 'new': {
                    const a = msg.data;
                    if (!a || !a.announcementId) break;

                    const i = allAnnouncements.findIndex(x => x.announcementId === a.announcementId);
                    if (i > -1) allAnnouncements[i] = a;
                    else        allAnnouncements.unshift(a);

                    // Giới hạn giữ tối đa 300 bản ghi để đỡ phình RAM
                    if (allAnnouncements.length > 300) allAnnouncements.length = 300;

                    renderAnnouncements();
                    updateCountAnnouncement(allAnnouncements);
                    updateUnreadCounter?.();
                    break;
                }
                case 'delete': {
                    const id = msg.id;
                    if (!id) break;
                    allAnnouncements = allAnnouncements.filter(x => x.announcementId !== id);
                    renderAnnouncements();
                    updateCountAnnouncement(allAnnouncements);
                    updateUnreadCounter?.();
                    break;
                }
                case 'read': {          // nếu server broadcast khi client khác mark‑read
                    const id = msg.id;
                    const i  = allAnnouncements.findIndex(x => x.announcementId === id);
                    if (i > -1) {
                        allAnnouncements[i].isRead = true;
                        renderAnnouncements();
                        updateCountAnnouncement(allAnnouncements);
                        updateUnreadCounter?.();
                    }
                    break;
                }
                default:
                    console.warn('Unknown WS message:', msg);
            }
        } catch (err) {
            console.error('WS parse error:', err);
        }
    };

    wsAnn.onclose = () => {
        console.log('Announcement‑list WS closed, retry in', wsRetry, 'ms');
        setTimeout(setupWebSocketList, wsRetry);
        wsRetry = Math.min(wsRetry * 2, 30000);   // max 30 s
    };

    wsAnn.onerror = (err) => {
        console.error('Announcement‑list WS error:', err);
        wsAnn.close();
    };
}





