let fullData = [];
let currentPage = 1;
const rowsPerPage = 5;

// Lấy patient ID từ session hoặc localStorage
function getPatientId() {
    // Thử lấy từ localStorage trước
    const patientId = localStorage.getItem('patientId');
    if (patientId) {
        return parseInt(patientId);
    }
    
    // Nếu không có, thử lấy từ session
    const sessionPatientId = sessionStorage.getItem('patientId');
    if (sessionPatientId) {
        return parseInt(sessionPatientId);
    }
    
    // Mặc định (có thể thay đổi theo logic của bạn)
    return 1;
}

// Tải dữ liệu đơn thuốc từ server
async function loadPrescriptionData() {
    try {
        const patientId = getPatientId();
        const response = await fetch(`/api/prescription?patientId=${patientId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        fullData = data;
        currentPage = 1;
        applyFilter();
        
    } catch (error) {
        console.error('Error loading prescription data:', error);
        document.getElementById('prescription-table-body').innerHTML = 
            '<tr><td colspan="5" class="text-danger">Lỗi khi tải dữ liệu: ' + error.message + '</td></tr>';
    }
}

// Áp dụng filter và hiển thị dữ liệu
function applyFilter() {
    const medicineFilter = document.getElementById('searchMedicine').value.toLowerCase();
    const doctorFilter = document.getElementById('searchDoctor').value.toLowerCase();
    
    let filteredData = fullData.filter(item => {
        const medicineMatch = !medicineFilter || 
            (item.medicine_name && item.medicine_name.toLowerCase().includes(medicineFilter));
        const doctorMatch = !doctorFilter || 
            (item.doctor_name && item.doctor_name.toLowerCase().includes(doctorFilter));
        
        return medicineMatch && doctorMatch;
    });
    
    renderTable(filteredData);
}

// Reset filter
function resetFilter() {
    document.getElementById('searchMedicine').value = '';
    document.getElementById('searchDoctor').value = '';
    currentPage = 1;
    applyFilter();
}

// Hiển thị bảng dữ liệu
function renderTable(data) {
    const tableBody = document.getElementById('prescription-table-body');
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Không có đơn thuốc nào phù hợp!</td></tr>';
        renderPagination(0);
        return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    pageData.forEach((row, indexOnPage) => {
        const globalIndex = start + indexOnPage;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.medicine_name || 'N/A'}</td>
            <td>${formatDate(row.prescription_date) || 'N/A'}</td>
            <td>${row.dosage || 'N/A'}</td>
            <td>${row.doctor_name || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="toggleDetails(${globalIndex})">
                    <i class="fas fa-eye"></i> Chi tiết
                </button>
            </td>
        `;
        tableBody.appendChild(tr);

        // Tạo row chi tiết
        const detailRow = document.createElement('tr');
        detailRow.classList.add('prescription-detail');
        detailRow.dataset.index = globalIndex;
        detailRow.style.display = 'none';
        detailRow.innerHTML = `
            <td colspan="5" class="bg-light">
                <div class="row">
                    <div class="col-md-6">
                        <strong>Ghi chú:</strong> ${row.usage || 'Không có'}<br>
                        <strong>Thành phần:</strong> ${row.ingredient || 'Không có'}<br>
                        <strong>Bảo quản:</strong> ${row.preservation || 'Không có'}
                    </div>
                    <div class="col-md-6">
                        <strong>Số lượng:</strong> ${row.prescribed_quantity || 0}<br>
                        <strong>Giá:</strong> ${row.price ? formatCurrency(row.price) : '0đ'}<br>
                        <strong>Trạng thái:</strong> <span class="badge bg-${getStatusBadge(row.status)}">${row.status || 'N/A'}</span>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(detailRow);
    });

    renderPagination(data.length);
}

// Toggle hiển thị chi tiết
function toggleDetails(index) {
    const detailRows = document.querySelectorAll('.prescription-detail');
    detailRows.forEach(row => {
        if (parseInt(row.dataset.index) === index) {
            row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
        }
    });
}

// Hiển thị pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const createPageItem = (label, page, disabled = false, active = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = label;
        a.addEventListener('click', e => {
            e.preventDefault();
            if (!disabled) {
                currentPage = page;
                applyFilter();
            }
        });
        li.appendChild(a);
        return li;
    };

    // Nút Previous
    pagination.appendChild(createPageItem('«', currentPage - 1, currentPage === 1));

    // Hiển thị các trang
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        pagination.appendChild(createPageItem(1, 1));
        if (startPage > 2) {
            pagination.appendChild(createPageItem('...', currentPage, true));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageItem(i, i, false, currentPage === i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.appendChild(createPageItem('...', currentPage, true));
        }
        pagination.appendChild(createPageItem(totalPages, totalPages));
    }

    // Nút Next
    pagination.appendChild(createPageItem('»', currentPage + 1, currentPage === totalPages));
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (error) {
        return dateString;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Get status badge color
function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Tải dữ liệu khi trang load
    loadPrescriptionData();
    
    // Event listener cho search medicine
    document.getElementById('searchMedicine').addEventListener('input', function() {
        currentPage = 1;
        applyFilter();
    });
    
    // Event listener cho search doctor
    document.getElementById('searchDoctor').addEventListener('input', function() {
        currentPage = 1;
        applyFilter();
    });
    
    // Event listener cho reset button
    document.getElementById('resetButton').addEventListener('click', resetFilter);
});

// Export functions để có thể gọi từ HTML
window.loadPrescriptionData = loadPrescriptionData;
window.applyFilter = applyFilter;
window.resetFilter = resetFilter;
window.toggleDetails = toggleDetails; 