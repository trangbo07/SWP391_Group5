// Hiển thị danh sách bệnh nhân đã thanh toán trên trang log-adminbusiness.html
async function fetchPaidInvoices() {
    try {
        const response = await fetch('/api/receptionist/invoices', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách hóa đơn');
        const invoices = await response.json();
        return invoices.filter(inv => inv.status === 'Paid');
    } catch (e) {
        console.error(e);
        return [];
    }
}

let paidInvoicesCache = [];
let filteredInvoices = [];
let currentPage = 1;
const pageSize = 5;
let currentSearch = '';
let currentInvoiceIdSearch = '';
let currentTimeOrder = 'desc';

function formatCurrency(amount) {
    if (!amount) return '0 VNĐ';
    return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    let normalized = dateString.replace(' ', 'T').replace('.0', '').replace('.S', '');
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
        normalized += ':00';
    }
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('vi-VN');
}

async function renderPaidPatients() {
    paidInvoicesCache = await fetchPaidInvoices();
    currentPage = 1;
    currentSearch = '';
    currentInvoiceIdSearch = '';
    currentTimeOrder = 'desc';
    setupPaidPatientsControls();
    applyPaidPatientsFilter();
}

function setupPaidPatientsControls() {
    const searchInput = document.getElementById('searchPaidPatientName');
    const invoiceIdInput = document.getElementById('searchPaidInvoiceId');
    const filterSelect = document.getElementById('filterPaidPatientTime');
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = function() {
            currentSearch = this.value.trim().toLowerCase();
            currentPage = 1;
            applyPaidPatientsFilter();
        };
    }
    if (invoiceIdInput) {
        invoiceIdInput.value = '';
        invoiceIdInput.oninput = function() {
            currentInvoiceIdSearch = this.value.trim();
            currentPage = 1;
            applyPaidPatientsFilter();
        };
    }
    if (filterSelect) {
        filterSelect.value = 'desc';
        filterSelect.onchange = function() {
            currentTimeOrder = this.value;
            currentPage = 1;
            applyPaidPatientsFilter();
        };
    }
}

function applyPaidPatientsFilter() {
    // Lọc theo tên và mã hóa đơn
    filteredInvoices = paidInvoicesCache.filter(inv => {
        let matchName = true;
        let matchId = true;
        if (currentSearch) {
            matchName = (inv.patient_name || '').toLowerCase().includes(currentSearch);
        }
        if (currentInvoiceIdSearch) {
            matchId = String(inv.invoice_id).includes(currentInvoiceIdSearch);
        }
        return matchName && matchId;
    });
    // Sắp xếp theo thời gian
    filteredInvoices.sort((a, b) => {
        const timeA = new Date((a.issue_date || '').replace(' ', 'T').replace('.0', ''));
        const timeB = new Date((b.issue_date || '').replace(' ', 'T').replace('.0', ''));
        if (isNaN(timeA.getTime()) || isNaN(timeB.getTime())) return 0;
        return currentTimeOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    renderPaidPatientsTable();
    renderPaginationControls();
}

function renderPaidPatientsTable() {
    const tbody = document.getElementById('paidPatientsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (filteredInvoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Không có bệnh nhân đã thanh toán</td></tr>`;
        return;
    }
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, filteredInvoices.length);
    for (let i = start; i < end; i++) {
        const inv = filteredInvoices[i];
        const paidTime = inv.issue_date || '';
        const info = `<b>${inv.patient_name}</b> đã thanh toán <span class='text-primary fw-bold'>${formatCurrency(inv.total_invoice)}</span>`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${inv.invoice_id}</td>
            <td>${info}</td>
            <td>${formatDateTime(paidTime)}</td>
        `;
        tbody.appendChild(row);
    }
}

function renderPaginationControls() {
    let container = document.getElementById('paidPatientsPagination');
    if (!container) {
        container = document.createElement('div');
        container.id = 'paidPatientsPagination';
        container.className = 'd-flex justify-content-end align-items-center mt-2';
        const tableContainer = document.getElementById('paidPatientsTableContainer');
        if (tableContainer) tableContainer.appendChild(container);
    }
    container.innerHTML = '';
    if (filteredInvoices.length <= pageSize) return;
    const totalPages = Math.ceil(filteredInvoices.length / pageSize);
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-outline-primary btn-sm me-2';
    prevBtn.innerHTML = '<i class="fas fa-angle-left"></i> Trang trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderPaidPatientsTable(); renderPaginationControls(); };
    container.appendChild(prevBtn);
    const info = document.createElement('span');
    info.className = 'mx-2';
    info.textContent = `Trang ${currentPage} / ${totalPages}`;
    container.appendChild(info);
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-outline-primary btn-sm ms-2';
    nextBtn.innerHTML = 'Trang sau <i class="fas fa-angle-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderPaidPatientsTable(); renderPaginationControls(); };
    container.appendChild(nextBtn);
}

document.addEventListener('DOMContentLoaded', renderPaidPatients); 