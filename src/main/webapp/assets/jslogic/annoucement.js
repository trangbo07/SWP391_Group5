let announcements = [];
const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/announcements';
let ws;
const MAX_DISPLAY = 5;

function normalizeIsRead(raw) {
    return raw === true;
}

async function loadAnnouncements() {
    const bodyEl = document.getElementById('announcementDropdownBody');
    if (!bodyEl) return;

    try {
        const res  = await fetch('/api/announcements');
        const json = await res.json();

        announcements = (Array.isArray(json) ? json : json.data || [])
            .map(a => ({
                ...a,
                isRead: normalizeIsRead(a.isRead)
            }));

        renderNewAnnouncements(announcements);
        updateUnreadCounter();
    } catch (err) {
        console.error('Load announcement failed:', err);
        bodyEl.innerHTML =
            '<div class="p-3 text-center text-danger">Không tải được thông báo</div>';
    }
}

function renderNewAnnouncements(list) {
    const bodyEl = document.getElementById('announcementDropdownBody');
    if (!bodyEl) return;

    const viewList = list.slice(0, MAX_DISPLAY);

    if (viewList.length === 0) {
        bodyEl.innerHTML =
            '<div class="p-3 text-center text-muted">Chưa có thông báo</div>';
        return;
    }

    bodyEl.innerHTML = viewList.map(a => {
        const isUnread = a.isRead === false;
        const boldClass = isUnread ? 'fw-bold text-dark' : '';
        const textSecondaryClass = isUnread ? '' : 'text-body-secondary';

        return `
            <div class="d-flex gap-2 p-3 border-bottom hover-light announcement-item ${boldClass}"
                 data-id="${a.announcementId}"
                 data-title="${a.title}"
                 data-content="${a.content}"
                 data-created="${a.createdAt}"
                 data-author="${a.createdBy ?? a.fullName ?? ''}">
                <div class="flex-grow-1">
                    <h6 class="mb-1 text-truncate ${boldClass}" style="max-width:240px;" title="${a.title}">
                        ${a.title}
                    </h6>
                    <small class="d-block text-truncate ${textSecondaryClass}" style="max-width:240px;" title="${a.content}">
                        ${a.content}
                    </small>
                    <small class="text-muted fst-italic">
                        ${formatDate(a.createdAt)}
                    </small>
                </div>
            </div>
        `;
    }).join('');

    updateUnreadCounter();

    bodyEl.onclick = async (e) => {
        const item = e.target.closest('.announcement-item');
        if (!item) return;

        showAnnouncementModal(
            item.dataset.title,
            item.dataset.content,
            item.dataset.created,
            item.dataset.author
        );

        const id = item.dataset.id;
        if (!id) return;

        try {
            const res = await fetch(`/api/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=markRead&id=${encodeURIComponent(id)}`
            });

            if (res.ok) {
                item.classList.remove('unread', 'fw-bold', 'text-dark');

                const titleEl = item.querySelector('h6');
                if (titleEl) {
                    titleEl.classList.remove('fw-bold', 'text-dark');
                }

                item.querySelector('.badge-new')?.remove();

                const counter = document.getElementById('announcementCounter');
                if (counter) {
                    const num = parseInt(counter.textContent || '0', 10) - 1;
                    counter.textContent = num > 0 ? num : '';
                }

                const idx = announcements.findIndex(a => a.announcementId == id);
                if (idx >= 0) announcements[idx].isRead = true;
                loadAnnouncements();
                updateUnreadCounter();
            } else {
                console.error('Mark-read failed:', await res.text());
            }
        } catch (err) {
            console.error('Mark‑read error', err);
        }
    };
}

function setupWebSocketDropdown() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
                case 'full':
                    announcements = (msg.data || []).map(normalizeAnnouncement);
                    renderNewAnnouncements(announcements);
                    break;
                case 'new':
                    handleNewAnnouncement(msg.data);
                    break;
                case 'delete':
                    handleDeleteAnnouncement(msg.id);
                    break;
                default:
                    console.warn('Unknown message type:', msg.type);
            }
        } catch (e) {
            console.error('Error parsing WS message:', e);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected, retry in 3s');
        setTimeout(setupWebSocketDropdown, 3000); // thử reconnect
    };

    ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
    };
}

function handleDeleteAnnouncement(id) {
    if (!id) return;
    announcements = announcements.filter(a => a.announcementId !== id);
    renderNewAnnouncements(announcements);
    updateUnreadCounter();
}

function handleNewAnnouncement(newAnnouncement) {
    if (!newAnnouncement || !newAnnouncement.announcementId) return;

    const idx = announcements.findIndex(a => a.announcementId === newAnnouncement.announcementId);

    if (idx >= 0) {
        announcements[idx] = newAnnouncement;
    } else {
        announcements.unshift(newAnnouncement);
    }

    renderNewAnnouncements(announcements);
    updateUnreadCounter();
}

function showAnnouncementModal(title, content, createdAt, author) {
    document.getElementById('announcementDetailTitle').textContent   = title;
    document.getElementById('announcementDetailContent').textContent = content;
    document.getElementById('announcementDetailDate').textContent    = formatDate(createdAt);

    const authorEl = document.getElementById('announcementDetailAuthor');
    if (author && author.trim() !== '') {
        authorEl.textContent = `Create by: ${author}`;
        authorEl.style.display = '';
    } else {
        authorEl.style.display = 'none';
    }

    const modalEl = document.getElementById('announcementDetailModal');
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric'
    });
}

function updateUnreadCounter() {
    const counterEl = document.getElementById('announcementCounter');
    if (!counterEl) return;

    const unread = announcements.filter(a => !a.isRead).length;

    if (unread > 0) {
        counterEl.textContent = unread > 99 ? '99+' : unread;
        counterEl.style.display = 'inline-block';
    } else {
        counterEl.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadAnnouncements();
    setupWebSocketDropdown();
});
