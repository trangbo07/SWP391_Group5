// Global variables
let invoiceData = [];
let dataTable;
let currentInvoiceId = null;

// Initialize when page loads
$(document).ready(function() {
    loadInvoices();
    initializeDataTable();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    $('#searchFilter').on('keyup', function() {
        if (dataTable) {
            dataTable.search(this.value).draw();
        }
    });

    // Status filter
    $('#statusFilter').on('change', function() {
        applyFilters();
    });

    // Date filter
    $('#dateFilter').on('change', function() {
        applyFilters();
    });

    // Auto refresh every 30 seconds
    setInterval(refreshData, 30000);
}

// Load invoices from API
async function loadInvoices() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/receptionist/invoices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        invoiceData = data;
        
        renderInvoices();
        updateStatistics();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        showLoading(false);
        showError('Không thể tải hóa đơn. Vui lòng thử lại.');
    }
}

// Render invoices in table
function renderInvoices() {
    const tbody = $('#invoiceTableBody');
    tbody.empty();

    if (!invoiceData || invoiceData.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Không có hóa đơn nào</p>
                </td>
            </tr>
        `);
        return;
    }

    invoiceData.forEach(invoice => {
        const row = createInvoiceRow(invoice);
        tbody.append(row);
    });
}

// Thêm hàm thanh toán VNPay cho từng hóa đơn
async function payWithVnPay(invoiceId, amount) {
    try {
        const response = await fetch('/api/vnpay/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `amount=${Math.round(amount)}`
        });
        const data = await response.json();
        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            showError('Không tạo được link thanh toán VNPay!');
        }
    } catch (e) {
        showError('Lỗi khi tạo link thanh toán VNPay!');
    }
}

// Thêm hàm thanh toán tiền mặt cho từng hóa đơn
async function payWithCash(invoiceId) {
    const result = await Swal.fire({
        title: 'Xác nhận thanh toán tiền mặt?',
        text: `Bạn chắc chắn muốn đánh dấu hóa đơn #${invoiceId} đã thanh toán bằng tiền mặt?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đã nhận tiền',
        cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/receptionist/invoices/${invoiceId}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Paid' })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            showSuccess('Đã đánh dấu hóa đơn thanh toán tiền mặt thành công!');
            refreshData();
        } catch (error) {
            console.error('Error updating invoice status:', error);
            showError('Không thể cập nhật trạng thái hóa đơn!');
        }
    }
}

// Sửa hàm createInvoiceRow để thêm nút thanh toán tiền mặt nếu hóa đơn chưa thanh toán
function createInvoiceRow(invoice) {
    const statusClass = getStatusClass(invoice.status);
    const formattedDate = formatDate(invoice.issue_date);
    const servicePrice = formatCurrency(invoice.total_service_price || 0);
    const prescriptionPrice = formatCurrency(invoice.total_prescription_price || 0);
    const totalAmount = formatCurrency(invoice.total_invoice || 0);
    // Nút VNPay chỉ hiện khi chưa thanh toán
    const vnpayBtn = invoice.status === 'Pending' ? `<button class="btn btn-sm btn-outline-warning" onclick="payWithVnPay(${invoice.invoice_id}, ${invoice.total_invoice || 0})" title="Thanh toán VNPay"><i class="fas fa-credit-card"></i> VNPay</button>` : '';
    // Nút tiền mặt chỉ hiện khi chưa thanh toán
    const cashBtn = invoice.status === 'Pending' ? `<button class="btn btn-sm btn-outline-success" onclick="payWithCash(${invoice.invoice_id})" title="Thanh toán tiền mặt"><i class="fas fa-money-bill-wave"></i> Tiền mặt</button>` : '';
    // Nút View: truyền đúng invoice.invoice_id (số thực tế)
    return `
        <tr>
            <td>
                <strong>#${invoice.invoice_id}</strong>
            </td>
            <td>
                <div class="patient-info">
                    <div class="fw-bold">${invoice.patient_name || 'Không có'}</div>
                    <div class="text-muted">
                        <i class="fas fa-phone me-1"></i>${invoice.patient_phone || 'Không có'}
                    </div>
                    <div class="text-muted small">
                        <i class="fas fa-map-marker-alt me-1"></i>${invoice.patient_address || 'Không có'}
                    </div>
                </div>
            </td>
            <td>
                <div class="text-muted">${formattedDate}</div>
            </td>
            <td>
                <span class="amount">${servicePrice}</span>
            </td>
            <td>
                <span class="amount">${prescriptionPrice}</span>
            </td>
            <td>
                <span class="amount fw-bold">${totalAmount}</span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${getStatusVN(invoice.status)}</span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewInvoiceDetails(${invoice.invoice_id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="markAsPaid(${invoice.invoice_id})" title="Đánh dấu đã thanh toán" ${invoice.status === 'Paid' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelInvoice(${invoice.invoice_id})" title="Hủy hóa đơn" ${invoice.status === 'Cancelled' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                    </button>
                    ${vnpayBtn}
                    ${cashBtn}
                </div>
            </td>
        </tr>
    `;
}

// Initialize DataTable
function initializeDataTable() {
    dataTable = $('#invoiceTable').DataTable({
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Tất cả"]],
        order: [[0, 'desc']], // Sort by invoice ID descending
        responsive: true,
        language: {
            search: "Tìm kiếm:",
            lengthMenu: "Hiển thị _MENU_ hóa đơn",
            info: "Hiển thị _START_ đến _END_ của _TOTAL_ hóa đơn",
            infoEmpty: "Không có hóa đơn nào",
            infoFiltered: "(lọc từ _MAX_ hóa đơn)",
            zeroRecords: "Không tìm thấy hóa đơn phù hợp",
            paginate: {
                first: "Đầu",
                last: "Cuối",
                next: "Tiếp",
                previous: "Trước"
            }
        },
        columnDefs: [
            { orderable: false, targets: 7 } // Actions column
        ]
    });
}

// Update statistics
function updateStatistics() {
    const totalInvoices = invoiceData.length;
    const paidInvoices = invoiceData.filter(inv => inv.status === 'Paid').length;
    const pendingInvoices = invoiceData.filter(inv => inv.status === 'Pending').length;
    const totalAmount = invoiceData.reduce((sum, inv) => sum + (inv.total_invoice || 0), 0);

    $('#totalInvoices').text(totalInvoices);
    $('#totalPaid').text(paidInvoices);
    $('#totalPending').text(pendingInvoices);
    $('#totalAmount').text(formatCurrency(totalAmount));
}

// Apply filters
function applyFilters() {
    const statusFilter = $('#statusFilter').val();
    const dateFilter = $('#dateFilter').val();
    const searchFilter = $('#searchFilter').val();

    let filteredData = invoiceData;

    // Status filter
    if (statusFilter) {
        filteredData = filteredData.filter(invoice => invoice.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
        filteredData = filteredData.filter(invoice => {
            const invoiceDate = new Date(invoice.issue_date).toISOString().split('T')[0];
            return invoiceDate === dateFilter;
        });
    }

    // Search filter
    if (searchFilter) {
        const searchTerm = searchFilter.toLowerCase();
        filteredData = filteredData.filter(invoice => 
            (invoice.patient_name && invoice.patient_name.toLowerCase().includes(searchTerm)) ||
            (invoice.patient_phone && invoice.patient_phone.includes(searchTerm)) ||
            (invoice.invoice_id && invoice.invoice_id.toString().includes(searchTerm))
        );
    }

    // Update table with filtered data
    if (dataTable) {
        dataTable.clear();
        filteredData.forEach(invoice => {
            const row = createInvoiceRow(invoice);
            dataTable.row.add($(row));
        });
        dataTable.draw();
    }
}

// View invoice details
async function viewInvoiceDetails(invoiceId) {
    currentInvoiceId = invoiceId;
    
    try {
        const response = await fetch(`/api/receptionist/invoices/${invoiceId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const invoice = await response.json();
        showInvoiceDetails(invoice);
        
    } catch (error) {
        console.error('Error loading invoice details:', error);
        showError('Không thể tải chi tiết hóa đơn.');
    }
}

// Show invoice details in modal
function showInvoiceDetails(invoice) {
    const modal = new bootstrap.Modal(document.getElementById('invoiceDetailModal'));
    const content = $('#invoiceDetailContent');
    
    const html = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted">Thông tin hóa đơn</h6>
                <table class="table table-borderless">
                    <tr>
                        <td><strong>Mã hóa đơn:</strong></td>
                        <td>#${invoice.invoice_id}</td>
                    </tr>
                    <tr>
                        <td><strong>Ngày lập:</strong></td>
                        <td>${formatDate(invoice.issue_date)}</td>
                    </tr>
                    <tr>
                        <td><strong>Trạng thái:</strong></td>
                        <td><span class="status-badge ${getStatusClass(invoice.status)}">${getStatusVN(invoice.status)}</span></td>
                    </tr>
                    <tr>
                        <td><strong>Tổng tiền:</strong></td>
                        <td class="amount fw-bold">${formatCurrency(invoice.total_invoice || 0)}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted">Thông tin bệnh nhân</h6>
                <table class="table table-borderless">
                    <tr>
                        <td><strong>Họ tên:</strong></td>
                        <td>${invoice.patient_name || 'Không có'}</td>
                    </tr>
                    <tr>
                        <td><strong>Số điện thoại:</strong></td>
                        <td>${invoice.patient_phone || 'Không có'}</td>
                    </tr>
                    <tr>
                        <td><strong>Địa chỉ:</strong></td>
                        <td>${invoice.patient_address || 'Không có'}</td>
                    </tr>
                    <tr>
                        <td><strong>Giới tính:</strong></td>
                        <td>${invoice.patient_gender || 'Không có'}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <h6 class="text-muted">Chi tiết thanh toán</h6>
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Diễn giải</th>
                            <th class="text-end">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tiền dịch vụ</td>
                            <td class="text-end">${formatCurrency(invoice.total_service_price || 0)}</td>
                        </tr>
                        <tr>
                            <td>Tiền thuốc</td>
                            <td class="text-end">${formatCurrency(invoice.total_prescription_price || 0)}</td>
                        </tr>
                        <tr class="table-primary">
                            <td><strong>Tổng cộng</strong></td>
                            <td class="text-end"><strong>${formatCurrency(invoice.total_invoice || 0)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    content.html(html);
    modal.show();
}

// Mark invoice as paid
async function markAsPaid(invoiceId) {
    const result = await Swal.fire({
        title: 'Đánh dấu đã thanh toán?',
        text: `Bạn có chắc chắn muốn đánh dấu hóa đơn #${invoiceId} đã thanh toán?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đã thanh toán',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/receptionist/invoices/${invoiceId}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Paid' })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            showSuccess('Đã đánh dấu hóa đơn thanh toán thành công!');
            refreshData();
            
        } catch (error) {
            console.error('Error updating invoice status:', error);
            showError('Không thể cập nhật trạng thái hóa đơn!');
        }
    }
}

// Cancel invoice
async function cancelInvoice(invoiceId) {
    const result = await Swal.fire({
        title: 'Hủy hóa đơn?',
        text: `Bạn có chắc chắn muốn hủy hóa đơn #${invoiceId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Hủy hóa đơn',
        cancelButtonText: 'Không'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/receptionist/invoices/${invoiceId}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Cancelled' })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            showSuccess('Đã hủy hóa đơn thành công!');
            refreshData();
            
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            showError('Không thể hủy hóa đơn.');
        }
    }
}

// Refresh data
function refreshData() {
    loadInvoices();
}

// Export to Excel
function exportToExcel() {
    // Implementation for Excel export
    showInfo('Chức năng xuất Excel sẽ được triển khai sớm.');
}

// Print invoice
function printInvoice() {
    if (currentInvoiceId) {
        window.open(`/api/receptionist/invoices/${currentInvoiceId}/print`, '_blank');
    }
}

// Logout function
function logout() {
    // Implementation for logout
    window.location.href = '/logout';
}

// Utility functions
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'paid':
            return 'status-paid';
        case 'pending':
            return 'status-pending';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
}

function getStatusVN(status) {
    switch ((status || '').toLowerCase()) {
        case 'paid': return 'Đã thanh toán';
        case 'pending': return 'Chờ thanh toán';
        case 'cancelled': return 'Đã hủy';
        default: return status || '';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Không có';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0₫';
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function showLoading(show) {
    const spinner = $('#loadingSpinner');
    const table = $('#invoiceTable');
    
    if (show) {
        spinner.show();
        table.hide();
    } else {
        spinner.hide();
        table.show();
    }
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        timer: 3000,
        showConfirmButton: false
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message,
        confirmButtonColor: '#e74c3c'
    });
}

function showInfo(message) {
    Swal.fire({
        icon: 'info',
        title: 'Thông báo',
        text: message,
        confirmButtonColor: '#3498db'
    });
} 