let serviceResultsList = [];
let currentMedicineRecordId = null;

// Hàm khởi tạo trang
async function initializeServiceResultsPage() {
    try {
        console.log('Initializing Service Results Page...');

        // Load danh sách waitlist có visittype = Result
        await loadServiceResults();

        console.log('Service Results Page initialized successfully');

    } catch (error) {
        console.error("Error initializing service results page:", error);

        // Hiển thị interface với thông báo friendly
        showAlert('Welcome to Service Results Management. Click "Load Results" to start.', 'info');

        // Ẩn loading spinner nếu có lỗi
        const loadingSpinner = document.getElementById("loadingSpinner");
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }

        // Hiển thị demo data hoặc empty state
        displayEmptyState();
    }
}

// Hàm load danh sách service results của bác sĩ hiện tại
async function loadServiceResults() {
    const loadingSpinner = document.getElementById("loadingSpinner");
    const tableContainer = document.getElementById("resultsTableContainer");

    try {
        console.log('Loading service results for current doctor...');

        // Hiển thị loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = "flex";
        }
        if (tableContainer) {
            tableContainer.style.display = "none";
        }

        // Bước 1: Lấy service orders của bác sĩ hiện tại
        const serviceOrdersResponse = await fetch('/api/doctor/service-order?action=getMyServiceOrders', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('My Service Orders Response status:', serviceOrdersResponse.status);

        if (!serviceOrdersResponse.ok) {
            throw new Error(`HTTP ${serviceOrdersResponse.status}: Failed to fetch my service orders`);
        }

        const serviceOrdersData = await serviceOrdersResponse.json();
        console.log('My Service Orders Response:', serviceOrdersData);

        if (!serviceOrdersData.success) {
            throw new Error(serviceOrdersData.message || 'Failed to load my service orders');
        }

        const myServiceOrders = serviceOrdersData.data;
        if (!myServiceOrders || myServiceOrders.length === 0) {
            showAlert('You have not prescribed any tests yet.', 'info');
            if (loadingSpinner) {
                loadingSpinner.style.display = "none";
            }
            if (tableContainer) {
                tableContainer.style.display = "none";
            }
            displayEmptyState();
            return;
        }

        console.log(`Found ${myServiceOrders.length} service orders prescribed by you`);

        // Bước 2: Với mỗi service order, lấy progress kết quả xét nghiệm
        const patientTestResults = [];
        
        for (const serviceOrder of myServiceOrders) {
            try {
                // Lấy progress của service order này
                const progressResponse = await fetch(`/api/doctor/service-results?action=getResultProgress&serviceOrderId=${serviceOrder.service_order_id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData.success) {
                        // Tạo object kết hợp thông tin bệnh nhân và kết quả xét nghiệm
                        const patientResult = {
                            service_order_id: serviceOrder.service_order_id,
                            patient_name: serviceOrder.patient_name,
                            patient_id: serviceOrder.patient_id || 'N/A',
                            order_date: serviceOrder.order_date,
                            medicineRecord_id: serviceOrder.medicineRecord_id,
                            doctor_name: serviceOrder.doctor_name, // bác sĩ chỉ định
                            
                            // Thông tin kết quả xét nghiệm (có thể do bác sĩ khác thực hiện)
                            total_tests: progressData.data.total_services,
                            completed_tests: progressData.data.completed_services,
                            pending_tests: progressData.data.total_services - progressData.data.completed_services,
                            progress_percentage: progressData.data.progress_percentage,
                            is_complete: progressData.data.is_complete
                        };
                        patientTestResults.push(patientResult);
                    }
                }
            } catch (err) {
                console.warn(`Failed to get test progress for service order ${serviceOrder.service_order_id}:`, err.message);
            }
        }

        // Ẩn loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }

        if (patientTestResults.length === 0) {
            showAlert('No test results found for your prescribed orders.', 'info');
            if (tableContainer) {
                tableContainer.style.display = "none";
            }
            displayEmptyState();
            return;
        }

        serviceResultsList = patientTestResults;
        
        // Lưu vào global variable để có thể truy cập cho print
        window.currentWaitlistData = patientTestResults;
        
        if (tableContainer) {
            tableContainer.style.display = "block";
        }
        renderServiceResultsTable();

        // Thống kê
        const completeCount = patientTestResults.filter(r => r.is_complete).length;
        const pendingCount = patientTestResults.length - completeCount;
        const totalTests = patientTestResults.reduce((sum, r) => sum + r.total_tests, 0);
        const completedTests = patientTestResults.reduce((sum, r) => sum + r.completed_tests, 0);
        
        showAlert(`Loaded ${patientTestResults.length} patient(s) with your prescribed tests: ${completedTests}/${totalTests} tests completed (${completeCount} patients finished, ${pendingCount} pending)`, 'success');

    } catch (error) {
        console.error("Error loading service results:", error);
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }
        if (tableContainer) {
            tableContainer.style.display = "none";
        }
        showAlert(`Failed to load service results: ${error.message}`, 'danger');
    }
}

// Hàm render bảng service results
function renderServiceResultsTable() {
    const tableBody = document.getElementById("resultsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = '';

    serviceResultsList.forEach((result, index) => {
        const progressPercentage = result.progress_percentage || 0;
        const isComplete = result.is_complete || false;

        const row = document.createElement("tr");
        row.className = "service-result-row";

        // Determine progress status and color
        let progressStatus = '';
        let progressClass = '';
        let progressText = '';
        
        if (isComplete) {
            progressStatus = 'All Tests Complete';
            progressClass = 'progress-complete';
            progressText = '100%';
        } else if (progressPercentage > 0) {
            progressStatus = 'Tests In Progress';
            progressClass = 'progress-loading';
            progressText = `${progressPercentage}%`;
        } else {
            progressStatus = 'Tests Pending';
            progressClass = 'progress-pending';
            progressText = '0%';
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="patient-info">
                    <div class="patient-name"><i class="fas fa-user me-2"></i>${result.patient_name || 'N/A'}</div>
                    <div class="patient-details">
                        Patient ID: ${result.patient_id || 'N/A'} | 
                        Prescribed by: You
                    </div>
                </div>
            </td>
            <td><i class="fas fa-file-medical me-2"></i>Order #${result.service_order_id || 'N/A'}</td>
            <td><i class="fas fa-calendar-plus me-2"></i>${formatDate(result.order_date)}</td>
            <td>
                <div class="result-progress ${progressClass}">
                    <div class="progress-bar-custom">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">${progressText}</div>
                </div>
                <small class="text-muted">
                    <i class="fas fa-flask me-1"></i>
                    ${result.completed_tests || 0}/${result.total_tests || 0} tests completed
                    ${result.pending_tests > 0 ? ` | ${result.pending_tests} pending` : ''}
                </small>
            </td>
            <td>
                <span class="status-badge ${isComplete ? 'status-complete' : (progressPercentage > 0 ? 'status-loading' : 'status-pending')}">
                    <i class="fas fa-${isComplete ? 'check-circle' : (progressPercentage > 0 ? 'clock' : 'hourglass-start')} me-1"></i>
                    ${progressStatus}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-info btn-sm view-detailed-results-btn" 
                            data-service-order-id="${result.service_order_id}" 
                            data-medicine-record-id="${result.medicineRecord_id}">
                        <i class="fas fa-microscope me-1"></i>View This Order
                    </button>
                    <button class="btn btn-success btn-sm view-all-results-btn" 
                            data-medicine-record-id="${result.medicineRecord_id}">
                        <i class="fas fa-list-ul me-1"></i>View All Results
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Add event listeners
    addEventListeners();
}

// Hàm thêm event listeners
function addEventListeners() {
    const tableBody = document.getElementById("resultsTableBody");
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            // Xử lý nút view detailed results cho một service order cụ thể
            const viewBtn = e.target.closest('.view-detailed-results-btn');
            if (viewBtn) {
                const serviceOrderId = viewBtn.getAttribute('data-service-order-id');
                const medicineRecordId = viewBtn.getAttribute('data-medicine-record-id');
                console.log('View detailed results clicked:', { serviceOrderId, medicineRecordId });
                viewDetailedResults(medicineRecordId, serviceOrderId);
                return;
            }
            
            // Xử lý nút view all results cho tất cả service orders của bệnh nhân
            const viewAllBtn = e.target.closest('.view-all-results-btn');
            if (viewAllBtn) {
                const medicineRecordId = viewAllBtn.getAttribute('data-medicine-record-id');
                console.log('View all results clicked for medicine record:', medicineRecordId);
                viewDetailedResults(medicineRecordId, null); // Truyền null cho serviceOrderId để lấy tất cả
                return;
            }
        });
    }
}

// Hàm xem chi tiết kết quả
async function viewDetailedResults(medicineRecordId, serviceOrderId) {
    try {
        console.log('Loading detailed results for medicine record:', medicineRecordId, 'service order:', serviceOrderId);
        
        // Lưu medicine record ID hiện tại
        currentMedicineRecordId = medicineRecordId;
        
        // Xây dựng URL với các tham số phù hợp
        let apiUrl = `/api/doctor/service-results?action=getDetailedResults`;
        if (serviceOrderId) {
            // Nếu có serviceOrderId, chỉ lấy kết quả của service order này
            apiUrl += `&serviceOrderId=${serviceOrderId}`;
        } else if (medicineRecordId) {
            // Nếu không có serviceOrderId, lấy tất cả kết quả của medicine record
            apiUrl += `&medicineRecordId=${medicineRecordId}`;
        }
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get detailed results');
        }

        const responseData = await response.json();
        console.log('Detailed results data:', responseData);

        if (!responseData.success) {
            throw new Error(responseData.message);
        }

        // Hiển thị detailed results section
        displayDetailedResults(responseData.data, serviceOrderId);

    } catch (error) {
        console.error("Error viewing detailed results:", error);
        showAlert(`Failed to view detailed results: ${error.message}`, 'danger');
    }
}

// Hàm hiển thị chi tiết kết quả xét nghiệm
function displayDetailedResults(detailedResults, serviceOrderId) {
    const detailedSection = document.getElementById("detailedResultsSection");
    const detailedContent = document.getElementById("detailedResultsContent");
    
    if (!detailedSection || !detailedContent) return;

    // Lưu data vào global variable để sử dụng cho print
    window.currentDetailedResultsData = detailedResults;

    // Hiển thị section
    detailedSection.style.display = "block";
    detailedSection.scrollIntoView({ behavior: 'smooth' });

    // Group results by service order
    const groupedResults = {};
    detailedResults.forEach(result => {
        const orderId = result.service_order_id;
        if (!groupedResults[orderId]) {
            groupedResults[orderId] = {
                order_id: orderId,
                order_date: result.order_date,
                results: []
            };
        }
        groupedResults[orderId].results.push(result);
    });

    // Tạo tiêu đề phù hợp
    const isViewingSpecificOrder = serviceOrderId !== null && serviceOrderId !== undefined;
    const orderCount = Object.keys(groupedResults).length;
    const totalTests = detailedResults.length;
    
    let headerHTML = '';
    if (isViewingSpecificOrder) {
        headerHTML = `
            <div class="results-header mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="text-primary">
                            <i class="fas fa-microscope me-2"></i>Service Order #${serviceOrderId} Results
                        </h4>
                        <p class="text-muted mb-0">Detailed test results for this specific service order</p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-info fs-6">${totalTests} Test${totalTests > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        headerHTML = `
            <div class="results-header mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="text-success">
                            <i class="fas fa-list-ul me-2"></i>All Patient Results
                        </h4>
                        <p class="text-muted mb-0">Complete medical test history for this patient</p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary fs-6 me-2">${orderCount} Order${orderCount > 1 ? 's' : ''}</span>
                        <span class="badge bg-info fs-6">${totalTests} Test${totalTests > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `;
    }

    let contentHTML = headerHTML;
    
    Object.values(groupedResults).forEach(orderGroup => {
        const completedCount = orderGroup.results.filter(r => r.is_completed).length;
        const totalCount = orderGroup.results.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        // Calculate total cost
        const totalCost = orderGroup.results.reduce((sum, r) => sum + (r.service_price || 0), 0);
        
        contentHTML += `
            <div class="order-group-card mb-4">
                <!-- Order Header -->
                <div class="order-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="order-info">
                            <h5><i class="fas fa-file-medical me-2 text-primary"></i>Service Order #${orderGroup.order_id}</h5>
                            <div class="order-meta">
                                <span class="badge bg-light text-dark me-2">
                                    <i class="fas fa-calendar me-1"></i>${formatDate(orderGroup.order_date)}
                                </span>
                                <span class="badge bg-light text-dark me-2">
                                    <i class="fas fa-flask me-1"></i>${totalCount} Test${totalCount > 1 ? 's' : ''}
                                </span>
                                <span class="badge bg-light text-dark">
                                    <i class="fas fa-dollar-sign me-1"></i>${totalCost.toLocaleString()} VND
                                </span>
                            </div>
                        </div>
                        <div class="order-progress-badge">
                            <div class="progress-circle ${progressPercentage === 100 ? 'complete' : (progressPercentage > 0 ? 'partial' : 'pending')}">
                                <span class="progress-text">${progressPercentage}%</span>
                            </div>
                            <small class="progress-label">
                                ${progressPercentage === 100 ? 'Complete' : (progressPercentage > 0 ? 'In Progress' : 'Pending')}
                            </small>
                        </div>
                    </div>
                </div>
                
                <!-- Tests Grid -->
                <div class="tests-grid">
        `;
        
        orderGroup.results.forEach((result, index) => {
            const isCompleted = result.is_completed;
            const statusIcon = isCompleted ? 'check-circle' : 'clock';
            const statusColor = isCompleted ? 'success' : 'warning';
            const statusText = isCompleted ? 'Result Available' : 'Awaiting Results';
            
            contentHTML += `
                <div class="test-card ${isCompleted ? 'completed' : 'pending'}" data-service-order-item-id="${result.service_order_item_id}">
                    <!-- Test Header -->
                    <div class="test-header">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="test-info flex-grow-1">
                                <h6 class="test-name">
                                    <i class="fas fa-vial me-2 text-info"></i>
                                    ${result.service_name}
                                </h6>
                                <p class="test-description">${result.service_description || 'No description available'}</p>
                                
                                <div class="test-meta">
                                    <div class="meta-item">
                                        <i class="fas fa-user-md me-1 text-muted"></i>
                                        <small class="text-muted">Assigned Doctor: ${result.doctor_name || 'Not assigned'}</small>
                                    </div>
                                    <div class="meta-item">
                                        <i class="fas fa-money-bill me-1 text-muted"></i>
                                        <small class="text-muted">Cost: ${(result.service_price || 0).toLocaleString()} VND</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="test-status">
                                <span class="status-badge badge-${statusColor}">
                                    <i class="fas fa-${statusIcon} me-1"></i>
                                    ${statusText}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Test Content -->
                    <div class="test-content">
                        ${isCompleted ? `
                            <!-- Completed Result Display -->
                            <div class="result-display" id="result-display-${result.service_order_item_id}">
                                <div class="result-header">
                                    <h6 class="result-title">
                                        <i class="fas fa-microscope me-2 text-success"></i>
                                        Test Results
                                    </h6>
                                    <div class="result-date">
                                        <i class="fas fa-clock me-1 text-muted"></i>
                                        <small class="text-muted">Completed: ${formatDateTime(result.result_date)}</small>
                                    </div>
                                </div>
                                
                                <div class="result-content-box">
                                    <div class="result-text">
                                        ${result.result_description}
                                    </div>
                                </div>
                                
                                <div class="result-actions mt-3">
                                    <button class="btn btn-outline-secondary btn-sm print-result-btn" data-service-order-item-id="${result.service_order_item_id}">
                                        <i class="fas fa-print me-1"></i>Print
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <!-- Pending Result (Read-Only) -->
                            <div class="pending-result-display">
                                <div class="pending-header">
                                    <h6><i class="fas fa-hourglass-half me-2 text-warning"></i>Awaiting Test Results</h6>
                                    <p class="pending-note">This test is currently pending. Results will appear here once available.</p>
                                </div>
                                
                                <div class="pending-content">
                                    <div class="text-center py-4">
                                        <i class="fas fa-clock fa-2x text-muted mb-2"></i>
                                        <p class="text-muted">Test results are not yet available</p>
                                        <small class="text-muted">Please check back later for updated results</small>
                                    </div>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        });
        
        contentHTML += `
                </div>
            </div>
        `;
    });

    if (contentHTML === '') {
        contentHTML = `
            <div class="no-results-state">
                <div class="text-center py-5">
                    <i class="fas fa-vials fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No Test Results Found</h5>
                    <p class="text-muted">There are no test results available for this patient.</p>
                </div>
            </div>
        `;
    }

    detailedContent.innerHTML = contentHTML;
    
    // Add event listeners for all interactions
    addResultEditListeners();
}

// Hàm thêm event listeners cho read-only buttons (chỉ print)
function addResultEditListeners() {
    const detailedContent = document.getElementById("detailedResultsContent");
    if (!detailedContent) return;

    // Event delegation chỉ cho print button
    detailedContent.addEventListener('click', function(e) {
        // Event listener cho print button
        const printBtn = e.target.closest('.print-result-btn');
        if (printBtn) {
            const serviceOrderItemId = printBtn.getAttribute('data-service-order-item-id');
            printResult(serviceOrderItemId);
            return;
        }
    });
}

// Hàm hiển thị form edit (DISABLED - READ-ONLY MODE)
function showEditForm(serviceOrderItemId) {
    showAlert('This page is in read-only mode. Editing is not allowed.', 'info');
    return;
}

// Hàm ẩn form edit (DISABLED - READ-ONLY MODE)
function hideEditForm(serviceOrderItemId) {
    // Disabled for read-only mode
    return;
}

// Hàm lưu kết quả (DISABLED - READ-ONLY MODE)
async function saveResult(serviceOrderItemId) {
    showAlert('This page is in read-only mode. Saving results is not allowed.', 'info');
    return;
}

// Hàm lưu draft result (DISABLED - READ-ONLY MODE)
async function saveDraft(serviceOrderItemId) {
    showAlert('This page is in read-only mode. Saving drafts is not allowed.', 'info');
    return;
}

// Hàm load draft khi editing (DISABLED - READ-ONLY MODE)
function loadDraft(serviceOrderItemId) {
    // Disabled for read-only mode
    return;
}

// Hàm clear draft sau khi save thành công (DISABLED - READ-ONLY MODE)
function clearDraft(serviceOrderItemId) {
    // Disabled for read-only mode
    return;
}

// Hàm lấy medicine record ID hiện tại
function getCurrentMedicineRecordId() {
    return currentMedicineRecordId;
}

// Hàm hiển thị empty state
function displayEmptyState() {
    const tableBody = document.getElementById("resultsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="empty-state">
                    <i class="fas fa-vials fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No Test Results Available</h5>
                    <p class="text-muted">There are currently no patients waiting for test results.</p>
                    <button class="btn btn-primary" onclick="loadServiceResults()">
                        <i class="fas fa-refresh me-2"></i>Refresh
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Hàm refresh results
function refreshResults() {
    loadServiceResults();
}

// Utility functions
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'waiting':
            return 'status-waiting';
        case 'inprogress':
            return 'status-inprogress';
        case 'result':
            return 'status-result';
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

// Hàm hiển thị alert
function showAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) return;

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

// Statistics function
function showStatistics() {
    if (serviceResultsList.length === 0) {
        showAlert('No data available for statistics.', 'warning');
        return;
    }

    const completeCount = serviceResultsList.filter(r => r.is_complete).length;
    const pendingCount = serviceResultsList.length - completeCount;
    const totalServices = serviceResultsList.reduce((sum, r) => sum + (r.total_services || 0), 0);
    const completedServices = serviceResultsList.reduce((sum, r) => sum + (r.completed_services || 0), 0);

    const statsHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <h3 class="text-primary">${serviceResultsList.length}</h3>
                    <p class="mb-0">Total Patients</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <h3 class="text-success">${completeCount}</h3>
                    <p class="mb-0">Complete Results</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <h3 class="text-warning">${pendingCount}</h3>
                    <p class="mb-0">Pending Results</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <h3 class="text-info">${Math.round((completedServices / totalServices) * 100) || 0}%</h3>
                    <p class="mb-0">Overall Progress</p>
                </div>
            </div>
        </div>
    `;

    // Create modal or alert for statistics
    showAlert(`<div class="statistics-summary"><h6>Service Results Statistics</h6>${statsHTML}</div>`, 'info');
}

// Debug functions
function runDebugTests() {
    showAlert('Running debug tests...', 'info');
    console.log('Debug Tests Running...');

    console.log('Testing functions availability:');
    console.log('- loadServiceResults:', typeof loadServiceResults);
    console.log('- viewDetailedResults:', typeof viewDetailedResults);
    console.log('- displayDetailedResults:', typeof displayDetailedResults);
    console.log('- refreshResults:', typeof refreshResults);
    console.log('- showStatistics:', typeof showStatistics);
    
    console.log('Current service results list:', serviceResultsList);
}

// Test API function
async function testAPI() {
    showDebugOutput('Testing MY service orders API flow...');
    
    try {
        // Test 1: Get MY service orders (prescribed by current doctor)
        showDebugOutput('Step 1: Testing getMyServiceOrders...');
        const ordersResponse = await fetch('/api/doctor/service-order?action=getMyServiceOrders', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        showDebugOutput(`My Service Orders API Status: ${ordersResponse.status}`);
        
        if (!ordersResponse.ok) {
            showDebugOutput(`My Service Orders API Error: HTTP ${ordersResponse.status}`);
            return;
        }
        
        const ordersData = await ordersResponse.json();
        showDebugOutput(`My Service Orders Found: ${ordersData.data ? ordersData.data.length : 0}`);
        showDebugOutput(`Doctor ID: ${ordersData.doctorId || 'N/A'}`);
        
        if (ordersData.data && ordersData.data.length > 0) {
            // Test 2: Get progress for first service order
            const firstOrder = ordersData.data[0];
            showDebugOutput(`Step 2: Testing getResultProgress for my order ${firstOrder.service_order_id}...`);
            showDebugOutput(`Patient: ${firstOrder.patient_name || 'N/A'}`);
            showDebugOutput(`Order Date: ${firstOrder.order_date || 'N/A'}`);
            
            const progressResponse = await fetch(`/api/doctor/service-results?action=getResultProgress&serviceOrderId=${firstOrder.service_order_id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                showDebugOutput(`Progress API Response: ${JSON.stringify(progressData, null, 2)}`);
                
                if (progressData.success) {
                    showDebugOutput(`Tests Progress: ${progressData.data.completed_services}/${progressData.data.total_services} (${progressData.data.progress_percentage}%)`);
                    showDebugOutput(`Complete Status: ${progressData.data.is_complete}`);
                }
            } else {
                showDebugOutput(`Progress API Error: HTTP ${progressResponse.status}`);
            }
            
            // Test 3: Get detailed results if medicine record exists
            if (firstOrder.medicineRecord_id) {
                showDebugOutput(`Step 3: Testing getDetailedResults for medicine record ${firstOrder.medicineRecord_id}...`);
                
                const detailsResponse = await fetch(`/api/doctor/service-results?action=getDetailedResults&medicineRecordId=${firstOrder.medicineRecord_id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json();
                    showDebugOutput(`Detailed Results: Found ${detailsData.data ? detailsData.data.length : 0} test items`);
                } else {
                    showDebugOutput(`Detailed Results API Error: HTTP ${detailsResponse.status}`);
                }
            }
        } else {
            showDebugOutput('No service orders found for current doctor. You need to prescribe some tests first!');
        }
        
        showAlert('API test completed. Check debug output for details.', 'success');
        
    } catch (error) {
        showDebugOutput(`API Error: ${error.message}`);
        showAlert(`API Test Failed: ${error.message}`, 'danger');
    }
}

// Check debug info function
function checkDebugInfo() {
    const debugInfo = {
        'Current URL': window.location.href,
        'User Agent': navigator.userAgent,
        'Service Results Count': serviceResultsList.length,
        'Current Medicine Record ID': currentMedicineRecordId,
        'Available Endpoints': [
            '/api/doctor/service-order?action=getMyServiceOrders (NEW)',
            '/api/doctor/service-results?action=getResultProgress&serviceOrderId=X',
            '/api/doctor/service-results?action=getDetailedResults&medicineRecordId=X',
            '/api/doctor/service-results (POST) - updateResult'
        ],
        'DOM Elements': {
            'alertContainer': !!document.getElementById('alertContainer'),
            'resultsTableBody': !!document.getElementById('resultsTableBody'),
            'detailedResultsSection': !!document.getElementById('detailedResultsSection'),
            'loadingSpinner': !!document.getElementById('loadingSpinner')
        }
    };
    
    showDebugOutput(`Debug Information:\n${JSON.stringify(debugInfo, null, 2)}`);
    showAlert('Debug information displayed in debug output', 'info');
}

// Create test data function
async function createTestData() {
    showAlert('This would create test data in a real implementation', 'warning');
    
    const testDataInfo = {
        message: 'To create test data, you need to:',
        tables_needed: [
            'Patient - with patient records',
            'Doctor - with doctor records', 
            'ListOfMedicalService - with test services',
            'MedicineRecords - linking patients to doctors',
            'ServiceOrder - with medicineRecord_id',
            'ServiceOrderItem - with service_id and service_order_id',
            'ResultsOfParaclinicalServices - optional results'
        ],
        api_flow: [
            '1. Login as a Doctor',
            '2. Create patients, medical services in database',
            '3. Create MedicineRecords for patients',
            '4. Create ServiceOrder with doctor_id = current doctor',
            '5. Create ServiceOrderItem entries',
            '6. Test with /api/doctor/service-order?action=getMyServiceOrders',
            '7. Test with /api/doctor/service-results?action=getResultProgress&serviceOrderId=X',
            '8. Other doctors can add results via updateResult API'
        ],
        note: 'The key concept: Doctor A prescribes tests → Doctor B performs tests → Doctor A views results'
    };
    
    showDebugOutput(`Test Data Creation Guide:\n${JSON.stringify(testDataInfo, null, 2)}`);
}

// Show debug output function
function showDebugOutput(message) {
    const debugOutput = document.getElementById('debugOutput');
    const debugContent = document.getElementById('debugContent');
    
    if (debugOutput && debugContent) {
        debugOutput.style.display = 'block';
        const timestamp = new Date().toLocaleTimeString();
        debugContent.textContent += `[${timestamp}] ${message}\n`;
        debugContent.scrollTop = debugContent.scrollHeight;
    }
}

// Clear debug output
function clearDebugOutput() {
    const debugContent = document.getElementById('debugContent');
    if (debugContent) {
        debugContent.textContent = '';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Service Results Page');

    // Khởi tạo trang khi load
    try {
        initializeServiceResultsPage();
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        showAlert('Page loaded with some issues. Functions may still work.', 'warning');
    }

    // Event listener cho việc refresh
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            loadServiceResults();
        }
    });

    console.log('All event listeners set up successfully');
});

// Additional utility functions for enhanced UI
async function printResult(serviceOrderItemId) {
    try {
        // Lấy thông tin từ data hiện tại
        let serviceData = null;
        let patientData = null;
        
        // Tìm service data từ current detailed results
        if (window.currentDetailedResultsData) {
            serviceData = window.currentDetailedResultsData.find(item => 
                item.service_order_item_id == serviceOrderItemId
            );
        }
        
        // Lấy thông tin bệnh nhân từ current waitlist data
        if (window.currentWaitlistData && window.currentWaitlistData.length > 0) {
            const currentMedicineRecordId = getCurrentMedicineRecordId();
            const patientResult = window.currentWaitlistData.find(item => 
                item.medicineRecord_id == currentMedicineRecordId
            );
            
            if (patientResult) {
                patientData = {
                    full_name: patientResult.patient_name,
                    patient_id: patientResult.patient_id,
                    room_id: 'P5'
                };
            }
        }
        
        // Data mặc định nếu không tìm thấy
        if (!serviceData) {
            serviceData = {
                service_name: 'Xét nghiệm máu',
                result_description: 'Bình thường',
                doctor_name: 'BS. Xét nghiệm'
            };
        }
        
        if (!patientData) {
            patientData = {
                full_name: 'Nguyễn Văn A',
                patient_id: 'BN001',
                room_id: 'P5'
            };
        }
        
        createSimplePrintForm(serviceData, patientData);
        
    } catch (error) {
        console.error('Lỗi khi in:', error);
        showAlert('Lỗi khi in phiếu kết quả', 'error');
    }
}

// Tạo form in đơn giản
function createSimplePrintForm(serviceData, patientData) {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    // Nội dung form in đơn giản
    const printContent = `
        <div class="simple-print-form">
            <div class="form-header">
                <div class="hospital-info">
                    <div style="font-weight: bold;">SỞ Y TẾ THÀNH PHỐ HÀ NỘI</div>
                    <div>PHÒNG KHÁM ĐA KHOA KIVICARE</div>
                </div>
                <div class="patient-barcode">
                    <div style="border: 1px solid #000; padding: 5px;">
                        <div style="font-size: 12px;">Mã BN: ${patientData.patient_id}</div>
                    </div>
                </div>
            </div>
            
            <div class="form-title">
                <h2>PHIẾU KẾT QUẢ XÉT NGHIỆM</h2>
            </div>
            
            <div class="patient-info">
                <div>Họ tên người bệnh: ${patientData.full_name}</div>
                <div>Địa chỉ: Hà Nội</div>
                <div>Nơi chỉ định: Phòng ${patientData.room_id}</div>
                <div>Bác sĩ chỉ định: ${getPrescribingDoctorName()}</div>
                <div>Bác sĩ thực hiện: ${serviceData.doctor_name}</div>
            </div>
            
            <table class="results-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">STT</th>
                        <th style="width: 45%;">Yêu cầu</th>
                        <th style="width: 45%;">Kết quả</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: center;">1</td>
                        <td>${serviceData.service_name}</td>
                        <td>${serviceData.result_description}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="form-footer">
                <div style="text-align: right; margin-top: 30px;">
                    <div>Ngày ${day} tháng ${month} năm ${year}</div>
                    <div style="margin-top: 50px;">
                        <div style="font-weight: bold;">${serviceData.doctor_name}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Tạo CSS đơn giản cho in - Compact version
    const printStyles = `
        <style>
            .simple-print-form {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.3;
                max-width: 700px;
                margin: 0 auto;
                padding: 15px;
            }
            
            .form-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            
            .hospital-info {
                text-align: left;
                font-size: 11px;
            }
            
            .patient-barcode {
                text-align: right;
                font-size: 10px;
            }
            
            .form-title {
                text-align: center;
                margin: 15px 0 10px 0;
            }
            
            .form-title h2 {
                margin: 0;
                font-size: 16px;
                font-weight: bold;
            }
            
            .patient-info {
                margin: 15px 0;
                font-size: 11px;
            }
            
            .patient-info div {
                margin: 5px 0;
            }
            
            .results-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 11px;
            }
            
            .results-table th,
            .results-table td {
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
            }
            
            .results-table th {
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
                font-size: 10px;
            }
            
            .form-footer {
                margin-top: 20px;
                font-size: 11px;
            }
            
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .simple-print-form,
                .simple-print-form * {
                    visibility: visible;
                }
                
                .simple-print-form {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        </style>
    `;
    
    // Tạo cửa sổ in mới
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phiếu Kết Quả Xét Nghiệm</title>
            ${printStyles}
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Tự động in khi load xong
    printWindow.onload = function() {
        printWindow.print();
    };
}

// Lấy tên bác sĩ chỉ định
function getPrescribingDoctorName() {
    if (window.currentWaitlistData && window.currentWaitlistData.length > 0) {
        const currentMedicineRecordId = getCurrentMedicineRecordId();
        const prescribingInfo = window.currentWaitlistData.find(item => 
            item.medicineRecord_id == currentMedicineRecordId
        );
        
        if (prescribingInfo && prescribingInfo.doctor_name) {
            return prescribingInfo.doctor_name;
        }
    }
    
    return 'BS. Khám bệnh';
}

// Lấy bác sĩ chỉ định (tạo service order)
function getPrescribingDoctorFromData(serviceData, patientData) {
    // Bác sĩ chỉ định là người tạo service order
    // Lấy từ current waitlist data (chứa thông tin prescribing doctor)
    if (window.currentWaitlistData && window.currentWaitlistData.length > 0) {
        const currentMedicineRecordId = getCurrentMedicineRecordId();
        const prescribingInfo = window.currentWaitlistData.find(item => 
            item.medicineRecord_id == currentMedicineRecordId
        );
        
        if (prescribingInfo && prescribingInfo.doctor_name) {
            return prescribingInfo.doctor_name;
        }
    }
    
    // Fallback: nếu không tìm thấy thông tin prescribing doctor
    return 'BS. Khám bệnh';
}

// Tạo phiếu kết quả xét nghiệm theo format chuẩn
function createMedicalTestReport(serviceData, patientData) {
    // Gọi hàm đơn giản thay thế
    createSimplePrintForm(serviceData, patientData);
}

// Thêm styles cho in - Version đẹp
function addPrintStyles() {
    // Không cần function này nữa vì đã đơn giản hóa
    return;
}

// Export functions to window
window.initializeServiceResultsPage = initializeServiceResultsPage;
window.loadServiceResults = loadServiceResults;
window.viewDetailedResults = viewDetailedResults;
window.displayDetailedResults = displayDetailedResults;
window.refreshResults = refreshResults;
window.showStatistics = showStatistics;
window.runDebugTests = runDebugTests;
window.showAlert = showAlert;
window.displayEmptyState = displayEmptyState;
window.saveResult = saveResult;
window.showEditForm = showEditForm;
window.hideEditForm = hideEditForm;
window.testAPI = testAPI;
window.checkDebugInfo = checkDebugInfo;
window.createTestData = createTestData;
window.showDebugOutput = showDebugOutput;
window.clearDebugOutput = clearDebugOutput;
window.printResult = printResult;
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.clearDraft = clearDraft;
window.getPrescribingDoctorFromData = getPrescribingDoctorFromData;

// Enhanced CSS Styles for detailed test results view
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    /* Enhanced Test Results Styles */
    .order-group-card {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid #e8ecef;
        margin-bottom: 30px;
        transition: all 0.3s ease;
    }
    
    .order-group-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    
    .order-header {
        background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
        padding: 25px;
        border-bottom: 1px solid #e8ecef;
    }
    
    .order-info h5 {
        color: #2c3e50;
        font-weight: 700;
        margin-bottom: 15px;
    }
    
    .order-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .order-meta .badge {
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: 500;
        border: 1px solid #dee2e6;
    }
    
    .order-progress-badge {
        text-align: center;
    }
    
    .progress-circle {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px;
        position: relative;
        border: 4px solid #e9ecef;
        font-weight: 700;
    }
    
    .progress-circle.complete {
        border-color: #28a745;
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        color: #155724;
    }
    
    .progress-circle.partial {
        border-color: #ffc107;
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        color: #856404;
    }
    
    .progress-circle.pending {
        border-color: #6c757d;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #495057;
    }
    
    .progress-text {
        font-weight: 700;
        font-size: 14px;
    }
    
    .progress-label {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.75em;
    }
    
    .tests-grid {
        padding: 25px;
        display: grid;
        gap: 20px;
    }
    
    .test-card {
        background: #fff;
        border-radius: 15px;
        border: 1px solid #e8ecef;
        overflow: hidden;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .test-card.completed {
        border-left: 5px solid #28a745;
        background: linear-gradient(135deg, #f8fff9 0%, #f0f9f0 100%);
    }
    
    .test-card.pending {
        border-left: 5px solid #ffc107;
        background: linear-gradient(135deg, #fffcf5 0%, #fff8e1 100%);
    }
    
    .test-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }
    
    .test-header {
        padding: 20px;
        border-bottom: 1px solid #f0f2f5;
    }
    
    .test-name {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
    }
    
    .test-description {
        color: #6c757d;
        font-size: 0.9em;
        line-height: 1.5;
        margin-bottom: 15px;
    }
    
    .test-meta {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .meta-item {
        display: flex;
        align-items: center;
        font-size: 0.85em;
    }
    
    .test-status {
        text-align: right;
    }
    
    .status-badge {
        padding: 8px 15px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.85em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: inline-flex;
        align-items: center;
    }
    
    .badge-success {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
    }
    
    .badge-warning {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
        color: #212529;
    }
    
    .test-content {
        padding: 20px;
    }
    
    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    
    .result-title {
        color: #2c3e50;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
    }
    
    .result-date {
        text-align: right;
    }
    
    .result-content-box {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        border-left: 4px solid #28a745;
        margin: 15px 0;
    }
    
    .result-text {
        line-height: 1.6;
        color: #495057;
        white-space: pre-wrap;
    }
    
    .result-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .pending-result-form {
        background: #fff9e6;
        border-radius: 10px;
        padding: 20px;
        border-left: 4px solid #ffc107;
    }
    
    .pending-header h6 {
        color: #856404;
        font-weight: 600;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    }
    
    .pending-note {
        color: #6c757d;
        font-size: 0.9em;
        margin-bottom: 20px;
    }
    
    .edit-header h6 {
        color: #495057;
        font-weight: 600;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
    }
    
    .result-textarea {
        border-radius: 10px;
        border: 2px solid #e9ecef;
        padding: 15px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        resize: vertical;
        transition: border-color 0.3s ease;
        min-height: 120px;
    }
    
    .result-textarea:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        outline: none;
    }
    
    .form-actions, .edit-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .no-results-state {
        padding: 40px;
        text-align: center;
        background: white;
        border-radius: 15px;
        margin: 20px;
    }
    
    /* Enhanced button styles */
    .btn-outline-secondary:hover {
        background-color: #6c757d;
        border-color: #6c757d;
    }
    
    .btn-outline-info {
        color: #17a2b8;
        border-color: #17a2b8;
    }
    
    .btn-outline-info:hover {
        background-color: #17a2b8;
        border-color: #17a2b8;
        color: white;
    }
    
    /* Smooth animations */
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .order-group-card {
        animation: slideIn 0.6s ease-out;
    }
    
    .test-card {
        animation: slideIn 0.4s ease-out;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .order-header {
            padding: 15px;
        }
        
        .order-header .d-flex {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 15px;
        }
        
        .order-progress-badge {
            align-self: flex-end;
        }
        
        .tests-grid {
            padding: 15px;
        }
        
        .test-header {
            padding: 15px;
        }
        
        .test-content {
            padding: 15px;
        }
        
        .result-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 10px;
        }
        
        .result-date {
            text-align: left;
        }
        
        .form-actions, .edit-actions, .result-actions {
            flex-direction: column;
        }
        
        .form-actions button, .edit-actions button, .result-actions button {
            width: 100%;
        }
        
        .progress-circle {
            width: 60px;
            height: 60px;
        }
        
        .order-meta {
            flex-direction: column;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(enhancedStyles); 