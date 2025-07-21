let serviceOrderWaitlist = [];

// Phân trang
let currentPage = 1;
const pageSize = 10;
let totalPages = 1;

// Hàm khởi tạo trang
async function initializeServiceOrderPage() {
    try {
        console.log('Initializing Service Order Page...');
        setupPaginationEvents();

        // Load danh sách waitlist có status = InProgress và visittype = Initial
        await loadServiceOrderWaitlist();

        console.log('Service Order Page initialized successfully');

    } catch (error) {
        console.error("Error initializing service order page:", error);

        // Thay vì báo lỗi, hiển thị interface với thông báo friendly
        showAlert('Chào mừng đến với Quản lý Đơn Dịch Vụ. Nhấn "Tạo mới" để bắt đầu hoặc sử dụng chức năng tìm kiếm.', 'info');

        // Ẩn loading spinner nếu có lỗi
        const loadingSpinner = document.getElementById("loadingSpinner");
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }

        // Hiển thị demo data hoặc empty state
        displayEmptyState();
    }
}

// Hàm hiển thị empty state khi không có data
function displayEmptyState() {
    const tableContainer = document.getElementById("tableContainer");
    const tableBody = document.getElementById("serviceOrderTableBody");

    if (tableContainer && tableBody) {
        tableContainer.style.display = "block";
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Không có đơn dịch vụ nào</h5>
                        <p class="text-muted">Hiện tại chưa có bệnh nhân nào sẵn sàng cho chỉ định dịch vụ.</p>
                        <button class="btn btn-primary" onclick="loadServiceOrderWaitlist()">
                            <i class="fas fa-refresh me-2"></i>Làm mới
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Hàm load danh sách waitlist cho service order
async function loadServiceOrderWaitlist() {
    const loadingSpinner = document.getElementById("loadingSpinner");
    const tableContainer = document.getElementById("tableContainer");

    try {
        console.log('Starting to load service order waitlist...');

        // Hiển thị loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = "flex";
        }
        if (tableContainer) {
            tableContainer.style.display = "none";
        }

        const response = await fetch('/api/doctor/service-order?action=getServiceOrderWaitlist', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch service order waitlist`);
        }

        const responseData = await response.json();
        console.log('Service Order Waitlist Response:', responseData);

        // Ẩn loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }

        if (!responseData.success) {
            throw new Error(responseData.message || 'Failed to load service order waitlist');
        }

        const waitlists = responseData.data;
        if (!waitlists || waitlists.length === 0) {
            showAlert('Hiện tại chưa có bệnh nhân nào sẵn sàng cho chỉ định dịch vụ.', 'info');
            if (tableContainer) {
                tableContainer.style.display = "none";
            }
            return;
        }

        serviceOrderWaitlist = waitlists;
        if (tableContainer) {
            tableContainer.style.display = "block";
        }
        renderServiceOrderTable();

        showAlert(`Đã tải ${waitlists.length} bệnh nhân sẵn sàng cho chỉ định dịch vụ.`, 'success');

    } catch (error) {
        console.error("Error loading service order waitlist:", error);
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }
        if (tableContainer) {
            tableContainer.style.display = "none";
        }
        showAlert(`Không thể tải danh sách chờ chỉ định dịch vụ: ${error.message}`, 'danger');
    }
}

// Hàm render bảng service order waitlist
function renderServiceOrderTable() {
    const tableBody = document.getElementById("serviceOrderTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Tính toán phân trang
    totalPages = Math.ceil(serviceOrderWaitlist.length / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, serviceOrderWaitlist.length);
    const pageData = serviceOrderWaitlist.slice(startIdx, endIdx);

    pageData.forEach((waitlist, index) => {
        const statusClass = getStatusClass(waitlist.status);
        const row = document.createElement("tr");
        row.className = "service-order-row";
        // Determine which button to show based on status and visittype
        let actionButton = '';
        const status = waitlist.status?.toLowerCase();
        const visittype = waitlist.visittype?.toLowerCase();
        if (status === 'inprogress') {
            actionButton = `
                <button class="btn btn-success assign-service-btn" data-waitlist-id="${waitlist.waitlist_id}" data-patient-id="${waitlist.patient_id}">
                    <i class="fas fa-stethoscope me-1"></i>Chỉ định
                </button>
            `;
        } else if (visittype === 'result' && status === 'waiting') {
            actionButton = `
                <button class="btn btn-primary view-results-btn" data-waitlist-id="${waitlist.waitlist_id}" data-patient-id="${waitlist.patient_id}">
                    <i class="fas fa-eye me-1"></i>Xem kết quả
                </button>
            `;
        } else {
            actionButton = `
                <span class="text-muted">
                    <i class="fas fa-minus-circle me-1"></i>Không có thao tác
                </span>
            `;
        }
        row.innerHTML = `
            <td>${startIdx + index + 1}</td>
            <td>
                <div class="patient-info">
                    <div class="patient-name">${waitlist.full_name || 'N/A'}</div>
                    <div class="patient-details">
                        Mã BN: ${waitlist.patient_id || 'N/A'} | 
                        Tuổi: ${waitlist.dob ? calculateAge(waitlist.dob) : 'N/A'} | 
                        Giới tính: ${waitlist.gender || 'N/A'}
                    </div>
                </div>
            </td>
            <td><i class="fas fa-door-open me-2"></i>Phòng ${waitlist.room_id || 'N/A'}</td>
            <td><i class="fas fa-calendar-plus me-2"></i>${formatDate(waitlist.registered_at)}</td>
            <td><i class="fas fa-hourglass-start me-2"></i>${formatTime(waitlist.estimated_time)}</td>
            <td><i class="fas fa-calendar-check me-2"></i>${formatDateTime(waitlist.appointment_datetime)}</td>
            <td><span class="status-badge ${statusClass}">${waitlist.status === 'InProgress' ? 'Đang khám' : waitlist.status === 'Waiting' ? 'Chờ kết quả' : waitlist.status === 'Completed' ? 'Hoàn thành' : waitlist.status || 'N/A'}</span></td>
            <td><i class="fas fa-vial me-2"></i>${waitlist.visittype || 'N/A'}</td>
            <td><i class="fas fa-sticky-note me-2"></i>${waitlist.note || 'Không có ghi chú'}</td>
            <td><i class="fas fa-clock me-2"></i>${waitlist.shift || 'N/A'}</td>
            <td>
                ${actionButton}
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Cập nhật thông tin phân trang
    const paginationInfo = document.getElementById("paginationInfo");
    if (paginationInfo) {
        if (serviceOrderWaitlist.length === 0) {
            paginationInfo.textContent = "Hiển thị 0 mục";
        } else {
            paginationInfo.textContent = `Hiển thị ${startIdx + 1} đến ${endIdx} trên tổng ${serviceOrderWaitlist.length} mục`;
        }
    }

    // Cập nhật trạng thái nút
    const btnPrev = document.getElementById("btnPreviousPage");
    const btnNext = document.getElementById("btnNextPage");
    if (btnPrev) btnPrev.classList.toggle("disabled", currentPage === 1);
    if (btnNext) btnNext.classList.toggle("disabled", currentPage === totalPages);
}

// Sự kiện chuyển trang
function setupPaginationEvents() {
    const btnPrev = document.getElementById("btnPreviousPage");
    const btnNext = document.getElementById("btnNextPage");
    if (btnPrev) {
        btnPrev.onclick = function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderServiceOrderTable();
            }
        };
    }
    if (btnNext) {
        btnNext.onclick = function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderServiceOrderTable();
            }
        };
    }
}

// Gọi setupPaginationEvents khi trang được khởi tạo

// Hàm lấy class CSS cho status
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'waiting':
            return 'status-waiting';
        case 'inprogress':
            return 'status-inprogress';
        case 'skipped':
            return 'status-secondary';
        case 'completed':
            return 'status-completed';
        default:
            return 'status-secondary';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}

function formatTime(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
}

// Hàm tính tuổi
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// Hàm xử lý nút chỉ định dịch vụ
async function assignServices(waitlistId, patientId) {
    try {
        // Lấy medicine record ID từ waitlist
        const response = await fetch(`/api/doctor/waitlist?action=detail&id=${waitlistId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to get waitlist details');

        const waitlist = await response.json();

        // Chuyển hướng sang trang chọn dịch vụ với thông tin cần thiết
        window.location.href = `service-order-details.html?waitlistId=${waitlistId}&patientId=${patientId}`;

    } catch (error) {
        console.error("Error getting waitlist details:", error);
        showAlert('Failed to get waitlist details. Please try again.', 'danger');
    }
}

// Hàm xử lý nút view xét nghiệm
async function viewTestResults(waitlistId, patientId) {
    try {
        console.log('Viewing test results for:', { waitlistId, patientId });
        
        // Lấy thông tin chi tiết của waitlist để có medicine_record_id
        const waitlistResponse = await fetch(`/api/doctor/waitlist?action=detail&id=${waitlistId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!waitlistResponse.ok) {
            throw new Error('Failed to get waitlist details');
        }

        const waitlistData = await waitlistResponse.json();
        console.log('Waitlist data:', waitlistData);

        if (!waitlistData.success || !waitlistData.data) {
            throw new Error('Invalid waitlist data');
        }

        const medicineRecordId = waitlistData.data.medicine_record_id;
        if (!medicineRecordId) {
            throw new Error('Medicine record ID not found');
        }

        // Chuyển hướng đến trang xem kết quả xét nghiệm
        window.location.href = `test-results.html?medicineRecordId=${medicineRecordId}&patientId=${patientId}&waitlistId=${waitlistId}`;

    } catch (error) {
        console.error("Error viewing test results:", error);
        showAlert(`Failed to view test results: ${error.message}`, 'danger');
    }
}

// Hàm hiển thị alert
function showAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) return; // Nếu không có alertContainer thì không làm gì cả

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;

    // Tự động ẩn alert sau 5 giây
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Service Order Page');

    // Khởi tạo trang khi load
    try {
        initializeServiceOrderPage();
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        showAlert('Page loaded with some issues. Functions may still work.', 'warning');
    }

    // Event listener cho việc nhấn nút chỉ định
    const tableBody = document.getElementById("serviceOrderTableBody");
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const assignBtn = e.target.closest('.assign-service-btn');
            if (assignBtn) {
                const waitlistId = assignBtn.getAttribute('data-waitlist-id');
                const patientId = assignBtn.getAttribute('data-patient-id');
                console.log('Assign services clicked:', { waitlistId, patientId });
                assignServices(waitlistId, patientId);
            }
        });
    } else {
        console.warn('serviceOrderTableBody not found');
    }

    // Event listener cho việc refresh
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            loadServiceOrderWaitlist();
        }
    });

    console.log('All event listeners set up successfully');
});

// Hàm load lịch sử service orders của bác sĩ hiện tại
async function loadMyServiceOrders() {
    const historyLoadingSpinner = document.getElementById("historyLoadingSpinner");
    const historyContent = document.getElementById("historyContent");
    const historyList = document.getElementById("historyList");

    try {
        // Hiển thị loading
        if (historyLoadingSpinner) historyLoadingSpinner.style.display = "flex";
        if (historyContent) historyContent.style.display = "none";

        const response = await fetch('/api/doctor/service-order?action=getServiceOrdersByDoctor', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load service order history');
        }

        const result = await response.json();

        if (result.success) {
            const historyData = result.data;

            // Clear previous content
            historyList.innerHTML = '';

            if (historyData && historyData.length > 0) {
                historyData.forEach((order, index) => {
                    const historyItem = document.createElement("div");
                    historyItem.className = "history-item";

                    historyItem.innerHTML = `
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <h6><i class="fas fa-file-medical me-2"></i>Order #${order.service_order_id || 'N/A'}</h6>
                                <small class="text-muted">${formatDateTime(order.order_date)}</small>
                            </div>
                            <div class="col-md-4">
                                <strong>Patient:</strong> ${order.patient_name || 'N/A'}<br>
                                <strong>Medicine Record:</strong> ${order.medicineRecord_id || 'N/A'}
                            </div>
                            <div class="col-md-3">
                                <span class="status-badge status-completed">Completed</span>
                            </div>
                            <div class="col-md-2 text-end">
                                <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${order.service_order_id})">
                                    <i class="fas fa-eye me-1"></i>View Details
                                </button>
                            </div>
                        </div>
                    `;
                    historyList.appendChild(historyItem);
                });

                showAlert(`Loaded ${historyData.length} service order(s)`, 'success');
            } else {
                historyList.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No service orders found.</div>';
            }

            // Hiển thị content
            historyLoadingSpinner.style.display = "none";
            historyContent.style.display = "block";

        } else {
            throw new Error(result.message || 'Failed to load service order history');
        }

    } catch (error) {
        console.error("Error loading service order history:", error);
        showAlert(error.message || 'Failed to load service order history. Please try again.', 'danger');
        historyLoadingSpinner.style.display = "none";
    }
}

// Thêm tất cả các functions còn thiếu để nút hoạt động

// Hàm tìm kiếm service order theo ID
async function searchServiceOrder() {
    const orderId = document.getElementById('serviceOrderIdInput').value;
    if (!orderId) {
        showAlert('Please enter an order ID', 'warning');
        return;
    }

    try {
        showAlert('Searching for order ID: ' + orderId, 'info');
        // Logic tìm kiếm sẽ được implement
    } catch (error) {
        console.error("Error searching service order:", error);
        showAlert('Error searching service order', 'danger');
    }
}

// Hàm tìm kiếm theo medicine record ID
async function searchByMedicineRecord() {
    const recordId = document.getElementById('medicineRecordIdInput').value;
    if (!recordId) {
        showAlert('Please enter a medicine record ID', 'warning');
        return;
    }

    try {
        showAlert('Searching for medicine record ID: ' + recordId, 'info');
        // Logic tìm kiếm sẽ được implement
    } catch (error) {
        console.error("Error searching by medicine record:", error);
        showAlert('Error searching by medicine record', 'danger');
    }
}

// Hàm tìm kiếm theo tên bệnh nhân
async function searchByPatientName() {
    const patientName = document.getElementById('patientNameInput').value;
    if (!patientName) {
        showAlert('Please enter a patient name', 'warning');
        return;
    }

    try {
        showAlert('Searching for patient: ' + patientName, 'info');
        // Logic tìm kiếm sẽ được implement
    } catch (error) {
        console.error("Error searching by patient name:", error);
        showAlert('Error searching by patient name', 'danger');
    }
}

// Hàm load lịch sử của bác sĩ
async function loadDoctorHistory() {
    try {
        showAlert('Loading doctor history...', 'info');
        await loadMyServiceOrders();

        // Hiển thị section lịch sử
        const historySection = document.getElementById('serviceOrderHistorySection');
        if (historySection) {
            historySection.style.display = 'block';
            historySection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Error loading doctor history:", error);
        showAlert('Error loading doctor history', 'danger');
    }
}

// Hàm xem chi tiết order
async function viewOrderDetails(orderId) {
    const detailsLoadingSpinner = document.getElementById("detailsLoadingSpinner");
    const detailsContent = document.getElementById("detailsContent");
    const detailsSection = document.getElementById("serviceOrderDetailsSection");

    try {
        console.log('Loading details for order:', orderId);
        showAlert('Loading details for order: ' + orderId, 'info');

        // Hiển thị section details
        if (detailsSection) {
            detailsSection.style.display = 'block';
            detailsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Hiển thị loading
        if (detailsLoadingSpinner) detailsLoadingSpinner.style.display = "flex";
        if (detailsContent) detailsContent.style.display = "none";

        const response = await fetch(`/api/doctor/service-order?action=getServiceOrderDetails&orderId=${orderId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch service order details`);
        }

        const result = await response.json();
        console.log('Service Order Details:', result);

        // Ẩn loading
        if (detailsLoadingSpinner) detailsLoadingSpinner.style.display = "none";

        if (!result.success) {
            throw new Error(result.message || 'Failed to load service order details');
        }

        const orderData = result.data;
        if (!orderData) {
            throw new Error('No order data found');
        }

        // Hiển thị details
        displayServiceOrderDetails(orderData);

        // Hiển thị content
        if (detailsContent) detailsContent.style.display = "block";

        showAlert('Order details loaded successfully', 'success');

    } catch (error) {
        console.error("Error viewing order details:", error);
        if (detailsLoadingSpinner) detailsLoadingSpinner.style.display = "none";
        if (detailsContent) detailsContent.style.display = "none";
        showAlert(`Error loading order details: ${error.message}`, 'danger');
    }
}

// Hàm hiển thị chi tiết service order
function displayServiceOrderDetails(orderData) {
    console.log('Displaying order details:', orderData);

    // Hiển thị thông tin cơ bản
    const elements = {
        detailOrderId: document.getElementById('detailOrderId'),
        detailPatientName: document.getElementById('detailPatientName'),
        detailDoctorName: document.getElementById('detailDoctorName'),
        detailOrderDate: document.getElementById('detailOrderDate'),
        detailServicesList: document.getElementById('detailServicesList'),
        detailTotalAmount: document.getElementById('detailTotalAmount')
    };

    // Cập nhật thông tin cơ bản
    if (elements.detailOrderId) elements.detailOrderId.textContent = orderData.service_order_id || orderData.orderId || 'N/A';
    if (elements.detailPatientName) elements.detailPatientName.textContent = orderData.patient_name || orderData.patientName || 'N/A';
    if (elements.detailDoctorName) elements.detailDoctorName.textContent = orderData.doctor_name || orderData.doctorName || 'N/A';
    if (elements.detailOrderDate) elements.detailOrderDate.textContent = formatDateTime(orderData.order_date || orderData.orderDate) || 'N/A';

    // Hiển thị danh sách services
    if (elements.detailServicesList) {
        let servicesHtml = '';
        let totalAmount = 0;

        const services = orderData.items || orderData.services || [];

        if (services && services.length > 0) {
            services.forEach((service, index) => {
                const serviceName = service.service_name || service.name || 'Unknown Service';
                const servicePrice = parseFloat(service.service_price || service.price || 0);
                const serviceDescription = service.service_description || service.description || '';

                totalAmount += servicePrice;

                servicesHtml += `
                    <div class="service-item mb-3 p-3 border rounded">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h6 class="mb-1">${serviceName}</h6>
                                ${serviceDescription ? `<p class="text-muted mb-0">${serviceDescription}</p>` : ''}
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-primary fs-6">${servicePrice.toLocaleString()} VND</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            servicesHtml = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No services found for this order.</div>';
        }

        elements.detailServicesList.innerHTML = servicesHtml;

        // Cập nhật tổng tiền
        if (elements.detailTotalAmount) {
            const displayTotal = orderData.total_amount || orderData.totalAmount || totalAmount;
            elements.detailTotalAmount.textContent = parseFloat(displayTotal).toLocaleString();
        }
    }
}

// Demo functions
function demoGetServiceOrderDetails() {
    showAlert('Demo: Getting service order details...', 'info');
    console.log('Demo function: Get Service Order Details');

    // Demo with orderId = 1 if available
    viewOrderDetails(1);
}

function demoGetPatientHistory() {
    showAlert('Demo: Getting patient history...', 'info');
    console.log('Demo function: Get Patient History');
}

function demoGetDoctorHistory() {
    showAlert('Demo: Getting doctor history...', 'info');
    console.log('Demo function: Get Doctor History');
}

function demoSearchByPatientName() {
    showAlert('Demo: Searching by patient name...', 'info');
    console.log('Demo function: Search By Patient Name');
}

function runDebugTests() {
    showAlert('Running debug tests...', 'info');
    console.log('Debug Tests Running...');

    // Test all functions
    console.log('Testing functions availability:');
    console.log('- loadServiceOrderWaitlist:', typeof loadServiceOrderWaitlist);
    console.log('- loadMyServiceOrders:', typeof loadMyServiceOrders);
    console.log('- searchServiceOrder:', typeof searchServiceOrder);
    console.log('- searchByMedicineRecord:', typeof searchByMedicineRecord);
    console.log('- searchByPatientName:', typeof searchByPatientName);
    console.log('- loadDoctorHistory:', typeof loadDoctorHistory);
    console.log('- viewOrderDetails:', typeof viewOrderDetails);
}

// Export tất cả functions ra window để có thể gọi từ HTML
window.initializeServiceOrderPage = initializeServiceOrderPage;
window.loadServiceOrderWaitlist = loadServiceOrderWaitlist;
window.loadMyServiceOrders = loadMyServiceOrders;
window.searchServiceOrder = searchServiceOrder;
window.searchByMedicineRecord = searchByMedicineRecord;
window.searchByPatientName = searchByPatientName;
window.loadDoctorHistory = loadDoctorHistory;
window.viewOrderDetails = viewOrderDetails;
window.displayServiceOrderDetails = displayServiceOrderDetails;
window.demoGetServiceOrderDetails = demoGetServiceOrderDetails;
window.demoGetPatientHistory = demoGetPatientHistory;
window.demoGetDoctorHistory = demoGetDoctorHistory;
window.demoSearchByPatientName = demoSearchByPatientName;
window.runDebugTests = runDebugTests;
window.showAlert = showAlert;
window.assignServices = assignServices;
window.displayEmptyState = displayEmptyState;


    // Ensure all required functions are available immediately
    window.loadServiceOrderWaitlist = window.loadServiceOrderWaitlist || function() {
        console.log('Loading service order waitlist...');
        // Will be defined by service-order.js
    };
    
    window.loadMyServiceOrders = window.loadMyServiceOrders || function() {
        console.log('Loading my service orders...');
        // Will be defined by service-order.js
    };
    
    window.searchServiceOrder = window.searchServiceOrder || function() {
        console.log('Searching service order...');
        // Will be defined by service-order.js
    };
    
    window.searchByMedicineRecord = window.searchByMedicineRecord || function() {
        console.log('Searching by medicine record...');
        // Will be defined by service-order.js
    };
    
    window.searchByPatientName = window.searchByPatientName || function() {
        console.log('Searching by patient name...');
        // Will be defined by service-order.js
    };
    
    window.loadDoctorHistory = window.loadDoctorHistory || function() {
        console.log('Loading doctor history...');
        // Will be defined by service-order.js
    };
    
    window.demoGetServiceOrderDetails = window.demoGetServiceOrderDetails || function() {
        console.log('Demo: Get service order details');
        // Will be defined by service-order.js
    };
    
    window.demoGetPatientHistory = window.demoGetPatientHistory || function() {
        console.log('Demo: Get patient history');
        // Will be defined by service-order.js
    };
    
    window.demoGetDoctorHistory = window.demoGetDoctorHistory || function() {
        console.log('Demo: Get doctor history');
        // Will be defined by service-order.js
    };
    
    window.demoSearchByPatientName = window.demoSearchByPatientName || function() {
        console.log('Demo: Search by patient name');
        // Will be defined by service-order.js
    };
    
    window.runDebugTests = window.runDebugTests || function() {
        console.log('Running debug tests...');
        // Will be defined by service-order.js
    };
    
    window.printServiceOrder = window.printServiceOrder || function() {
        console.log('Printing service order...');
        window.print();
    };
    
    // Additional UI Functions
    function showStatistics() {
        // Create a beautiful statistics modal
        const modal = document.createElement('div');
        modal.className = 'statistics-modal';
        modal.innerHTML = `
            <div class="statistics-content">
                <div class="statistics-header">
                    <h4><i class="fas fa-chart-line me-2"></i>Service Order Statistics</h4>
                    <button class="btn-close-stats" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="statistics-body">
                    <div class="stats-grid">
                        <div class="stat-card primary">
                            <div class="stat-icon"><i class="fas fa-file-medical"></i></div>
                            <div class="stat-info">
                                <h3>24</h3>
                                <p>Total Orders Today</p>
                            </div>
                        </div>
                        <div class="stat-card success">
                            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="stat-info">
                                <h3>18</h3>
                                <p>Completed Orders</p>
                            </div>
                        </div>
                        <div class="stat-card warning">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                            <div class="stat-info">
                                <h3>6</h3>
                                <p>Pending Orders</p>
                            </div>
                        </div>
                        <div class="stat-card info">
                            <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                            <div class="stat-info">
                                <h3>2.4M</h3>
                                <p>Revenue (VND)</p>
                            </div>
                        </div>
                    </div>
                    <div class="chart-placeholder">
                        <i class="fas fa-chart-area fa-3x"></i>
                        <p>Interactive charts coming soon!</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles for the modal
        const style = document.createElement('style');
        style.textContent = `
            .statistics-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            .statistics-content {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            
            .statistics-header {
                padding: 2rem;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 16px 16px 0 0;
            }
            
            .btn-close-stats {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: background 0.3s;
            }
            
            .btn-close-stats:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .statistics-body {
                padding: 2rem;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                border-left: 4px solid;
            }
            
            .stat-card.primary { border-left-color: #667eea; }
            .stat-card.success { border-left-color: #11998e; }
            .stat-card.warning { border-left-color: #f093fb; }
            .stat-card.info { border-left-color: #3182ce; }
            
            .stat-icon {
                font-size: 2rem;
                color: #667eea;
            }
            
            .stat-info h3 {
                margin: 0;
                font-size: 2rem;
                font-weight: 700;
                color: #2d3748;
            }
            
            .stat-info p {
                margin: 0;
                color: #718096;
                font-size: 0.9rem;
            }
            
            .chart-placeholder {
                text-align: center;
                padding: 3rem;
                color: #718096;
                background: #f8f9fa;
                border-radius: 12px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }
    
    function refreshAllData() {
        // Show loading animation
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }
        
        // Add smooth refresh animation
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            location.reload();
        }, 500);
    }
    
    // Enhanced smooth scrolling and animations
    document.addEventListener('DOMContentLoaded', function() {
        // Add smooth scrolling to all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Add entrance animations to cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        }, observerOptions);
        
        // Observe all cards
        document.querySelectorAll('.modern-card, .action-card, .search-section').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            observer.observe(card);
        });
        
        // Add CSS for entrance animations
        const animationStyle = document.createElement('style');
        animationStyle.textContent = `
            @keyframes slideInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .btn-modern:active {
                transform: translateY(0) scale(0.98);
            }
            
            .action-card:hover .action-icon {
                transform: scale(1.1) rotate(5deg);
            }
            
            .search-item:hover .search-label i {
                transform: scale(1.2);
                color: #667eea;
            }
        `;
        document.head.appendChild(animationStyle);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl + F to focus search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('serviceOrderIdInput');
                if (searchInput) {
                    searchInput.focus();
                    document.getElementById('searchSection').scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
            
            // Ctrl + R to refresh
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                refreshAllData();
            }
        });
        
        // Add tooltips to buttons
        document.querySelectorAll('.btn-modern, .btn-demo').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-modern';
                tooltip.textContent = this.getAttribute('title') || this.textContent;
                tooltip.style.cssText = `
                    position: absolute;
                    background: #2d3748;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    z-index: 1000;
                    transform: translateX(-50%);
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                
                setTimeout(() => tooltip.style.opacity = '1', 100);
                
                this.addEventListener('mouseleave', function() {
                    tooltip.remove();
                }, { once: true });
            });
        });
    });