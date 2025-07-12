// receptionist-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    initDateTime();
    await loadReceptionistProfile();
    await loadDashboardStats();
    await loadUpcomingAppointments();
    await loadCurrentWaitlist();
    initHoverEffects();
});

function initDateTime() {
    function update() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    update();
    setInterval(update, 1000);
}

async function loadReceptionistProfile() {
    try {
        const res = await fetch('/api/receptionist/profile', {
            method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        document.getElementById('receptionist-name').textContent = `Welcome, ${data.fullName}`;
        document.getElementById('receptionist-greeting').textContent = data.fullName;
    } catch (e) {
        console.error('Profile error:', e);
    }
}

async function loadDashboardStats() {
    try {
        const res = await fetch('/api/receptionist/dashboard-stats', {
            method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to load stats');
        const stats = await res.json();
        animateCounter('total-appointments', stats.totalAppointments || 0);
        animateCounter('waiting-patients', stats.waitingPatients || 0);
        animateCounter('completed-appointments', stats.completedAppointments || 0);
        animateCounter('pending-payments', stats.pendingPayments || 0);
    } catch (e) {
        console.error('Stats error:', e);
    }
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    const steps = 50, duration = 1000, stepVal = target / steps;
    let val = 0, step = 0;
    const interval = setInterval(() => {
        step++;
        val += stepVal;
        el.textContent = Math.round(val);
        if (step >= steps) {
            el.textContent = target;
            clearInterval(interval);
        }
    }, duration / steps);
}

async function loadUpcomingAppointments() {
    try {
        const res = await fetch('/api/appointments/upcoming', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load appointments');
        const data = await res.json();
        const container = document.getElementById('upcoming-appointments-list');
        container.innerHTML = data.length ? '' : '<p class="text-muted text-center">No upcoming appointments</p>';

        data.forEach(app => {
            container.appendChild(createAppointmentElement(app));
        });
    } catch (e) {
        console.error('Upcoming appointments error:', e);
    }
}

function createAppointmentElement(app) {
    const div = document.createElement('div');
    div.className = 'appointment-item';
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h6 class="mb-1">${app.patientName}</h6>
                <p class="mb-0 text-muted">
                    <i class="fas fa-user-md me-2"></i>${app.doctorName}
                    <span class="mx-2">•</span>
                    <i class="fas fa-clock me-2"></i>${formatTime(app.time)}
                </p>
            </div>
            <div>
                <span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span>
            </div>
        </div>
    `;
    return div;
}

async function loadCurrentWaitlist() {
    try {
        const res = await fetch('/api/waitlist/current', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load waitlist');
        const data = await res.json();
        const container = document.getElementById('current-waitlist');
        container.innerHTML = data.length ? '' : '<p class="text-muted text-center">No patients in waitlist</p>';

        data.forEach((item, i) => {
            container.appendChild(createWaitlistElement(item, i));
        });
    } catch (e) {
        console.error('Waitlist error:', e);
    }
}

function createWaitlistElement(patient, index) {
    const div = document.createElement('div');
    div.className = 'appointment-item';
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h6 class="mb-1">${patient.name}</h6>
                <p class="mb-0 text-muted">
                    <i class="fas fa-hashtag me-2"></i>Queue #${index + 1}
                    <span class="mx-2">•</span>
                    <i class="fas fa-clock me-2"></i>${formatWaitTime(patient.waitingSince)}
                </p>
            </div>
            <button class="btn btn-sm btn-outline-primary" onclick="processPatient(${patient.id})">Process</button>
        </div>
    `;
    return div;
}

async function processPatient(patientId) {
    try {
        const res = await fetch(`/api/waitlist/process/${patientId}`, {
            method: 'PUT', credentials: 'include'
        });
        if (!res.ok) throw new Error();
        await loadCurrentWaitlist();
        await loadDashboardStats();
        showAlert('Patient processed successfully', 'success');
    } catch (e) {
        console.error('Process error:', e);
        showAlert('Error processing patient', 'error');
    }
}

function formatTime(timeStr) {
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatWaitTime(startStr) {
    const start = new Date(startStr), now = new Date();
    const diffMin = Math.floor((now - start) / 60000);
    if (diffMin < 60) return `${diffMin}m waiting`;
    const h = Math.floor(diffMin / 60), m = diffMin % 60;
    return `${h}h ${m}m waiting`;
}

function getStatusBadgeClass(status) {
    const map = {
        'PENDING': 'bg-warning', 'CONFIRMED': 'bg-success',
        'IN_PROGRESS': 'bg-info', 'COMPLETED': 'bg-primary',
        'CANCELLED': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
}

function showAlert(msg, type = 'info') {
    alert(`[${type.toUpperCase()}] ${msg}`);
}

function initHoverEffects() {
    document.querySelectorAll('.quick-action-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
    });
}
