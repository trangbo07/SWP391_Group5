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
        showAlert('Thiếu tham số cần thiết. Vui lòng truy cập trang này qua điều hướng hợp lệ.', 'warning');
    }

    loadAssignedServices();
}

// Hàm load thông tin bệnh nhân từ waitlist
async function loadPatientFromWaitlist(waitlistId) {
    try {
        showAlert('Đang tải thông tin bệnh nhân...', 'info');

        const response = await fetch(`/api/doctor/service-order?action=getPatientFromWaitlist&waitlistId=${waitlistId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else if (response.status === 404) {
                throw new Error('Không tìm thấy bệnh nhân trong danh sách chờ.');
            } else {
                throw new Error('Không thể tải thông tin bệnh nhân');
            }
        }

        const result = await response.json();

        if (result.success) {
            // Lấy medicine record ID từ patient ID
            await getMedicineRecordByPatientId(result.data.patient_id);
            displayPatientInfo(result.data);
            showAlert('Tải thông tin bệnh nhân thành công!', 'success');
        } else {
            throw new Error(result.message || 'Không thể tải thông tin bệnh nhân');
        }

    } catch (error) {
        console.error("Error loading patient from waitlist:", error);
        showAlert(error.message || 'Không thể tải thông tin bệnh nhân. Vui lòng thử lại.', 'danger');
    }
}

// Hàm load thông tin bệnh nhân theo ID
async function loadPatientInfo(patientId) {
    try {
        showAlert('Đang tải thông tin bệnh nhân...', 'info');

        const response = await fetch(`/api/doctor/service-order?action=getPatientInfo&patientId=${patientId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else if (response.status === 404) {
                throw new Error('Không tìm thấy bệnh nhân.');
            } else {
                throw new Error('Không thể tải thông tin bệnh nhân');
            }
        }

        const result = await response.json();

        if (result.success) {
            // Lấy medicine record ID từ patient ID
            await getMedicineRecordByPatientId(result.data.patient_id);
            displayPatientInfo(result.data);
            showAlert('Tải thông tin bệnh nhân thành công!', 'success');
        } else {
            throw new Error(result.message || 'Không thể tải thông tin bệnh nhân');
        }

    } catch (error) {
        console.error("Error loading patient info:", error);
        showAlert(error.message || 'Không thể tải thông tin bệnh nhân. Vui lòng thử lại.', 'danger');
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
    return age + ' tuổi';
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
            throw new Error('Không thể lấy hồ sơ khám bệnh');
        }

        const result = await response.json();

        if (result.success) {
            medicineRecordId = result.data;
            console.log('Medicine record ID:', medicineRecordId);
        } else {
            throw new Error(result.message || 'Không thể lấy hồ sơ khám bệnh');
        }

    } catch (error) {
        console.error("Error getting medicine record:", error);
        showAlert('Cảnh báo: Không thể lấy hồ sơ khám bệnh. Đơn dịch vụ có thể không hoạt động đúng.', 'warning');
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
            throw new Error('Không thể tải danh sách dịch vụ');
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
            showAlert(`Đã tải ${assignedServices.length} dịch vụ khả dụng`, 'success');
        } else {
            throw new Error(result.message || 'Không thể tải danh sách dịch vụ');
        }

    } catch (error) {
        console.error("Error loading services:", error);
        showAlert(error.message || 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.', 'danger');
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
            throw new Error('Không thể tải danh sách bác sĩ');
        }

        const result = await response.json();

        if (result.success) {
            doctors = result.data;
            console.log('Loaded doctors:', doctors);
            if (doctors.length > 0) {
                console.log('First doctor structure:', doctors[0]);
            }
        } else {
            throw new Error(result.message || 'Không thể tải danh sách bác sĩ');
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
                                Chọn dịch vụ này
                            </label>
                        </div>
                        <h6 class="card-title">${serviceName}</h6>
                        <p class="card-text">${serviceDescription}</p>
                        
                        <div class="doctor-selection" id="doctorSelection_${service.service_id}" style="display: none;">
                            <label class="form-label">Chọn Bác Sĩ:</label>
                            <select class="form-select" id="doctor_${service.service_id}" onchange="updateSelectedServicesDisplay()">
                                <option value="">Chọn một bác sĩ...</option>
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
        servicesContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">Không có dịch vụ nào khả dụng.</div></div>';
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

            let doctorName = 'Chưa chọn';
            if (selectedDoctorId) {
                const selectedDoctor = doctors.find(d => d.doctor_id == selectedDoctorId);
                if (selectedDoctor) {
                    doctorName = selectedDoctor.full_name;
                } else {
                    doctorName = `Mã bác sĩ: ${selectedDoctorId}`;
                    console.error('Không tìm thấy bác sĩ cho ID:', selectedDoctorId);
                    console.log('Danh sách bác sĩ có sẵn:', doctors.map(d => ({ id: d.doctor_id, name: d.full_name })));
                }
            }

            // Handle both data formats
            const serviceName = service.service_name || service.name || 'Unknown Service';
            const servicePrice = service.service_price || service.price || 0;

            selectedService.innerHTML = `
                <div>
                    <strong>${serviceName}</strong><br>
                    <small class="text-muted">Bác sĩ: ${doctorName}</small>
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
        showAlert('Vui lòng chọn ít nhất một dịch vụ', 'warning');
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
        showAlert(`Vui lòng chọn bác sĩ cho: ${missingDoctors.join(', ')}`, 'warning');
        return;
    }

    try {
        showAlert('Đang tạo đơn dịch vụ...', 'info');

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
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else if (response.status === 400) {
                throw new Error('Dữ liệu đơn hàng không hợp lệ. Vui lòng kiểm tra lại các lựa chọn.');
            } else {
                throw new Error('Không thể tạo đơn dịch vụ');
            }
        }

        const result = await response.json();

        if (result.success) {
            const orderIdText = result.serviceOrderId ? ` (Mã đơn: ${result.serviceOrderId})` : '';
            showAlert(`Đơn dịch vụ đã tạo thành công!${orderIdText}`, 'success');
            
            // Sử dụng endpoint mới để cập nhật status và visittype
            if (waitlistId && result.serviceOrderId) {
                try {
                    await afterServiceOrderCreated(result.serviceOrderId, waitlistId);
                    setTimeout(() => {
                        showAlert('✅ Trạng thái bệnh nhân đã tự động cập nhật: đã chuyển từ "Đầu tiên" sang "Kết quả" và đặt trạng thái là "Đang chờ" để kết quả dịch vụ', 'success');
                    }, 1500);
                } catch (error) {
                    console.error('Không thể cập nhật trạng thái waitlist qua endpoint mới:', error);
                    // Fallback to old method if new endpoint fails
                    try {
                        await updateWaitlistToWaiting(waitlistId);
                        setTimeout(() => {
                            showAlert('✅ Trạng thái bệnh nhân đã cập nhật (phương pháp fallback)', 'success');
                        }, 1500);
                    } catch (fallbackError) {
                        console.error('Phương pháp fallback cũng thất bại:', fallbackError);
                        setTimeout(() => {
                            showAlert('⚠️ Đơn dịch vụ đã tạo nhưng cập nhật trạng thái thất bại. Vui lòng cập nhật thủ công.', 'warning');
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
                showAlert(`✅ Các dịch vụ đã được giao thành công cho: ${assignedDoctorNames.join(', ')}. Bác sĩ đã giao dịch có thể xem các dịch vụ này trong trang "Dịch vụ đã giao" và bắt đầu thực hiện chúng.`, 'info');
            }, 2000);

            // Show navigation options instead of direct redirect
            setTimeout(() => {
                showNavigationOptionsAfterCreateOrder();
            }, 4000);

        } else {
            throw new Error(result.message || 'Không thể tạo đơn dịch vụ');
        }

    } catch (error) {
        console.error("Error creating service order:", error);
        showAlert(error.message || 'Không thể tạo đơn dịch vụ. Vui lòng thử lại.', 'danger');
    }
}

// Hàm skip services
function skipServices() {
    if (confirm('Bạn có chắc chắn muốn bỏ qua việc chọn dịch vụ? Không dịch vụ nào sẽ được đặt.')) {
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
                Bạn muốn làm gì tiếp theo?
            </h6>
            <div class="d-flex gap-2 flex-wrap mt-3">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="navigateToServiceOrder()">
                    <i class="fas fa-list-ul me-1"></i>
                    Xem Đơn Dịch Vụ
                </button>
                <button type="button" class="btn btn-outline-success btn-sm" onclick="navigateToAssignedServices()">
                    <i class="fas fa-tasks me-1"></i>
                    Dịch Vụ Đã Giao
                </button>
                <button type="button" class="btn btn-outline-info btn-sm" onclick="navigateToHome()">
                    <i class="fas fa-home me-1"></i>
                    Trang Chủ Bác Sĩ
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="dismissNavigation()">
                    <i class="fas fa-times me-1"></i>
                    Ở đây
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
                Đơn Dịch Vụ Đã Tạo Thành Công! 
            </h6>
            <p class="mb-3">✅ <strong>Dịch Vụ Đã Giao:</strong> ${assignedDoctorNames.length > 0 ? assignedDoctorNames.join(', ') : 'Không có bác sĩ nào được giao'}<br>
            🔔 <strong>Thông báo:</strong> Bác sĩ đã giao sẽ được thông báo và có thể xem các dịch vụ này trong trang "Dịch vụ đã giao" của họ<br>
            📋 <strong>Trạng Thái:</strong> Trạng thái bệnh nhân đã được cập nhật từ "Đầu tiên" sang "Kết quả" và đã chuyển sang "Đang chờ" để kết quả dịch vụ</p>
            <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-success btn-sm" onclick="navigateToAssignedServices()">
                    <i class="fas fa-tasks me-1"></i>
                    Xem Dịch Vụ Đã Giao Của Tôi
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="navigateToServiceOrder()">
                    <i class="fas fa-list-ul me-1"></i>
                    Quản Lý Đơn Dịch Vụ
                </button>
                <button type="button" class="btn btn-outline-info btn-sm" onclick="createAnotherOrder()">
                    <i class="fas fa-plus me-1"></i>
                    Tạo Đơn Dịch Vụ Khác
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="navigateToHome()">
                    <i class="fas fa-home me-1"></i>
                    Bảng Điều Khiển Bác Sĩ
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

    showAlert('Form đã được đặt lại. Bạn có thể tạo đơn dịch vụ mới.', 'info');
}

// Hàm tìm kiếm service order theo ID
async function searchServiceOrder() {
    const serviceOrderId = document.getElementById("serviceOrderIdInput").value;

    if (!serviceOrderId) {
        showAlert('Vui lòng nhập Mã Đơn Dịch Vụ', 'danger');
        return;
    }

    await getServiceOrderDetails(parseInt(serviceOrderId));
}

// Hàm tìm kiếm theo medicine record ID
async function searchByMedicineRecord() {
    const medicineRecordId = document.getElementById("medicineRecordIdInput").value;

    if (!medicineRecordId) {
        showAlert('Vui lòng nhập Mã Hồ Sơ Khám Bệnh', 'danger');
        return;
    }

    await getServiceOrderHistory(parseInt(medicineRecordId));
}

// Hàm tìm kiếm theo tên bệnh nhân
async function searchByPatientName() {
    const patientName = document.getElementById("patientNameInput").value;

    if (!patientName || patientName.trim().length < 2) {
        showAlert('Vui lòng nhập tên bệnh nhân ít nhất 2 ký tự', 'danger');
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
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else if (response.status === 404) {
                throw new Error('Không tìm thấy đơn dịch vụ.');
            } else {
                throw new Error('Không thể lấy chi tiết đơn dịch vụ');
            }
        }

        const result = await response.json();

        if (result.success) {
            currentServiceOrderData = result.data;
            console.log('Service order details received:', result.data);
            console.log('Items in response:', result.data.items);
            displayServiceOrderDetails(result.data);
            showAlert('Tải chi tiết đơn dịch vụ thành công!', 'success');
            scrollToSection('serviceOrderDetailsSection', 500);
        } else {
            throw new Error(result.message || 'Không thể lấy chi tiết đơn dịch vụ');
        }

    } catch (error) {
        console.error("Error getting service order details:", error);
        showAlert(error.message || 'Không thể lấy chi tiết đơn dịch vụ. Vui lòng thử lại.', 'danger');
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
                            <p class="mb-0 text-muted">${item.service_description || 'Không có mô tả'}</p>
                            <small class="text-muted">Bác sĩ: ${item.doctor_name || 'N/A'}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <span class="price-badge">${(item.service_price || 0).toLocaleString()} VND</span>
                        </div>
                    </div>
                `;
                serviceItemsList.appendChild(serviceItem);
            });
        } else {
            serviceItemsList.innerHTML = '<div class="alert alert-warning">Không tìm thấy dịch vụ nào cho đơn này.</div>';
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
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else {
                throw new Error('Không thể lấy danh sách đơn dịch vụ theo tên bệnh nhân');
            }
        }

        const result = await response.json();

        if (result.success) {
            currentHistoryData = result.data;
            displayServiceOrderHistory(result.data, `Đơn Dịch Vụ Của Bệnh Nhân: "${patientName}"`);

            if (result.data.length > 0) {
                showAlert(`Tìm thấy ${result.data.length} đơn dịch vụ cho bệnh nhân "${patientName}"`, 'success');
            } else {
                showAlert(`Không tìm thấy đơn dịch vụ nào cho bệnh nhân "${patientName}"`, 'info');
            }
            scrollToSection('serviceOrderHistorySection', 500);
        } else {
            throw new Error(result.message || 'Không thể lấy danh sách đơn dịch vụ theo tên bệnh nhân');
        }

    } catch (error) {
        console.error("Error getting service orders by patient name:", error);
        showAlert(error.message || 'Không thể lấy danh sách đơn dịch vụ theo tên bệnh nhân. Vui lòng thử lại.', 'danger');
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
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else {
                throw new Error('Không thể lấy lịch sử đơn dịch vụ');
            }
        }

        const result = await response.json();

        if (result.success) {
            currentHistoryData = result.data;
            displayServiceOrderHistory(result.data, `Lịch Sử Bệnh Nhân (Mã Hồ Sơ Khám: ${medicineRecordId})`);
            showAlert('Tải lịch sử đơn dịch vụ thành công!', 'success');
            scrollToSection('serviceOrderHistorySection', 500);
        } else {
            throw new Error(result.message || 'Không thể lấy lịch sử đơn dịch vụ');
        }

    } catch (error) {
        console.error("Error getting service order history:", error);
        showAlert(error.message || 'Không thể lấy lịch sử đơn dịch vụ. Vui lòng thử lại.', 'danger');
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
                throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else if (response.status === 403) {
                throw new Error('Truy cập bị từ chối. Yêu cầu vai trò bác sĩ.');
            } else {
                throw new Error('Không thể lấy lịch sử đơn dịch vụ của bác sĩ');
            }
        }

        const result = await response.json();

                if (result.success) {
            currentHistoryData = result.data;
            displayServiceOrderHistory(result.data, 'Lịch Sử Đơn Dịch Vụ Của Tôi');

            if (result.data.length > 0) {
                showAlert(`Đã tải ${result.data.length} đơn dịch vụ`, 'success');
            } else {
                showAlert('Không tìm thấy đơn dịch vụ nào', 'info');
            }
            scrollToSection('serviceOrderHistorySection', 500);
        } else {
            throw new Error(result.message || 'Không thể lấy lịch sử đơn dịch vụ của bác sĩ');
        }

    } catch (error) {
        console.error("Error getting doctor service order history:", error);
        showAlert(error.message || 'Không thể lấy lịch sử đơn dịch vụ của bác sĩ. Vui lòng thử lại.', 'danger');
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
                            <h6><i class="fas fa-file-medical me-2"></i>Đơn #${order.service_order_id}</h6>
                            <small class="text-muted">${formatDateTime(order.order_date)}</small>
                        </div>
                        <div class="col-md-3">
                            <strong>Bệnh Nhân:</strong> ${order.patient_name || 'N/A'}<br>
                            <strong>Bác Sĩ:</strong> ${order.doctor_name || 'N/A'}
                        </div>
                        <div class="col-md-3">
                            <strong>Dịch Vụ:</strong> ${items.length} mục<br>
                            <small class="text-muted">${items.length > 0 ? items.map(item => item.service_name).slice(0, 2).join(', ') + (items.length > 2 ? '...' : '') : 'Không có dịch vụ'}</small>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="price-badge">${totalAmount.toLocaleString()} VND</div>
                            <button class="btn btn-sm btn-outline-primary mt-2" onclick="viewOrderDetails(${order.service_order_id})">
                                <i class="fas fa-eye me-1"></i>Xem Chi Tiết
                            </button>
                        </div>
                    </div>
                `;
                historyList.appendChild(historyItem);
            });
        } else {
            historyList.innerHTML = '<div class="alert alert-info">Không tìm thấy đơn dịch vụ nào.</div>';
        }
    }

    // Ẩn loading và hiển thị content
    loadingSpinner.style.display = "none";
    content.style.display = "block";
}

// Hàm xem chi tiết order từ lịch sử
function viewOrderDetails(serviceOrderId) {
    if (!serviceOrderId) {
        showAlert('Mã đơn dịch vụ không hợp lệ', 'warning');
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
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
        return date.toLocaleString('en-GB');
    } catch (error) {
        return 'Ngày không hợp lệ';
    }
}

// Print function
function printServiceOrder() {
    if (currentServiceOrderData) {
        window.print();
    } else {
        showAlert('Không có dữ liệu để in', 'warning');
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
        showAlert('Chào mừng đến trang Chi Tiết Đơn Dịch Vụ! Sử dụng các hàm tìm kiếm để khám phá đơn dịch vụ, hoặc tạo mới bằng các tham số URL.', 'info');
        console.log('Các hàm debug có sẵn: testConnection(), testAssignedServices(), testViewServiceOrder(id), testViewLatestOrders(), chạyTestsDebug()');
        console.log('Lưu ý: testAssignedServices() sẽ so sánh giữa tất cả các dịch vụ vs các dịch vụ đã giao');
        console.log('Các hàm quản lý trạng thái waitlist có sẵn:');
        console.log('- updateWaitlistStatus(waitlistId, "status") - Cập nhật chỉ trạng thái');
        console.log('- updateWaitlistStatusAndVisittype(waitlistId, "status", "visittype") - Cập nhật cả trạng thái và visittype');
        console.log('- updateWaitlistToWaiting(waitlistId) - Đặt trạng thái="Kết quả", visittype="Đang chờ"');
        console.log('- updateWaitlistToInProgress(waitlistId) - Đặt trạng thái="Đang thực hiện"');
        console.log('- updateWaitlistToSkipped(waitlistId) - Đặt trạng thái="Bỏ qua"');
        console.log('- updateWaitlistToCompleted(waitlistId) - Đặt trạng thái="Hoàn thành"');
        console.log('- demoWaitlistStatusManagement() - Demo tất cả các hàm quản lý trạng thái');
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
            showAlert(`Kết nối thành công! Bác sĩ: ${result.doctor_name} (ID: ${result.doctor_id})`, 'success');
        } else {
            showAlert(`Kết nối thất bại: ${result.message}`, 'danger');
        }
    } catch (error) {
        console.error('Test connection error:', error);
        showAlert(`Lỗi kết nối: ${error.message}`, 'danger');
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
            showAlert(`Tìm thấy ${servicesResult.data.length} dịch vụ tổng cộng, ${assignedResult.success ? assignedResult.data.length : 0} dịch vụ đã giao`, 'success');
            console.log('=== TẤT CẢ DỊCH VỤ ===');
            console.table(servicesResult.data);
            if (assignedResult.success) {
                console.log('=== DỊCH VỤ ĐÃ GIAO ===');
                console.table(assignedResult.data);
            }
        } else {
            showAlert(`Không thể tải dịch vụ: ${servicesResult.message}`, 'danger');
        }
    } catch (error) {
        console.error('Test services error:', error);
        showAlert(`Lỗi tải dịch vụ: ${error.message}`, 'danger');
    }
}

// Function to run all tests
function runDebugTests() {
    console.log('=== Bắt đầu các thử nghiệm debug ===');
    testConnection();
    setTimeout(() => {
        testAssignedServices();
    }, 1000);
}

// Test function to view a service order
async function testViewServiceOrder(serviceOrderId) {
    if (!serviceOrderId) {
        serviceOrderId = prompt('Nhập Mã Đơn Dịch Vụ để thử nghiệm:');
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
            showAlert(`Trạng thái waitlist đã được cập nhật thành "${status}" thành công`, 'success');
            console.log('Trạng thái waitlist đã cập nhật:', result);
            return true;
        } else {
            throw new Error(result.message || result.error || 'Không thể cập nhật trạng thái waitlist');
        }
    } catch (error) {
        console.error("Error updating waitlist status:", error);
        showAlert(error.message || 'Không thể cập nhật trạng thái waitlist', 'danger');
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
            showAlert(`Waitlist đã được cập nhật thành công - Trạng thái: "${status}", Visittype: "${visittype}"`, 'success');
            console.log('Trạng thái và visittype waitlist đã cập nhật:', result);
            return true;
        } else {
            throw new Error(result.message || result.error || 'Không thể cập nhật trạng thái và visittype waitlist');
        }
    } catch (error) {
        console.error("Error updating waitlist status and visittype:", error);
        showAlert(error.message || 'Không thể cập nhật trạng thái và visittype waitlist', 'danger');
        return false;
    }
}

// Các hàm tiện ích cho các trạng thái cụ thể
async function updateWaitlistToWaiting(waitlistId) {
    return await updateWaitlistStatusAndVisittype(waitlistId, 'Kết quả', 'Đang chờ');
}

async function updateWaitlistToInProgress(waitlistId) {
    return await updateWaitlistStatus(waitlistId, 'Đang thực hiện');
}

async function updateWaitlistToSkipped(waitlistId) {
    return await updateWaitlistStatus(waitlistId, 'Bỏ qua');
}

async function updateWaitlistToCompleted(waitlistId) {
    return await updateWaitlistStatus(waitlistId, 'Hoàn thành');
}
