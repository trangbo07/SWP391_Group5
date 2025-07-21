// appointment-receptionist.js

let allAppointments = [];
let filteredAppointments = [];
let currentPage = 1;
let pageSize = 25;
let currentAppointmentId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAllAppointments();
    setupEventListeners();
});

function setupEventListeners() {
    // Filter event listeners
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('shiftFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('pageSize').addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderAppointments();
    });
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function loadAllAppointments() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const tableBody = document.getElementById('appointmentsTableBody');
    const noDataMessage = document.getElementById('noDataMessage');

    try {
        // Show loading
        loadingIndicator.style.display = 'block';
        tableBody.innerHTML = '';
        noDataMessage.style.display = 'none';

        const response = await fetch('/api/receptionist/appointment?action=getAllAppointments', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const appointments = await response.json();
        allAppointments = Array.isArray(appointments) ? appointments : [];
        filteredAppointments = [...allAppointments];
        
        renderAppointments();

    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('Failed to load appointments. Please try again.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const shiftFilter = document.getElementById('shiftFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    filteredAppointments = allAppointments.filter(appointment => {
        // Status filter
        if (statusFilter && appointment.status !== statusFilter) {
            return false;
        }

        // Shift filter
        if (shiftFilter && appointment.shift !== shiftFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchFields = [
                appointment.full_name || '',
                appointment.doctor_full_name || '',
                appointment.doctor_department || '',
                appointment.note || ''
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderAppointments();
}

function renderAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const table = document.getElementById('appointmentsTable');

    if (filteredAppointments.length === 0) {
        tableBody.innerHTML = '';
        table.style.display = 'none';
        noDataMessage.style.display = 'block';
        renderPagination(0);
        return;
    }

    table.style.display = 'table';
    noDataMessage.style.display = 'none';

    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const appointmentsToShow = filteredAppointments.slice(startIndex, endIndex);

    // Render table rows
    tableBody.innerHTML = appointmentsToShow.map(appointment => `
        <tr>
            <td>${appointment.appointment_id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-bold">${escapeHtml(appointment.full_name || 'N/A')}</div>
                        <small class="text-muted">${escapeHtml(appointment.phone || 'N/A')}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="fw-bold">${escapeHtml(appointment.doctor_full_name || 'N/A')}</div>
            </td>
            <td>
                <span class="badge bg-info">${escapeHtml(appointment.doctor_department || 'N/A')}</span>
            </td>
            <td>
                <div>${formatDateTime(appointment.appointment_datetime)}</div>
            </td>
            <td>
                <span class="badge ${getShiftBadgeClass(appointment.shift)}">${escapeHtml(appointment.shift || 'N/A')}</span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(appointment.status)}">${escapeHtml(appointment.status || 'N/A')}</span>
            </td>
            <td>
                <div class="text-truncate" style="max-width: 150px;" title="${escapeHtml(appointment.note || '')}">
                    ${escapeHtml(appointment.note || 'No note')}
                </div>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-primary text-white select-patient-btn" 
                            onclick="viewAppointmentDetail(${appointment.appointment_id})" 
                            data-appointment-id="${appointment.appointment_id}" 
                            data-action="view">
                        <i class="fas fa-eye me-1"></i>View
                    </button>
                    <button type="button" class="btn btn-warning text-white select-patient-btn" 
                            onclick="editAppointment(${appointment.appointment_id})" 
                            data-appointment-id="${appointment.appointment_id}" 
                            data-action="edit">
                        <i class="fas fa-edit me-1"></i>Edit
                    </button>
                    ${appointment.status === 'Pending' ? `
                        <button type="button" class="btn btn-success text-white select-patient-btn" 
                                onclick="confirmAppointment(${appointment.appointment_id})" 
                                data-appointment-id="${appointment.appointment_id}" 
                                data-action="confirm">
                            <i class="fas fa-check-circle me-1"></i>Confirm
                        </button>
                        <button type="button" class="btn btn-secondary text-white select-patient-btn" 
                                onclick="cancelAppointment(${appointment.appointment_id})" 
                                data-appointment-id="${appointment.appointment_id}" 
                                data-action="cancel">
                            <i class="fas fa-times-circle me-1"></i>Cancel
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    renderPagination(filteredAppointments.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += '<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>';
        if (startPage > 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredAppointments.length / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderAppointments();
    }
}

function viewAppointmentDetail(appointmentId) {
    const appointment = allAppointments.find(app => app.appointment_id === appointmentId);
    if (!appointment) {
        showError('Appointment not found');
        return;
    }

    currentAppointmentId = appointmentId;

    // Populate modal with appointment details
    document.getElementById('modalAppointmentId').textContent = appointment.appointment_id;
    document.getElementById('modalPatientName').textContent = appointment.full_name || 'N/A';
    document.getElementById('modalPatientPhone').textContent = appointment.phone || 'N/A';
    document.getElementById('modalPatientDob').textContent = appointment.dob || 'N/A';
    document.getElementById('modalPatientGender').textContent = appointment.gender || 'N/A';
    document.getElementById('modalDoctorName').textContent = appointment.doctor_full_name || 'N/A';
    document.getElementById('modalDoctorDepartment').textContent = appointment.doctor_department || 'N/A';
    document.getElementById('modalDateTime').textContent = formatDateTime(appointment.appointment_datetime);
    document.getElementById('modalShift').textContent = appointment.shift || 'N/A';
    document.getElementById('modalStatus').textContent = appointment.status || 'N/A';
    document.getElementById('modalNote').textContent = appointment.note || 'No note';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('appointmentDetailModal'));
    modal.show();
}

function editAppointment(appointmentId) {
    if (appointmentId) {
        currentAppointmentId = appointmentId;
    }
    // This would redirect to edit appointment page or open edit modal
    // For now, just show a message
    showInfo('Edit appointment functionality will be implemented soon.');
}

function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    // Implementation for canceling appointment
    showInfo('Cancel appointment functionality will be implemented soon.');
}

function confirmAppointment(appointmentId) {
    console.log('confirmAppointment called with ID:', appointmentId, 'Type:', typeof appointmentId);
    if (!confirm('Are you sure you want to confirm this appointment?')) {
        return;
    }

    const payload = {
        action: 'confirm',
        appointmentId: Number(appointmentId)
    };
    console.log('Sending payload:', payload);

    fetch('/api/receptionist/appointment', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        console.log('Response status:', res.status);
        return res.json().then(data => ({ ok: res.ok, data }));
    })
    .then(result => {
        console.log('Response data:', result);
        if (result.ok && result.data.success) {
            showSuccess('Appointment confirmed and added to waitlist!');
            refreshAppointments();
        } else {
            showError(result.data.message || 'Failed to confirm appointment.');
        }
    })
    .catch(err => {
        console.error('Error confirming appointment:', err);
        showError('System error. Please try again later.');
    });
}

function createNewAppointment() {
    // This would redirect to create appointment page
    showInfo('Create new appointment functionality will be implemented soon.');
}

function refreshAppointments() {
    loadAllAppointments();
}

function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('shiftFilter').value = '';
    document.getElementById('searchInput').value = '';
    applyFilters();
}

// Utility functions
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'bg-warning';
        case 'confirmed':
            return 'bg-info';
        case 'completed':
            return 'bg-success';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function getShiftBadgeClass(shift) {
    switch (shift?.toLowerCase()) {
        case 'morning':
            return 'bg-light text-dark';
        case 'afternoon':
            return 'bg-warning';
        case 'evening':
            return 'bg-dark';
        default:
            return 'bg-secondary';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showError(message) {
    // Using simple alert for now, can be replaced with toast notifications
    alert('Error: ' + message);
}

function showInfo(message) {
    // Using simple alert for now, can be replaced with toast notifications
    alert('Info: ' + message);
}

function showSuccess(message) {
    // Using simple alert for now, can be replaced with toast notifications
    alert('Success: ' + message);
} 