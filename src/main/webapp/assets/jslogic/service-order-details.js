// Global variables
let currentServiceOrderData = null;
let currentHistoryData = null;
let selectedServices = [];
let assignedServices = [];
let doctors = [];
let medicineRecordId = null;
let waitlistId = null;
let patientId = null;

// Hàm hiển thị alert
function showAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
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

// Hàm khởi tạo trang với URL parameters
function initializeServiceOrderDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    waitlistId = urlParams.get('waitlistId');
    patientId = urlParams.get('patientId');

    console.log('Initializing page with parameters:', { waitlistId, patientId });

    if (waitlistId) {
        loadPatientFromWaitlist(waitlistId);
    } else if (patientId) {
        loadPatientInfo(patientId);
    } else {
        showAlert('Missing required parameters. Please access this page through proper navigation.', 'warning');
    }

    loadAssignedServices();
}

// Hàm load thông tin bệnh nhân từ waitlist
async function loadPatientFromWaitlist(waitlistId) {
    try {
        showAlert('Loading patient information...', 'info');

        const response = await fetch(`/api/doctor/service-order?action=getPatientFromWaitlist&waitlistId=${waitlistId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else if (response.status === 404) {
                throw new Error('Patient not found in waitlist.');
            } else {
                throw new Error('Failed to load patient information');
            }
        }

        const result = await response.json();

        if (result.success) {
            // Lấy medicine record ID từ patient ID
            await getMedicineRecordByPatientId(result.data.patient_id);
            displayPatientInfo(result.data);
            showAlert('Patient information loaded successfully!', 'success');
        } else {
            throw new Error(result.message || 'Failed to load patient information');
        }

    } catch (error) {
        console.error("Error loading patient from waitlist:", error);
        showAlert(error.message || 'Failed to load patient information. Please try again.', 'danger');
    }
}

// Hàm load thông tin bệnh nhân theo ID
async function loadPatientInfo(patientId) {
    try {
        showAlert('Loading patient information...', 'info');

        const response = await fetch(`/api/doctor/service-order?action=getPatientInfo&patientId=${patientId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else if (response.status === 404) {
                throw new Error('Patient not found.');
            } else {
                throw new Error('Failed to load patient information');
            }
        }

        const result = await response.json();

        if (result.success) {
            // Lấy medicine record ID từ patient ID
            await getMedicineRecordByPatientId(result.data.patient_id);
            displayPatientInfo(result.data);
            showAlert('Patient information loaded successfully!', 'success');
        } else {
            throw new Error(result.message || 'Failed to load patient information');
        }

    } catch (error) {
        console.error("Error loading patient info:", error);
        showAlert(error.message || 'Failed to load patient information. Please try again.', 'danger');
    }
}

// Hàm hiển thị thông tin bệnh nhân
function displayPatientInfo(patientData) {
    const patientIdEl = document.getElementById("patientId");
    const patientNameEl = document.getElementById("patientName");
    const patientAgeEl = document.getElementById("patientAge");
    const patientGenderEl = document.getElementById("patientGender");
    const patientPhoneEl = document.getElementById("patientPhone");

    // Xử lý dữ liệu từ WaitlistDTO hoặc Patient
    const patientId = patientData.patient_id || 'N/A';
    const patientName = patientData.full_name || patientData.patient_name || 'N/A';
    const patientAge = calculateAge(patientData.dob || patientData.date_of_birth);
    const gender = patientData.gender || 'N/A';
    const phone = patientData.phone || 'N/A';

    if (patientIdEl) patientIdEl.textContent = patientId;
    if (patientNameEl) patientNameEl.textContent = patientName;
    if (patientAgeEl) patientAgeEl.textContent = patientAge;
    if (patientGenderEl) patientGenderEl.textContent = gender;
    if (patientPhoneEl) patientPhoneEl.textContent = phone;
}

// Hàm tính tuổi từ ngày sinh
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age + ' years old';
}

// Hàm lấy medicine record ID từ patient ID
async function getMedicineRecordByPatientId(patientId) {
    try {
        const response = await fetch(`/api/doctor/service-order?action=getMedicineRecordByPatientId&patientId=${patientId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get medicine record');
        }

        const result = await response.json();

        if (result.success) {
            medicineRecordId = result.data;
            console.log('Medicine record ID:', medicineRecordId);
        } else {
            throw new Error(result.message || 'Failed to get medicine record');
        }

    } catch (error) {
        console.error("Error getting medicine record:", error);
        showAlert('Warning: Failed to get medicine record. Service order may not work properly.', 'warning');
    }
}

// Hàm load danh sách tất cả services có sẵn
async function loadAssignedServices() {
    try {
        const loadingSpinner = document.getElementById("loadingSpinner");
        const servicesContainer = document.getElementById("servicesContainer");

        loadingSpinner.style.display = "flex";
        servicesContainer.style.display = "none";

        const response = await fetch('/api/doctor/service-order?action=getServices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load services');
        }

        const result = await response.json();

        if (result.success) {
            assignedServices = result.data;
            console.log('Loaded all services:', assignedServices);
            if (assignedServices.length > 0) {
                console.log('First service structure:', assignedServices[0]);
            }
            await loadDoctors();
            displayServices(assignedServices);
            showAlert(`Loaded ${assignedServices.length} available services`, 'success');
        } else {
            throw new Error(result.message || 'Failed to load services');
        }

    } catch (error) {
        console.error("Error loading services:", error);
        showAlert(error.message || 'Failed to load services. Please try again.', 'danger');
        const loadingSpinner = document.getElementById("loadingSpinner");
        loadingSpinner.style.display = "none";
    }
}

// Hàm load danh sách doctors
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctor/service-order?action=getDoctors', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load doctors');
        }

        const result = await response.json();

        if (result.success) {
            doctors = result.data;
            console.log('Loaded doctors:', doctors);
            if (doctors.length > 0) {
                console.log('First doctor structure:', doctors[0]);
            }
        } else {
            throw new Error(result.message || 'Failed to load doctors');
        }

    } catch (error) {
        console.error("Error loading doctors:", error);
        doctors = [];
    }
}

// Hàm hiển thị danh sách services
function displayServices(services) {
    const loadingSpinner = document.getElementById("loadingSpinner");
    const servicesContainer = document.getElementById("servicesContainer");

    loadingSpinner.style.display = "none";
    servicesContainer.style.display = "flex";
    servicesContainer.innerHTML = '';

    if (services && services.length > 0) {
        services.forEach(service => {
            const serviceCard = document.createElement("div");
            serviceCard.className = "col-md-6 col-lg-4";

            const doctorOptions = doctors.map(doctor =>
                `<option value="${doctor.doctor_id}">${doctor.full_name}</option>`
            ).join('');

            // Handle both data formats: 
            // - getServices returns: name, description, price
            // - getAssignedServices returns: service_name, service_description, service_price
            const serviceName = service.service_name || service.name || 'Unknown Service';
            const serviceDescription = service.service_description || service.description || 'Professional medical service';
            const servicePrice = service.service_price || service.price || 0;

            serviceCard.innerHTML = `
                <div class="service-card" data-service-id="${service.service_id}">
                    <div class="card-body">
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="service_${service.service_id}" 
                                   onchange="handleServiceSelection(${service.service_id})">
                            <label class="form-check-label" for="service_${service.service_id}">
                                Select this service
                            </label>
                        </div>
                        <h6 class="card-title">${serviceName}</h6>
                        <p class="card-text">${serviceDescription}</p>
                        
                        <div class="doctor-selection" id="doctorSelection_${service.service_id}" style="display: none;">
                            <label class="form-label">Select Doctor:</label>
                            <select class="form-select" id="doctor_${service.service_id}" onchange="updateSelectedServicesDisplay()">
                                <option value="">Choose a doctor...</option>
                                ${doctorOptions}
                            </select>
                        </div>
                        
                        <div class="service-price mt-3">
                            <strong>${servicePrice.toLocaleString()} VND</strong>
                        </div>
                    </div>
                </div>
            `;
            servicesContainer.appendChild(serviceCard);
        });
    } else {
        servicesContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No services available.</div></div>';
    }
}

// Hàm xử lý chọn service
function handleServiceSelection(serviceId) {
    const checkbox = document.getElementById(`service_${serviceId}`);
    const doctorSelection = document.getElementById(`doctorSelection_${serviceId}`);
    const serviceCard = document.querySelector(`[data-service-id="${serviceId}"]`);

    if (checkbox.checked) {
        // Add to selected services
        const service = assignedServices.find(s => s.service_id === serviceId);
        if (service && !selectedServices.find(s => s.service_id === serviceId)) {
            // Normalize the service data to handle both formats
            const normalizedService = {
                service_id: service.service_id,
                service_name: service.service_name || service.name,
                service_description: service.service_description || service.description,
                service_price: service.service_price || service.price,
                doctor_id: null
            };
            selectedServices.push(normalizedService);
        }

        // Show doctor selection
        doctorSelection.style.display = "block";
        serviceCard.classList.add("selected");

    } else {
        // Remove from selected services
        selectedServices = selectedServices.filter(s => s.service_id !== serviceId);

        // Hide doctor selection
        doctorSelection.style.display = "none";
        serviceCard.classList.remove("selected");

        // Reset doctor selection
        const doctorSelect = document.getElementById(`doctor_${serviceId}`);
        if (doctorSelect) doctorSelect.value = "";
    }

    updateSelectedServicesDisplay();
}

// Hàm cập nhật hiển thị services đã chọn
function updateSelectedServicesDisplay() {
    const selectedServicesSection = document.getElementById("selectedServicesSection");
    const selectedServicesList = document.getElementById("selectedServicesList");
    const totalAmountEl = document.getElementById("totalAmount");

    if (selectedServices.length > 0) {
        selectedServicesSection.style.display = "block";

        let totalAmount = 0;
        selectedServicesList.innerHTML = '';

        selectedServices.forEach(service => {
            const selectedService = document.createElement("div");
            selectedService.className = "d-flex justify-content-between align-items-center mb-2 p-3 bg-light rounded";

            const doctorSelect = document.getElementById(`doctor_${service.service_id}`);
            const selectedDoctorId = doctorSelect ? doctorSelect.value : '';

            let doctorName = 'Not selected';
            if (selectedDoctorId) {
                const selectedDoctor = doctors.find(d => d.doctor_id == selectedDoctorId);
                if (selectedDoctor) {
                    doctorName = selectedDoctor.full_name;
                } else {
                    doctorName = `Doctor ID: ${selectedDoctorId}`;
                    console.error('Doctor not found for ID:', selectedDoctorId);
                    console.log('Available doctors:', doctors.map(d => ({ id: d.doctor_id, name: d.full_name })));
                }
            }

            // Handle both data formats
            const serviceName = service.service_name || service.name || 'Unknown Service';
            const servicePrice = service.service_price || service.price || 0;

            selectedService.innerHTML = `
                <div>
                    <strong>${serviceName}</strong><br>
                    <small class="text-muted">Doctor: ${doctorName}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-success">${servicePrice.toLocaleString()} VND</span>
                </div>
            `;
            selectedServicesList.appendChild(selectedService);

            totalAmount += servicePrice;
        });

        totalAmountEl.textContent = totalAmount.toLocaleString();
    } else {
        selectedServicesSection.style.display = "none";
    }
}

// Hàm tạo service order
async function createServiceOrder() {
    if (selectedServices.length === 0) {
        showAlert('Please select at least one service', 'warning');
        return;
    }

    // Validate doctor selection
    const missingDoctors = [];
    const servicesWithDoctors = [];

    selectedServices.forEach(service => {
        const doctorSelect = document.getElementById(`doctor_${service.service_id}`);
        const selectedDoctorId = doctorSelect ? doctorSelect.value : '';

        if (!selectedDoctorId) {
            missingDoctors.push(service.service_name);
        } else {
            servicesWithDoctors.push({
                serviceId: service.service_id,
                doctorId: parseInt(selectedDoctorId)
            });
        }
    });

    if (missingDoctors.length > 0) {
        showAlert(`Please select doctors for: ${missingDoctors.join(', ')}`, 'warning');
        return;
    }

    try {
        showAlert('Creating service order...', 'info');

        const orderData = {
            medicineRecordId: medicineRecordId,
            services: servicesWithDoctors,
            waitlistId: waitlistId
        };

        const response = await fetch('/api/doctor/service-order?action=createServiceOrder', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else if (response.status === 400) {
                throw new Error('Invalid order data. Please check your selections.');
            } else {
                throw new Error('Failed to create service order');
            }
        }

        const result = await response.json();

        if (result.success) {
            const orderIdText = result.serviceOrderId ? ` (Order ID: ${result.serviceOrderId})` : '';
            showAlert(`Service order created successfully!${orderIdText}`, 'success');
            
            // Sử dụng endpoint mới để cập nhật status và visittype
            if (waitlistId && result.serviceOrderId) {
                try {
                    await afterServiceOrderCreated(result.serviceOrderId, waitlistId);
                    setTimeout(() => {
                        showAlert('✅ Patient status automatically updated: moved from "Initial" to "Result" and set to "Waiting" for service results', 'success');
                    }, 1500);
                } catch (error) {
                    console.error('Failed to update waitlist status via new endpoint:', error);
                    // Fallback to old method if new endpoint fails
                    try {
                        await updateWaitlistToWaiting(waitlistId);
                        setTimeout(() => {
                            showAlert('✅ Patient status updated (fallback method)', 'success');
                        }, 1500);
                    } catch (fallbackError) {
                        console.error('Fallback method also failed:', fallbackError);
                        setTimeout(() => {
                            showAlert('⚠️ Service order created but status update failed. Please update manually.', 'warning');
                        }, 1500);
                    }
                }
            }

            // Redirect to service order page after delay
            setTimeout(() => {
                window.location.href = 'service-order.html';
            }, 5000);

            console.log('Service order created:', result);

            // Show notification về assigned doctors
            const assignedDoctorNames = [];
            servicesWithDoctors.forEach(service => {
                const doctorSelect = document.getElementById(`doctor_${service.serviceId}`);
                const doctorName = doctorSelect.options[doctorSelect.selectedIndex].text;
                if (!assignedDoctorNames.includes(doctorName)) {
                    assignedDoctorNames.push(doctorName);
                }
            });

            setTimeout(() => {
                showAlert(`✅ Services successfully assigned to: ${assignedDoctorNames.join(', ')}. The assigned doctors can now see these services in their "Assigned Services" page and start performing them.`, 'info');
            }, 2000);

            // Show navigation options instead of direct redirect
            setTimeout(() => {
                showNavigationOptionsAfterCreateOrder();
            }, 4000);

        } else {
            throw new Error(result.message || 'Failed to create service order');
        }

    } catch (error) {
        console.error("Error creating service order:", error);
        showAlert(error.message || 'Failed to create service order. Please try again.', 'danger');
    }
}

// Hàm skip services
function skipServices() {
    if (confirm('Are you sure you want to skip service selection? No services will be ordered.')) {
        if (waitlistId) {
            window.location.href = '../view/assigned-services.html';
        } else {
            window.location.href = '../view/service-order.html';
        }
    }
}

// Hàm hiển thị các tùy chọn navigation
function showNavigationOptions() {
    const alertContainer = document.getElementById("alertContainer");

    const navigationHtml = `
        <div class="alert alert-light border" role="alert">
            <h6 class="alert-heading">
                <i class="fas fa-compass me-2"></i>
                What would you like to do next?
            </h6>
            <div class="d-flex gap-2 flex-wrap mt-3">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="navigateToServiceOrder()">
                    <i class="fas fa-list-ul me-1"></i>
                    View Service Orders
                </button>
                <button type="button" class="btn btn-outline-success btn-sm" onclick="navigateToAssignedServices()">
                    <i class="fas fa-tasks me-1"></i>
                    Assigned Services
                </button>
                <button type="button" class="btn btn-outline-info btn-sm" onclick="navigateToHome()">
                    <i class="fas fa-home me-1"></i>
                    Doctor Home
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="dismissNavigation()">
                    <i class="fas fa-times me-1"></i>
                    Stay Here
                </button>
            </div>
        </div>
    `;

    // Add to existing alerts instead of replacing
    const existingAlerts = alertContainer.innerHTML;
    alertContainer.innerHTML = existingAlerts + navigationHtml;
}

// Hàm hiển thị navigation options sau khi tạo service order
function showNavigationOptionsAfterCreateOrder() {
    const alertContainer = document.getElementById("alertContainer");

    // Tạo danh sách tên bác sĩ được assign
    const assignedDoctorNames = [];
    selectedServices.forEach(service => {
        const doctorSelect = document.getElementById(`doctor_${service.service_id}`);
        if (doctorSelect && doctorSelect.selectedIndex > 0) {
            const doctorName = doctorSelect.options[doctorSelect.selectedIndex].text;
            if (!assignedDoctorNames.includes(doctorName)) {
                assignedDoctorNames.push(doctorName);
            }
        }
    });

    const navigationHtml = `
        <div class="alert alert-success border-success" role="alert">
            <h6 class="alert-heading">
                <i class="fas fa-check-circle me-2"></i>
                Service Order Created Successfully! 
            </h6>
            <p class="mb-3">✅ <strong>Services Assigned:</strong> ${assignedDoctorNames.length > 0 ? assignedDoctorNames.join(', ') : 'No doctors assigned'}<br>
            🔔 <strong>Notification:</strong> Assigned doctors will be notified and can view these services in their "Assigned Services" page<br>
            📋 <strong>Status:</strong> Patient status updated from "Initial" to "Result" and moved to "Waiting" for service results</p>
            <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-success btn-sm" onclick="navigateToAssignedServices()">
                    <i class="fas fa-tasks me-1"></i>
                    View My Assigned Services
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="navigateToServiceOrder()">
                    <i class="fas fa-list-ul me-1"></i>
                    Service Orders Management
                </button>
                <button type="button" class="btn btn-outline-info btn-sm" onclick="createAnotherOrder()">
                    <i class="fas fa-plus me-1"></i>
                    Create Another Order
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="navigateToHome()">
                    <i class="fas fa-home me-1"></i>
                    Doctor Dashboard
                </button>
            </div>
        </div>
    `;

    // Add to existing alerts
    const existingAlerts = alertContainer.innerHTML;
    alertContainer.innerHTML = existingAlerts + navigationHtml;
}

// Navigation functions
function navigateToServiceOrder() {
    window.location.href = '../view/service-order.html?refresh=true';
}

function navigateToAssignedServices() {
    window.location.href = '../view/assigned-services.html?newAssignment=true';
}

function navigateToHome() {
    window.location.href = '../view/home-doctor.html';
}

function dismissNavigation() {
    const navigationAlert = document.querySelector('.alert-light');
    if (navigationAlert) {
        navigationAlert.remove();
    }
}

function createAnotherOrder() {
    // Reset form và cho phép tạo order mới
    selectedServices = [];
    updateSelectedServicesDisplay();

    // Clear all checkboxes
    document.querySelectorAll('input[type="checkbox"][id^="service_"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Hide all doctor selections
    document.querySelectorAll('.doctor-selection').forEach(selection => {
        selection.style.display = 'none';
    });

    // Remove service card selected class
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Clear alerts
    document.getElementById("alertContainer").innerHTML = '';

    showAlert('Form reset. You can now create another service order.', 'info');
}

// Hàm tìm kiếm service order theo ID
async function searchServiceOrder() {
    const serviceOrderId = document.getElementById("serviceOrderIdInput").value;

    if (!serviceOrderId) {
        showAlert('Please enter a Service Order ID', 'danger');
        return;
    }

    await getServiceOrderDetails(parseInt(serviceOrderId));
}

// Hàm tìm kiếm theo medicine record ID
async function searchByMedicineRecord() {
    const medicineRecordId = document.getElementById("medicineRecordIdInput").value;

    if (!medicineRecordId) {
        showAlert('Please enter a Medicine Record ID', 'danger');
        return;
    }

    await getServiceOrderHistory(parseInt(medicineRecordId));
}

// Hàm tìm kiếm theo tên bệnh nhân
async function searchByPatientName() {
    const patientName = document.getElementById("patientNameInput").value;

    if (!patientName || patientName.trim().length < 2) {
        showAlert('Please enter at least 2 characters for patient name', 'danger');
        return;
    }

    await getServiceOrdersByPatientName(patientName.trim());
}

// Hàm load lịch sử của bác sĩ
async function loadDoctorHistory() {
    await getDoctorServiceOrderHistory();
}

// Hàm lấy chi tiết service order
async function getServiceOrderDetails(serviceOrderId) {
    const detailsSection = document.getElementById("serviceOrderDetailsSection");
    const loadingSpinner = document.getElementById("detailsLoadingSpinner");
    const content = document.getElementById("detailsContent");

    try {
        // Hiển thị loading
        detailsSection.style.display = "block";
        loadingSpinner.style.display = "flex";
        content.style.display = "none";

        const response = await fetch(`/api/doctor/service-order?action=getServiceOrder&serviceOrderId=${serviceOrderId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else if (response.status === 404) {
                throw new Error('Service order not found.');
            } else {
                throw new Error('Failed to get service order details');
            }
        }

        const result = await response.json();

        if (result.success) {
            currentServiceOrderData = result.data;
            console.log('Service order details received:', result.data);
            console.log('Items in response:', result.data.items);
            displayServiceOrderDetails(result.data);
            showAlert('Service order details loaded successfully!', 'success');
            scrollToSection('serviceOrderDetailsSection', 500);
        } else {
            throw new Error(result.message || 'Failed to get service order details');
        }

    } catch (error) {
        console.error("Error getting service order details:", error);
        showAlert(error.message || 'Failed to get service order details. Please try again.', 'danger');
        loadingSpinner.style.display = "none";
    }
}

// Hàm hiển thị chi tiết service order
function displayServiceOrderDetails(data) {
    const loadingSpinner = document.getElementById("detailsLoadingSpinner");
    const content = document.getElementById("detailsContent");

    console.log('displayServiceOrderDetails called with data:', data);

    const serviceOrder = data.serviceOrder || data;
    const items = data.items || [];
    const totalAmount = data.totalAmount || 0;

    console.log('Parsed data:', {
        serviceOrder: serviceOrder,
        items: items,
        totalAmount: totalAmount,
        itemsLength: items.length
    });

    // Cập nhật thông tin cơ bản
    const orderIdEl = document.getElementById("detailOrderId");
    const doctorNameEl = document.getElementById("detailDoctorName");
    const patientNameEl = document.getElementById("detailPatientName");
    const orderDateEl = document.getElementById("detailOrderDate");
    const totalAmountEl = document.getElementById("detailTotalAmount");

    if (orderIdEl) orderIdEl.textContent = serviceOrder.service_order_id || 'N/A';
    if (doctorNameEl) doctorNameEl.textContent = serviceOrder.doctor_name || 'N/A';
    if (patientNameEl) patientNameEl.textContent = serviceOrder.patient_name || 'N/A';
    if (orderDateEl) orderDateEl.textContent = formatDateTime(serviceOrder.order_date);
    if (totalAmountEl) totalAmountEl.textContent = totalAmount.toLocaleString();

    // Hiển thị danh sách services
    const serviceItemsList = document.getElementById("detailServicesList");
    if (serviceItemsList) {
        serviceItemsList.innerHTML = '';

        if (items && items.length > 0) {
            items.forEach(item => {
                const serviceItem = document.createElement("div");
                serviceItem.className = "service-order-item";
                serviceItem.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6><i class="fas fa-stethoscope me-2"></i>${item.service_name || 'Unknown Service'}</h6>
                            <p class="mb-0 text-muted">${item.service_description || 'No description'}</p>
                            <small class="text-muted">Doctor: ${item.doctor_name || 'N/A'}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <span class="price-badge">${(item.service_price || 0).toLocaleString()} VND</span>
                        </div>
                    </div>
                `;
                serviceItemsList.appendChild(serviceItem);
            });
        } else {
            serviceItemsList.innerHTML = '<div class="alert alert-warning">No services found for this order.</div>';
        }
    }

    // Ẩn loading và hiển thị content
    loadingSpinner.style.display = "none";
    content.style.display = "block";
}

// Hàm lấy service orders theo tên bệnh nhân
async function getServiceOrdersByPatientName(patientName) {
    const historySection = document.getElementById("serviceOrderHistorySection");
    const loadingSpinner = document.getElementById("historyLoadingSpinner");
    const content = document.getElementById("historyContent");

    // Hiển thị history section
    if (historySection) {
        historySection.style.display = "block";
    }

    try {
        // Hiển thị loading
        loadingSpinner.style.display = "flex";
        content.style.display = "none";

        const response = await fetch(`/api/doctor/service-order?action=getServiceOrdersByPatientName&patientName=${encodeURIComponent(patientName)}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else {
                throw new Error('Failed to get service orders by patient name');
            }
        }

        const result = await response.json();

        if (result.success) {
            currentHistoryData = result.data;
            displayServiceOrderHistory(result.data, `Service Orders for Patient: "${patientName}"`);

            if (result.data.length > 0) {
                showAlert(`Found ${result.data.length} service order(s) for patient "${patientName}"`, 'success');
            } else {
                showAlert(`No service orders found for patient "${patientName}"`, 'info');
            }
            scrollToSection('serviceOrderHistorySection', 500);
        } else {
            throw new Error(result.message || 'Failed to get service orders by patient name');
        }

    } catch (error) {
        console.error("Error getting service orders by patient name:", error);
        showAlert(error.message || 'Failed to get service orders by patient name. Please try again.', 'danger');
        loadingSpinner.style.display = "none";
    }
}

// Hàm lấy lịch sử service orders theo medicine record
async function getServiceOrderHistory(medicineRecordId) {
    const historySection = document.getElementById("serviceOrderHistorySection");
    const loadingSpinner = document.getElementById("historyLoadingSpinner");
    const content = document.getElementById("historyContent");

    // Hiển thị history section
    if (historySection) {
        historySection.style.display = "block";
    }

    try {
        // Hiển thị loading
        loadingSpinner.style.display = "flex";
        content.style.display = "none";

        const response = await fetch(`/api/doctor/service-order?action=getServiceOrdersByMedicineRecord&medicineRecordId=${medicineRecordId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else {
                throw new Error('Failed to get service order history');
            }
        }

        const result = await response.json();

        if (result.success) {
            currentHistoryData = result.data;
            displayServiceOrderHistory(result.data, `Patient History (Medicine Record ID: ${medicineRecordId})`);
            showAlert('Service order history loaded successfully!', 'success');
            scrollToSection('serviceOrderHistorySection', 500);
        } else {
            throw new Error(result.message || 'Failed to get service order history');
        }

    } catch (error) {
        console.error("Error getting service order history:", error);
        showAlert(error.message || 'Failed to get service order history. Please try again.', 'danger');
        loadingSpinner.style.display = "none";
    }
}

// Hàm lấy lịch sử service orders của bác sĩ
async function getDoctorServiceOrderHistory() {
    const historySection = document.getElementById("serviceOrderHistorySection");
    const loadingSpinner = document.getElementById("historyLoadingSpinner");
    const content = document.getElementById("historyContent");

    // Hiển thị history section
    if (historySection) {
        historySection.style.display = "block";
    }

    try {
        // Hiển thị loading
        loadingSpinner.style.display = "flex";
        content.style.display = "none";

        const response = await fetch('/api/doctor/service-order?action=getServiceOrdersByDoctor', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please login again.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Doctor role required.');
            } else {
                throw new Error('Failed to get doctor service order history');
            }
        }

        const result = await response.json();

                if (result.success) {
            currentHistoryData = result.data;
            displayServiceOrderHistory(result.data, 'My Service Order History');

            if (result.data.length > 0) {
                showAlert(`Loaded ${result.data.length} service order(s)`, 'success');
            } else {
                showAlert('No service orders found', 'info');
            }
            scrollToSection('serviceOrderHistorySection', 500);
        } else {
            throw new Error(result.message || 'Failed to get doctor service order history');
        }

    } catch (error) {
        console.error("Error getting doctor service order history:", error);
        showAlert(error.message || 'Failed to get doctor service order history. Please try again.', 'danger');
        loadingSpinner.style.display = "none";
    }
}

// Hàm hiển thị lịch sử service orders
function displayServiceOrderHistory(historyData, title) {
    const historySection = document.getElementById("serviceOrderHistorySection");
    const loadingSpinner = document.getElementById("historyLoadingSpinner");
    const content = document.getElementById("historyContent");
    const historyList = document.getElementById("historyList");
    const historyTitle = document.getElementById("historyTitle");

    // Hiển thị history section
    if (historySection) {
        historySection.style.display = "block";
    }

    // Cập nhật title
    if (historyTitle) {
        historyTitle.innerHTML = `<i class="fas fa-history me-2"></i>${title}`;
    }

    if (historyList) {
        historyList.innerHTML = '';

        if (historyData && historyData.length > 0) {
            historyData.forEach((order, index) => {
                const historyItem = document.createElement("div");
                historyItem.className = "history-item";

                const items = order.items || [];
                const totalAmount = order.totalAmount || 0;

                historyItem.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6><i class="fas fa-file-medical me-2"></i>Order #${order.service_order_id}</h6>
                            <small class="text-muted">${formatDateTime(order.order_date)}</small>
                        </div>
                        <div class="col-md-3">
                            <strong>Patient:</strong> ${order.patient_name || 'N/A'}<br>
                            <strong>Doctor:</strong> ${order.doctor_name || 'N/A'}
                        </div>
                        <div class="col-md-3">
                            <strong>Services:</strong> ${items.length} items<br>
                            <small class="text-muted">${items.length > 0 ? items.map(item => item.service_name).slice(0, 2).join(', ') + (items.length > 2 ? '...' : '') : 'No services'}</small>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="price-badge">${totalAmount.toLocaleString()} VND</div>
                            <button class="btn btn-sm btn-outline-primary mt-2" onclick="viewOrderDetails(${order.service_order_id})">
                                <i class="fas fa-eye me-1"></i>View Details
                            </button>
                        </div>
                    </div>
                `;
                historyList.appendChild(historyItem);
            });
        } else {
            historyList.innerHTML = '<div class="alert alert-info">No service orders found.</div>';
        }
    }

    // Ẩn loading và hiển thị content
    loadingSpinner.style.display = "none";
    content.style.display = "block";
}

// Hàm xem chi tiết order từ lịch sử
function viewOrderDetails(serviceOrderId) {
    if (!serviceOrderId) {
        showAlert('Invalid service order ID', 'warning');
        return;
    }

    const serviceOrderIdInput = document.getElementById("serviceOrderIdInput");
    if (serviceOrderIdInput) {
        serviceOrderIdInput.value = serviceOrderId;
    }

    getServiceOrderDetails(serviceOrderId);
}

// Demo functions
function demoGetServiceOrderDetails() {
    const serviceOrderIdInput = document.getElementById("serviceOrderIdInput");
    if (serviceOrderIdInput) {
        serviceOrderIdInput.value = "1";
    }
    getServiceOrderDetails(1);
}

function demoGetPatientHistory() {
    const medicineRecordIdInput = document.getElementById("medicineRecordIdInput");
    if (medicineRecordIdInput) {
        medicineRecordIdInput.value = "1";
    }
    getServiceOrderHistory(1);
}

function demoGetDoctorHistory() {
    getDoctorServiceOrderHistory();
}

function demoSearchByPatientName() {
    const patientNameInput = document.getElementById("patientNameInput");
    if (patientNameInput) {
        patientNameInput.value = "Nguyen";
        searchByPatientName();
    }
}

// Utility functions
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-GB');
    } catch (error) {
        return 'Invalid Date';
    }
}

// Print function
function printServiceOrder() {
    if (currentServiceOrderData) {
        window.print();
    } else {
        showAlert('No data to print', 'warning');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the service order creation page
    const servicesContainer = document.getElementById("servicesContainer");
    const patientIdEl = document.getElementById("patientId");

    if (servicesContainer && patientIdEl) {
        // This is the service order creation page
        initializeServiceOrderDetailsPage();
    } else {
        // This is the search/view page
        // Enter key handlers
        const serviceOrderIdInput = document.getElementById("serviceOrderIdInput");
        if (serviceOrderIdInput) {
            serviceOrderIdInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchServiceOrder();
                }
            });
        }

        const medicineRecordIdInput = document.getElementById("medicineRecordIdInput");
        if (medicineRecordIdInput) {
            medicineRecordIdInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchByMedicineRecord();
                }
            });
        }

        const patientNameInput = document.getElementById("patientNameInput");
        if (patientNameInput) {
            patientNameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchByPatientName();
                }
            });
        }

        // Show welcome message with debug info
        showAlert('Welcome to Service Order Details page! Use the search functions to explore service orders, or create new ones using URL parameters.', 'info');
        console.log('Debug functions available: testConnection(), testAssignedServices(), testViewServiceOrder(id), testViewLatestOrders(), runDebugTests()');
        console.log('Note: testAssignedServices() will show comparison between ALL services vs ASSIGNED services');
        console.log('Waitlist Status Management functions available:');
        console.log('- updateWaitlistStatus(waitlistId, "status") - Update only status');
        console.log('- updateWaitlistStatusAndVisittype(waitlistId, "status", "visittype") - Update both status and visittype');
        console.log('- updateWaitlistToWaiting(waitlistId) - Set status="Result", visittype="Waiting"');
        console.log('- updateWaitlistToInProgress(waitlistId) - Set status="InProgress"');
        console.log('- updateWaitlistToSkipped(waitlistId) - Set status="Skipped"');
        console.log('- updateWaitlistToCompleted(waitlistId) - Set status="Completed"');
        console.log('- demoWaitlistStatusManagement() - Demo all status management functions');
    }
});

// ===== DEBUG FUNCTIONS =====
// Test functions for debugging assigned services
async function testConnection() {
    try {
        const response = await fetch('/api/doctor/service-order?action=testConnection', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Test Connection Result:', result);

        if (result.success) {
            showAlert(`Connection successful! Doctor: ${result.doctor_name} (ID: ${result.doctor_id})`, 'success');
        } else {
            showAlert(`Connection failed: ${result.message}`, 'danger');
        }
    } catch (error) {
        console.error('Test connection error:', error);
        showAlert(`Test connection error: ${error.message}`, 'danger');
    }
}

async function testAssignedServices() {
    try {
        console.log('Testing both getServices and getAssignedServices...');

        // Test all services
        const servicesResponse = await fetch('/api/doctor/service-order?action=getServices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const servicesResult = await servicesResponse.json();
        console.log('All Services Result:', servicesResult);

        // Test assigned services
        const assignedResponse = await fetch('/api/doctor/service-order?action=getAssignedServices', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const assignedResult = await assignedResponse.json();
        console.log('Assigned Services Result:', assignedResult);

        if (servicesResult.success) {
            showAlert(`Found ${servicesResult.data.length} total services, ${assignedResult.success ? assignedResult.data.length : 0} assigned services`, 'success');
            console.log('=== ALL SERVICES ===');
            console.table(servicesResult.data);
            if (assignedResult.success) {
                console.log('=== ASSIGNED SERVICES ===');
                console.table(assignedResult.data);
            }
        } else {
            showAlert(`Failed to get services: ${servicesResult.message}`, 'danger');
        }
    } catch (error) {
        console.error('Test services error:', error);
        showAlert(`Test services error: ${error.message}`, 'danger');
    }
}

// Function to run all tests
function runDebugTests() {
    console.log('=== Starting Debug Tests ===');
    testConnection();
    setTimeout(() => {
        testAssignedServices();
    }, 1000);
}

// Test function to view a service order
async function testViewServiceOrder(serviceOrderId) {
    if (!serviceOrderId) {
        serviceOrderId = prompt('Enter Service Order ID to test:');
        if (!serviceOrderId) return;
    }

    console.log('Testing view service order for ID:', serviceOrderId);
    await getServiceOrderDetails(parseInt(serviceOrderId));
}

// Test function to view latest service orders
async function testViewLatestOrders() {
    console.log('Testing view latest doctor orders...');
    await getDoctorServiceOrderHistory();
}

// Helper function to hide all result sections
function hideAllResultSections() {
    const detailsSection = document.getElementById("serviceOrderDetailsSection");
    const historySection = document.getElementById("serviceOrderHistorySection");

    if (detailsSection) detailsSection.style.display = "none";
    if (historySection) historySection.style.display = "none";
}

// Helper function to scroll to a section
function scrollToSection(sectionId, delay = 300) {
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, delay);
}

// ===== WAITLIST STATUS AND VISITTYPE MANAGEMENT =====

// Hàm cập nhật trạng thái waitlist (chỉ status)
async function updateWaitlistStatus(waitlistId, status) {
    try {
        const response = await fetch('/api/doctor/waitlist', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                waitlistId: waitlistId,
                status: status
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showAlert(`Waitlist status updated to "${status}" successfully`, 'success');
            console.log('Waitlist status updated:', result);
            return true;
        } else {
            throw new Error(result.message || result.error || 'Failed to update waitlist status');
        }
    } catch (error) {
        console.error("Error updating waitlist status:", error);
        showAlert(error.message || 'Failed to update waitlist status', 'danger');
        return false;
    }
}

// Hàm cập nhật cả status và visittype cùng lúc
async function updateWaitlistStatusAndVisittype(waitlistId, status, visittype) {
    try {
        const response = await fetch('/api/doctor/waitlist', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                waitlistId: waitlistId,
                status: status,
                visittype: visittype
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showAlert(`Waitlist updated successfully - Status: "${status}", Visittype: "${visittype}"`, 'success');
            console.log('Waitlist status and visittype updated:', result);
            return true;
        } else {
            throw new Error(result.message || result.error || 'Failed to update waitlist status and visittype');
        }
    } catch (error) {
        console.error("Error updating waitlist status and visittype:", error);
        showAlert(error.message || 'Failed to update waitlist status and visittype', 'danger');
        return false;
    }
}

// Các hàm tiện ích cho các trạng thái cụ thể
async function updateWaitlistToWaiting(waitlistId) {
    return await updateWaitlistStatusAndVisittype(waitlistId, 'Result', 'Waiting');
}

async function updateWaitlistToInProgress(waitlistId) {
    return await updateWaitlistStatus(waitlistId, 'InProgress');
}

async function updateWaitlistToSkipped(waitlistId) {
    return await updateWaitlistStatus(waitlistId, 'Skipped');
}

async function updateWaitlistToCompleted(waitlistId) {
    return await updateWaitlistStatus(waitlistId, 'Completed');
}

// Demo function để test các cập nhật
async function demoWaitlistStatusManagement() {
    const waitlistId = prompt('Enter Waitlist ID for status management demo:');
    if (!waitlistId) return;

    const id = parseInt(waitlistId);

    console.log('=== Waitlist Status Management Demo ===');
    console.log('Available functions:');
    console.log('- updateWaitlistStatus(waitlistId, "status")');
    console.log('- updateWaitlistStatusAndVisittype(waitlistId, "status", "visittype")');
    console.log('- updateWaitlistToWaiting(waitlistId) - Sets status="Result", visittype="Waiting"');
    console.log('- updateWaitlistToInProgress(waitlistId) - Sets status="InProgress"');
    console.log('- updateWaitlistToSkipped(waitlistId) - Sets status="Skipped"');
    console.log('- updateWaitlistToCompleted(waitlistId) - Sets status="Completed"');

    showAlert(`Demo functions ready for Waitlist ID: ${id}. Check console for available functions.`, 'info');
}