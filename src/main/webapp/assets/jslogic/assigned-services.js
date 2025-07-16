let allAssignedServices = [];
let filteredServices = [];
let currentStatusFilter = 'all';
let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', initializePage);

// Auto refresh để check assigned services mới
let autoRefreshInterval;
const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

function initializePage() {
    setupEventListeners();
    fetchAndRenderServices();
    startAutoRefresh();

    // Check for URL parameter indicating new service assigned
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('newAssignment') === 'true') {
        setTimeout(() => {
            showAlert('Bạn có thể có các dịch vụ mới được giao!', 'info');

            // Show new assignment notification
            const notificationEl = document.getElementById('newAssignmentNotification');
            if (notificationEl) {
                notificationEl.classList.remove('d-none');
            }

            // Auto refresh after 3 seconds to check for new assignments
            setTimeout(() => {
                forceRefreshServices();
            }, 3000);
        }, 1000);

        // Clear the URL parameter to prevent repeated notifications
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

function setupEventListeners() {
    const filterButtons = document.querySelectorAll('[data-status-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('btn-primary', 'active'));
            filterButtons.forEach(btn => btn.classList.add('btn-outline-primary'));
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary', 'active');

            currentStatusFilter = button.getAttribute('data-status-filter');
            applyFiltersAndRender();
        });
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        applyFiltersAndRender();
    });
}

async function fetchAndRenderServices(showLoadingAlert = false) {
    const servicesList = document.getElementById("servicesList");
    const errorMessage = document.getElementById("errorMessage");
    const noServicesMessage = document.getElementById("noServicesMessage");

    try {
        if (showLoadingAlert) {
            showAlert('Đang làm mới danh sách dịch vụ đã giao...', 'info');
        }

        servicesList.style.display = "none";
        errorMessage.classList.add("d-none");
        noServicesMessage.classList.add("d-none");

        const response = await fetch('/api/doctor/service-order?action=getAssignedServices');
        if (!response.ok) throw new Error('Không thể lấy danh sách dịch vụ đã giao từ máy chủ.');

        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Không thể xử lý dữ liệu dịch vụ đã giao.');

        const previousCount = allAssignedServices.length;
        const rawData = result.data || [];

        console.log('Raw data from API:', rawData);
        console.log('Number of services received:', rawData.length);

        if (rawData.length > 0) {
            // Debug: Analyze data
            const withResults = rawData.filter(s => s.result_description && s.result_description.trim() !== '');
            const withoutResults = rawData.filter(s => !s.result_description || s.result_description.trim() === '');

            console.log('Services WITH results:', withResults.length);
            console.log('Services WITHOUT results (pending):', withoutResults.length);

            // Show sample data
            if (withoutResults.length > 0) {
                console.log('Sample service WITHOUT results:', withoutResults[0]);
            }
            if (withResults.length > 0) {
                console.log('Sample service WITH results:', withResults[0]);
            }
        }

        allAssignedServices = rawData;

        // Check for new services
        if (showLoadingAlert && allAssignedServices.length > previousCount) {
            showAlert(`Tìm thấy ${allAssignedServices.length - previousCount} dịch vụ mới được giao!`, 'success');
        } else if (showLoadingAlert) {
            showAlert('Làm mới danh sách dịch vụ đã giao thành công', 'success');
        }

        applyFiltersAndRender();

    } catch (error) {
        errorMessage.classList.remove("d-none");
        document.getElementById("errorText").textContent = error.message;
        console.error("Error loading assigned services:", error);

        if (showLoadingAlert) {
            showAlert('Không thể làm mới danh sách dịch vụ đã giao', 'danger');
        }
    }
}

// Auto refresh functions
function startAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    // Start auto refresh every 30 seconds
    autoRefreshInterval = setInterval(async () => {
        console.log('Auto-refreshing assigned services...');
        const previousCount = allAssignedServices.length;
        await fetchAndRenderServices(false); // Silent refresh

        // Check if there are new services
        if (allAssignedServices.length > previousCount) {
            const newCount = allAssignedServices.length - previousCount;
            showAlert(`🔔 Có ${newCount} dịch vụ mới được giao cho bạn!`, 'success');
        }
    }, AUTO_REFRESH_INTERVAL);

    console.log('Auto-refresh started for assigned services');
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        console.log('Auto-refresh stopped');
    }
}

function forceRefreshServices() {
    console.log('Force refreshing assigned services...');
    fetchAndRenderServices(true);

    // Hide new assignment notification
    const notificationEl = document.getElementById('newAssignmentNotification');
    if (notificationEl) {
        notificationEl.classList.add('d-none');
    }

    // Remove any dynamic refresh alerts
    const refreshAlert = document.querySelector('.alert-primary');
    if (refreshAlert && refreshAlert.textContent.includes('You may have new assigned services')) {
        refreshAlert.remove();
    }
}

// Debug function để test assigned services flow
async function debugAssignedServices() {
    console.log('=== DEBUGGING ASSIGNED SERVICES với DAO ===');

    try {
        // 1. Test API endpoint
        console.log('1. Testing getAssignedServices API...');
        const response = await fetch('/api/doctor/service-order?action=getAssignedServices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('API Response Status:', response.status);
        console.log('API URL:', '/api/doctor/service-order?action=getAssignedServices');

        if (!response.ok) {
            throw new Error('Lỗi API: ' + response.status);
        }

        const result = await response.json();
        console.log('2. Complete API Response:', result);

        if (result.success) {
            const services = result.data || [];
            console.log(`3. Found ${services.length} assigned services from DAO`);
            console.log('4. Raw services data:', services);

            if (services.length > 0) {
                console.log('5. Analyzing each service:');
                services.forEach((service, index) => {
                    console.log(`Service ${index + 1}:`, {
                        service_order_item_id: service.service_order_item_id,
                        service_name: service.service_name,
                        patient_name: service.patient_name,
                        doctor_id: service.doctor_id,
                        doctor_name: service.doctor_name,
                        order_date: service.order_date,
                        has_results: !!(service.result_description && service.result_description.trim()),
                        result_description: service.result_description
                    });
                });

                // Check for services with results vs pending
                const withResults = services.filter(s => s.result_description && s.result_description.trim() !== '');
                const pending = services.filter(s => !s.result_description || s.result_description.trim() === '');

                console.log(`6. Services status breakdown:`);
                console.log(`   - Completed (có kết quả): ${withResults.length}`);
                console.log(`   - Pending (chưa có kết quả): ${pending.length}`);

                if (pending.length > 0) {
                    console.log('7. Chi tiết services PENDING (chưa có kết quả):');
                    pending.forEach((service, index) => {
                        console.log(`   ${index + 1}. ${service.service_name} cho ${service.patient_name} (Item ID: ${service.service_order_item_id})`);
                    });
                }

                showAlert(`✅ Tìm thấy ${services.length} dịch vụ đã giao (${pending.length} chưa khám, ${withResults.length} đã khám)`, 'success');

                // Force re-render with debug data
                allAssignedServices = services;
                applyFiltersAndRender();

            } else {
                console.log('5. ❌ Không tìm thấy dịch vụ đã giao');
                console.log('   Có thể do:');
                console.log('   - Chưa có service order nào được assign cho doctor này');
                console.log('   - Doctor ID không đúng');
                console.log('   - Database chưa có data');
                showAlert('⚠️ Không tìm thấy dịch vụ đã giao. Hãy tạo service order và assign cho bác sĩ này.', 'warning');
            }
        } else {
            throw new Error('API trả về thành công=false');
        }

    } catch (error) {
        console.error('Debug Error:', error);
        showAlert(`❌ Debug Error: ${error.message}`, 'danger');
    }

    console.log('=== DEBUG COMPLETE ===');
}

// Function để bác sĩ thực hiện khám bệnh nhân đã được assigned
function performExamination(serviceOrderItemId, patientName, medicineRecordId) {
    console.log('Performing examination for:', {
        serviceOrderItemId,
        patientName,
        medicineRecordId
    });

    const service = allAssignedServices.find(s => s.service_order_item_id === serviceOrderItemId);
    if (!service) {
        showAlert('Service not found!', 'danger');
        return;
    }

    // Hiển thị thông tin khám
    const examInfo = `
        <div class="alert alert-info">
            <h6><i class="fas fa-stethoscope me-2"></i>Thông tin khám bệnh</h6>
            <p><strong>Bệnh nhân:</strong> ${patientName}</p>
            <p><strong>Dịch vụ:</strong> ${service.service_name}</p>
            <p><strong>Triệu chứng:</strong> ${service.symptoms || 'Chưa có thông tin'}</p>
            <p><strong>Chẩn đoán sơ bộ:</strong> ${service.preliminary_diagnosis || 'Chưa có thông tin'}</p>
            <hr>
            <p class="mb-0"><strong>Hướng dẫn:</strong> Thực hiện dịch vụ ${service.service_name} và nhập kết quả bằng nút "Enter Results"</p>
        </div>
    `;

    // Tạo modal thông tin khám
    const modalHtml = `
        <div class="modal fade" id="examModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-stethoscope me-2"></i>
                            Thực hiện khám - ${service.service_name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${examInfo}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Đóng
                        </button>
                        <button type="button" class="btn btn-primary" onclick="bootstrap.Modal.getInstance(document.getElementById('examModal')).hide(); openResultModal(${serviceOrderItemId})">
                            <i class="fas fa-edit me-2"></i>Nhập kết quả
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('examModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const examModal = new bootstrap.Modal(document.getElementById('examModal'));
    examModal.show();

    // Remove modal after closing
    document.getElementById('examModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });

    showAlert(`Bắt đầu thực hiện khám cho ${patientName}`, 'info');
}

// Alert function for assigned services page
function showAlert(message, type = 'info') {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container-assigned';
    alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        max-width: 400px;
    `;

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;
    document.body.appendChild(alertContainer);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.parentNode.removeChild(alertContainer);
        }
    }, 5000);
}

// Hàm tiện ích bỏ dấu tiếng Việt
function removeDiacritics(str) {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

function applyFiltersAndRender() {
    let servicesToRender = allAssignedServices;

    // 1. Filter by status
    if (currentStatusFilter !== 'all') {
        servicesToRender = allAssignedServices.filter(service => {
            const hasResults = service.result_description && service.result_description.trim() !== '';
            const status = hasResults ? 'completed' : 'pending';
            return status === currentStatusFilter;
        });
    }

    // 2. Filter by search term (case-insensitive and diacritic-insensitive)
    if (currentSearchTerm) {
        const normalizedSearchTerm = removeDiacritics(currentSearchTerm).toLowerCase();
        servicesToRender = servicesToRender.filter(service => {
            const normalizedPatientName = removeDiacritics(service.patient_name).toLowerCase();
            const normalizedServiceName = removeDiacritics(service.service_name).toLowerCase();

            return normalizedPatientName.includes(normalizedSearchTerm) ||
                   normalizedServiceName.includes(normalizedSearchTerm);
        });
    }

    filteredServices = servicesToRender;
    renderServices();
}

function renderServices() {
    const servicesList = document.getElementById("servicesList");
    const noServicesMessage = document.getElementById("noServicesMessage");
    const servicesSummary = document.getElementById("servicesSummary");

    servicesList.innerHTML = '';

    if (filteredServices.length === 0) {
        servicesList.style.display = "none";
        noServicesMessage.classList.remove("d-none");
        if (servicesSummary) servicesSummary.classList.add("d-none");
        return;
    }

    // Update services summary
    updateServicesSummary();

    servicesList.style.display = "flex";
    noServicesMessage.classList.add("d-none");
    if (servicesSummary) servicesSummary.classList.remove("d-none");

    filteredServices.forEach((service, index) => {
        const hasResults = service.result_description && service.result_description.trim() !== '';
        const status = hasResults ? 'completed' : 'pending';
        const statusInfo = {
            'pending': { text: 'Pending', class: 'warning', icon: 'fas fa-clock' },
            'completed': { text: 'Completed', class: 'success', icon: 'fas fa-check-circle' }
        };

        const serviceCard = document.createElement("div");
        serviceCard.className = "col-xl-6 col-lg-12 mb-4";

        const cardId = `service-card-${service.service_order_item_id}`;

        serviceCard.innerHTML = `
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-flask me-2 text-primary"></i>
                        ${service.service_name || 'Unnamed Service'}
                    </h5>
                    <span class="badge bg-${statusInfo[status].class}">
                        <i class="${statusInfo[status].icon} me-1"></i>
                        ${statusInfo[status].text}
                    </span>
                </div>
                <div class="card-body">
                     <div class="mb-3">
                        <h6 class="text-primary"><i class="fas fa-user me-2"></i>Patient Information</h6>
                        <p class="mb-2"><strong>Name:</strong> ${service.patient_name || 'N/A'}</p>
                        <p class="mb-2"><strong>Order Date:</strong> ${formatDateTime(service.order_date)}</p>
                        <p class="mb-0"><strong>Service Price:</strong> ${(service.service_price || 0).toLocaleString()} VND</p>
                    </div>
                    
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab-${cardId}" role="tablist">
                            <button class="nav-link active" id="nav-exam-tab-${cardId}" data-bs-toggle="tab" data-bs-target="#nav-exam-${cardId}" type="button" role="tab">
                                <i class="fas fa-stethoscope me-1"></i>Exam Info
                            </button>
                            <button class="nav-link" id="nav-result-tab-${cardId}" data-bs-toggle="tab" data-bs-target="#nav-result-${cardId}" type="button" role="tab">
                                <i class="fas fa-clipboard-check me-1"></i>Results
                            </button>
                        </div>
                    </nav>
                    <div class="tab-content pt-3" id="nav-tabContent-${cardId}">
                        <div class="tab-pane fade show active" id="nav-exam-${cardId}" role="tabpanel">
                            <h6><i class="fas fa-stethoscope me-2"></i>Examination Details</h6>
                            <div class="alert alert-light">
                                <p class="mb-2"><strong>Symptoms:</strong><br>${service.symptoms || 'Not provided'}</p>
                                <p class="mb-0"><strong>Preliminary Diagnosis:</strong><br>${service.preliminary_diagnosis || 'Not provided'}</p>
                            </div>
                            <p class="text-muted small"><strong>Service Description:</strong> ${service.service_description || 'No description available'}</p>
                        </div>
                        <div class="tab-pane fade" id="nav-result-${cardId}" role="tabpanel">
                             <h6><i class="fas fa-clipboard-check me-2"></i>Test Results</h6>
                             <div id="result-display-${service.service_order_item_id}">
                                <!-- Result content will be rendered here -->
                             </div>
                             <button class="btn btn-${hasResults ? 'success' : 'primary'} btn-lg w-100 mt-3" onclick="openResultModal(${service.service_order_item_id})">
                                <i class="fas fa-${hasResults ? 'edit' : 'plus'} me-2"></i>
                                ${hasResults ? 'Update Results' : 'Enter Results'}
                             </button>
                        </div>
                    </div>
                </div>
                <div class="card-footer text-muted small">
                    <i class="fas fa-info-circle me-1"></i>
                    Service Order Item ID: ${service.service_order_item_id} | 
                    Assigned to: ${service.doctor_name || 'You'}
                </div>
            </div>
        `;

        servicesList.appendChild(serviceCard);
        renderResultDisplay(service.service_order_item_id);
    });
}

// Update services summary statistics
function updateServicesSummary() {
    const total = allAssignedServices.length;
    const completed = allAssignedServices.filter(s => s.result_description && s.result_description.trim() !== '').length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Safe element updates with null checks
    const totalEl = document.getElementById('totalServices');
    const pendingEl = document.getElementById('pendingServices');
    const completedEl = document.getElementById('completedServices');
    const completionRateEl = document.getElementById('completionRate');

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (completedEl) completedEl.textContent = completed;
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
}

function renderResultDisplay(serviceOrderItemId) {
    const service = allAssignedServices.find(s => s.service_order_item_id === serviceOrderItemId);
    const resultContainer = document.getElementById(`result-display-${serviceOrderItemId}`);

    if (!resultContainer) return;

    if (service && service.result_description) {
        const lines = service.result_description.split('\\n');
        let resultHtml = '<div class="alert alert-success">';
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                resultHtml += `
                   <p class="mb-2"><strong>${key.trim()}:</strong> ${value}</p>`;
            }
        });
        resultHtml += '</div>';

        if (service.result_date) {
            resultHtml += `<p class="text-muted small"><i class="fas fa-clock me-1"></i>Results entered: ${formatDateTime(service.result_date)}</p>`;
        }

        resultContainer.innerHTML = resultHtml;
    } else {
        resultContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>No results entered yet</strong>
                <p class="mb-0 mt-2">Please perform the test and enter the results by clicking the button below.</p>
            </div>
        `;
    }
}

function openResultModal(serviceOrderItemId) {
    const service = allAssignedServices.find(s => s.service_order_item_id === serviceOrderItemId);
    if (!service) {
        showAlert('Service not found. Please refresh the page.', 'danger');
        return;
    }

    console.log('Opening result modal for service:', service);

    // Update modal title based on whether updating or creating
    const hasResults = service.result_description && service.result_description.trim() !== '';
    const modalTitle = document.querySelector('#resultModal .modal-title');
    modalTitle.innerHTML = `
        <i class="fas fa-flask me-2"></i>
        ${hasResults ? 'Update' : 'Enter'} Test Results - ${service.service_name}
    `;

    // Set form values
    document.getElementById("serviceOrderItemId").value = service.service_order_item_id;
    document.getElementById("modalServiceName").value = service.service_name || '';
    document.getElementById("modalPatientName").value = service.patient_name || '';

    // Reset form fields first
    document.getElementById("testResults").value = '';
    document.getElementById("conclusion").value = '';
    document.getElementById("resultStatus").value = '';

    // Load existing results into form if available
    if (hasResults) {
        const lines = service.result_description.split('\\n');
        lines.forEach(line => {
            if (line.startsWith('Test Results:')) {
                document.getElementById("testResults").value = line.replace('Test Results:', '').trim();
            } else if (line.startsWith('Conclusion:')) {
                document.getElementById("conclusion").value = line.replace('Conclusion:', '').trim();
            } else if (line.startsWith('Status:')) {
                document.getElementById("resultStatus").value = line.replace('Status:', '').trim();
            }
        });

        showAlert('Existing results loaded for editing', 'info');
    }

    // Update save button text
    const saveButton = document.querySelector('#resultModal .btn-primary');
    saveButton.innerHTML = `<i class="fas fa-save me-2"></i>${hasResults ? 'Update' : 'Save'} Results`;

    const resultModal = new bootstrap.Modal(document.getElementById("resultModal"));
    resultModal.show();

    // Focus on test results field
    setTimeout(() => {
        document.getElementById("testResults").focus();
    }, 300);
}

async function saveTestResult() {
    const saveButton = document.querySelector('#resultModal .btn-primary');
    const form = document.getElementById('resultForm');

    try {
        // Validation
        const serviceOrderItemId = document.getElementById("serviceOrderItemId").value;
        const testResults = document.getElementById("testResults").value;
        const conclusion = document.getElementById("conclusion").value;
        const resultStatus = document.getElementById("resultStatus").value;

        console.log('Saving test result for service order item:', serviceOrderItemId);

        if (!serviceOrderItemId || !testResults.trim() || !resultStatus) {
            showAlert('Vui lòng điền đầy đủ các trường bắt buộc: Kết quả xét nghiệm và Trạng thái.', 'danger');
            return;
        }

        if (testResults.trim().length < 10) {
            showAlert('Kết quả xét nghiệm phải có ít nhất 10 ký tự.', 'warning');
            return;
        }

        // UI feedback
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        form.style.opacity = '0.7';

        const requestData = {
            serviceOrderItemId: parseInt(serviceOrderItemId),
            testResults: testResults.trim(),
            conclusion: conclusion.trim(),
            resultStatus: resultStatus
        };

        console.log('Request data:', requestData);

        const response = await fetch('/api/doctor/service-result', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Save result:', result);

        if (result.success) {
            showAlert('Lưu kết quả xét nghiệm thành công!', 'success');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("resultModal"));
            modal.hide();

            // Refresh the services list to show updated status
            await fetchAndRenderServices(true);

            // Clear form for next use
            form.reset();

        } else {
            throw new Error(result.message || 'Không thể lưu kết quả xét nghiệm');
        }

    } catch (error) {
        console.error("Error saving test result:", error);
        showAlert(`❌ Không thể lưu kết quả xét nghiệm: ${error.message}`, 'danger');
    } finally {
        // Reset UI
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Results';
        form.style.opacity = '1';
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.main-content .container-fluid');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';

    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
        window.location.href = '../index.html';
    }
}