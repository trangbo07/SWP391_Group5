document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    setupWebSocket();
});

let announcements = [];
const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/announcements';
let ws;

async function loadAnnouncements() {
    const bodyEl = document.getElementById('announcementDropdownBody');
    if (!bodyEl) return;

    try {
        const res  = await fetch('/api/announcements');
        const json = await res.json();
        announcements = Array.isArray(json) ? json : json.data || [];

        renderAnnouncements(announcements);
    } catch (err) {
        console.error('Load announcement failed:', err);
        bodyEl.innerHTML =
            '<div class="p-3 text-center text-danger">Không tải được thông báo</div>';
    }
}

function renderAnnouncements(list) {
    const bodyEl = document.getElementById('announcementDropdownBody');
    if (!bodyEl) return;

    if (list.length === 0) {
        bodyEl.innerHTML =
            '<div class="p-3 text-center text-muted">Chưa có thông báo</div>';
        return;
    }

    bodyEl.innerHTML = list.map(a => `
        <div class="d-flex gap-2 p-3 border-bottom hover-light announcement-item"
             data-id="${a.announcementId}"
             data-title="${a.title}"
             data-content="${a.content}"
             data-created="${a.createdAt}"
             data-author="${a.createdBy ?? a.fullName ?? ''}">
            <div class="flex-grow-1">
                <h6 class="mb-1 fw-semibold text-truncate"
                    style="max-width: 240px;"
                    title="${a.title}">
                    ${a.title}
                </h6>
                <small class="d-block text-truncate text-body-secondary"
                       style="max-width: 240px;"
                       title="${a.content}">
                    ${a.content}
                </small>
                <small class="text-muted fst-italic">
                    ${formatDate(a.createdAt)}
                </small>
            </div>
        </div>
    `).join('');

    // Gán lại sự kiện click modal (do innerHTML thay đổi)
    bodyEl.onclick = (e) => {
        const item = e.target.closest('.announcement-item');
        if (!item) return;

        showAnnouncementModal(
            item.dataset.title,
            item.dataset.content,
            item.dataset.created,
            item.dataset.author
        );
    };
}

function setupWebSocket() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
                case 'full':
                    announcements = msg.data || [];
                    renderAnnouncements(announcements);
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
        setTimeout(setupWebSocket, 3000); // thử reconnect
    };

    ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
    };
}

function handleDeleteAnnouncement(id) {
    if (!id) return;
    announcements = announcements.filter(a => a.announcementId !== id);
    renderAnnouncements(announcements);
}

function handleNewAnnouncement(newAnnouncement) {
    if (!newAnnouncement || !newAnnouncement.announcementId) return;

    const idx = announcements.findIndex(a => a.announcementId === newAnnouncement.announcementId);

    if (idx >= 0) {
        announcements[idx] = newAnnouncement;
    } else {
        announcements.unshift(newAnnouncement);
    }

    renderAnnouncements(announcements);
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
