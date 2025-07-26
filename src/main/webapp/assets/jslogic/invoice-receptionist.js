// Global variables
let invoiceData = [];
let dataTable;
let currentPage = 1;
let pageSize = 10;
let filteredData = [];

// Initialize when page loads
$(document).ready(function() {
    checkLoginStatus().then(() => {
        loadInvoices();
        initializeDataTable();
        setupEventListeners();
    }).catch(() => {
        // If not logged in, redirect to login
        window.location.href = '/login';
    });
});

// Check login status
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/receptionist/invoices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            throw new Error('Not logged in');
        }
        
        // Debug: Log response for troubleshooting
        console.log('Login check response status:', response.status);
        
        return true;
    } catch (error) {
        console.error('Login check error:', error);
        throw error;
    }
}

// Debug function to check user role
async function debugUserRole() {
    try {
        const response = await fetch('/api/receptionist/invoices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Debug - Response status:', response.status);
        console.log('Debug - Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Debug - Response data length:', data ? data.length : 'null');
        }
        
    } catch (error) {
        console.error('Debug - Error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Real-time search functionality
    $('#searchFilter').on('input', function() {
        applyFilters();
    });

    // Status filter
    $('#statusFilter').on('change', function() {
        applyFilters();
    });

    // Date filter
    $('#dateFilter').on('change', function() {
        applyFilters();
    });

    // Page size change
    $('#pageSizeSelect').on('change', function() {
        pageSize = parseInt($(this).val());
        currentPage = 1;
        renderPagination();
        renderInvoices();
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
            if (response.status === 401) {
                showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            } else if (response.status === 403) {
                showError('Bạn không có quyền truy cập trang này.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if data is an error object
        if (data.error) {
            throw new Error(data.error);
        }
        
        invoiceData = data;
        filteredData = [...data]; // Initialize filtered data
        
        renderInvoices();
        updateStatistics();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        showLoading(false);
        
        if (error.message.includes('Failed to fetch')) {
            showErrorState('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
            showErrorState('Không thể tải hóa đơn. Vui lòng thử lại.');
        }
    }
}

// Render invoices in table with pagination
function renderInvoices() {
    const tbody = $('#invoiceTableBody');
    tbody.empty();

    if (!filteredData || filteredData.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Không có hóa đơn nào</p>
                </td>
            </tr>
        `);
        updatePaginationInfo(0);
        renderPagination();
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);

    // Render page data
    pageData.forEach(invoice => {
        const row = createInvoiceRow(invoice);
        tbody.append(row);
    });

    // Update pagination info and controls
    updatePaginationInfo(filteredData.length, startIndex + 1, endIndex);
    renderPagination(totalPages);
}



// Tạo hàng hóa đơn trong bảng
function createInvoiceRow(invoice) {
    const statusClass = getStatusClass(invoice.status);
    const formattedDate = formatDate(invoice.issue_date);
    const servicePrice = formatCurrency(invoice.total_service_price || 0);
    const prescriptionPrice = formatCurrency(invoice.total_prescription_price || 0);
    const totalAmount = formatCurrency(invoice.total_invoice || 0);
    
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
                    <button class="btn btn-sm btn-outline-success" onclick="markAsPaid(${invoice.invoice_id})" title="Đánh dấu đã thanh toán" ${invoice.status === 'Paid' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="markAsPending(${invoice.invoice_id})" title="Đổi về chờ thanh toán" ${invoice.status === 'Pending' ? 'disabled' : ''}>
                        <i class="fas fa-clock"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelInvoice(${invoice.invoice_id})" title="Hủy hóa đơn" ${invoice.status === 'Cancelled' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Initialize DataTable (simplified for custom pagination)
function initializeDataTable() {
    // Remove DataTable initialization since we're using custom pagination
    // The table will be managed by our custom pagination system
}

// Update statistics
function updateStatistics() {
    const totalInvoices = invoiceData.length;
    const paidInvoices = invoiceData.filter(inv => inv.status === 'Paid').length;
    const pendingInvoices = invoiceData.filter(inv => inv.status === 'Pending').length;
    
    // Tính tổng doanh thu từ các hóa đơn đã thanh toán
    const totalRevenue = invoiceData
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.total_invoice || 0), 0);

    $('#totalInvoices').text(totalInvoices);
    $('#totalPaid').text(paidInvoices);
    $('#totalPending').text(pendingInvoices);
    $('#totalRevenue').text(formatCurrency(totalRevenue));
}

// Apply filters
function applyFilters() {
    const statusFilter = $('#statusFilter').val();
    const dateFilter = $('#dateFilter').val();
    const searchFilter = $('#searchFilter').val();

    filteredData = [...invoiceData];

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

    // Reset to first page when filtering
    currentPage = 1;
    
    // Update table and pagination
    renderInvoices();
    
    // Update statistics based on filtered data
    updateFilteredStatistics(filteredData);
}

// Update statistics based on filtered data
function updateFilteredStatistics(filteredData) {
    const totalInvoices = filteredData.length;
    const paidInvoices = filteredData.filter(inv => inv.status === 'Paid').length;
    const pendingInvoices = filteredData.filter(inv => inv.status === 'Pending').length;
    
    // Tính tổng doanh thu từ các hóa đơn đã thanh toán trong dữ liệu đã lọc
    const totalRevenue = filteredData
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.total_invoice || 0), 0);

    $('#totalInvoices').text(totalInvoices);
    $('#totalPaid').text(paidInvoices);
    $('#totalPending').text(pendingInvoices);
    $('#totalRevenue').text(formatCurrency(totalRevenue));
}

// Update pagination info
function updatePaginationInfo(totalItems, startItem = 0, endItem = 0) {
    if (totalItems === 0) {
        $('#paginationInfo').text('Không có hóa đơn nào');
    } else {
        $('#paginationInfo').text(`Hiển thị ${startItem}-${endItem} của ${totalItems} hóa đơn`);
    }
}

// Render pagination controls
function renderPagination(totalPages = 0) {
    const container = $('#paginationContainer');
    container.empty();

    if (totalPages <= 1) {
        return;
    }

    // Previous button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    container.append(`
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" onclick="goToPage(${currentPage - 1})" ${prevDisabled}>
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
        container.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(1)">1</a>
            </li>
        `);
        if (startPage > 2) {
            container.append(`
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `);
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        container.append(`
            <li class="page-item ${active}">
                <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
            </li>
        `);
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            container.append(`
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `);
        }
        container.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${totalPages})">${totalPages}</a>
            </li>
        `);
    }

    // Next button
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    container.append(`
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" onclick="goToPage(${currentPage + 1})" ${nextDisabled}>
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `);
}

// Go to specific page
function goToPage(page) {
    if (page < 1 || page > Math.ceil(filteredData.length / pageSize)) {
        return;
    }
    currentPage = page;
    renderInvoices();
}

// Clear search
function clearSearch() {
    $('#searchFilter').val('');
    applyFilters();
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
                if (response.status === 401) {
                    showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showSuccess('Đã đánh dấu hóa đơn thanh toán thành công!');
            refreshData();
            
        } catch (error) {
            console.error('Error updating invoice status:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            showError('Không thể cập nhật trạng thái hóa đơn: ' + error.message);
        }
    }
}

// Mark invoice as pending
async function markAsPending(invoiceId) {
    const result = await Swal.fire({
        title: 'Đổi về chờ thanh toán?',
        text: `Bạn có chắc chắn muốn đổi hóa đơn #${invoiceId} về trạng thái chờ thanh toán?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f39c12',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đổi trạng thái',
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
                body: JSON.stringify({ status: 'Pending' })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showSuccess('Đã đổi trạng thái hóa đơn về chờ thanh toán thành công!');
            refreshData();
            
        } catch (error) {
            console.error('Error updating invoice status to pending:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            showError('Không thể đổi trạng thái hóa đơn: ' + error.message);
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
                if (response.status === 401) {
                    showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showSuccess('Đã hủy hóa đơn thành công!');
            refreshData();
            
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            showError('Không thể hủy hóa đơn: ' + error.message);
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
    const errorState = $('#errorState');
    
    if (show) {
        spinner.show();
        table.hide();
        errorState.hide();
    } else {
        spinner.hide();
        table.show();
        errorState.hide();
    }
}

function showErrorState(message) {
    const spinner = $('#loadingSpinner');
    const table = $('#invoiceTable');
    const errorState = $('#errorState');
    const errorMessage = $('#errorMessage');
    
    spinner.hide();
    table.hide();
    errorMessage.text(message);
    errorState.show();
}

// Retry loading data
function retryLoad() {
    loadInvoices();
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