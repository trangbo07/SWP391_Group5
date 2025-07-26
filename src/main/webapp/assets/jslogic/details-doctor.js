console.log('Script loaded');

// Đảm bảo DOM đã sẵn sàng
function initializeScript() {
    console.log('Initializing script...');
    
    // Load profile data
    loadProfileData();
    
    // Setup event listeners
    setupEventListeners();
}

async function loadProfileData() {
    try {
        const contextPath = window.contextPath || '';
        const response = await fetch(contextPath + '/api/doctor/profile', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('error upload details from api');
        }

        const data = await response.json();

        document.getElementById('doctor-name').textContent = data.fullName;
        document.getElementById('doctor-department').textContent = data.department;
        document.getElementById('doctor-eduLevel').textContent = data.eduLevel;
        document.getElementById('doctor-phone').textContent = data.phone;
        document.getElementById('doctor-email').textContent = data.email;
        document.getElementById('doctor-username').textContent = data.username;
        document.getElementById('doctor-img').src = data.img;

    } catch (err) {
        console.error('error upload details doctor:', err);
    }
}

function setupEventListeners() {
    // Account Center toggles
    const btnChangePass = document.getElementById('show-change-password');
    const btnSecurity = document.getElementById('show-security-info');
    const sectionChangePass = document.getElementById('change-password-section');
    const sectionSecurity = document.getElementById('security-info-section');
    
    console.log('Button elements found:', {
        btnChangePass: !!btnChangePass,
        btnSecurity: !!btnSecurity,
        sectionChangePass: !!sectionChangePass,
        sectionSecurity: !!sectionSecurity
    });
    
    if (btnChangePass && sectionChangePass) {
        console.log('Adding click listener to change password button');
        btnChangePass.onclick = function(e) {
            e.preventDefault();
            console.log('Change password button clicked');
            const currentDisplay = sectionChangePass.style.display;
            console.log('Current display:', currentDisplay);
            sectionChangePass.style.display = (currentDisplay === 'none' || currentDisplay === '') ? 'block' : 'none';
            console.log('New display:', sectionChangePass.style.display);
            if (sectionSecurity) {
                sectionSecurity.style.display = 'none';
            }
        };
    } else {
        console.log('Button or section not found:', {
            btnChangePass: btnChangePass,
            sectionChangePass: sectionChangePass
        });
    }
    
    if (btnSecurity && sectionSecurity) {
        btnSecurity.onclick = function() {
            const currentDisplay = sectionSecurity.style.display;
            sectionSecurity.style.display = (currentDisplay === 'none' || currentDisplay === '') ? 'block' : 'none';
            if (sectionChangePass) {
                sectionChangePass.style.display = 'none';
            }
        };
    }
    
    // Profile Card toggle
    const btnProfileDetail = document.getElementById('toggle-profile-detail');
    const sectionProfileDetail = document.getElementById('profile-detail-section');
    let detailOpen = false;
    
    if (btnProfileDetail && sectionProfileDetail) {
        btnProfileDetail.onclick = function() {
            detailOpen = !detailOpen;
            if(detailOpen) {
                sectionProfileDetail.style.display = 'block';
                btnProfileDetail.innerHTML = '<i class="fas fa-chevron-up me-2"></i>Ẩn chi tiết';
            } else {
                sectionProfileDetail.style.display = 'none';
                btnProfileDetail.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Hiển thị chi tiết';
            }
        };
    }
    
    // Password change functionality
    const confirmChangePasswordBtn = document.getElementById('confirm-change-password');
    if (confirmChangePasswordBtn) {
        confirmChangePasswordBtn.onclick = handleChangePassword;
    }
    
    // Enter key support for password fields
    const passwordFields = ['old-password', 'new-password', 'confirm-password'];
    passwordFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    handleChangePassword();
                }
            };
        }
    });
    
    // Real-time password validation
    const newPasswordField = document.getElementById('new-password');
    if (newPasswordField) {
        newPasswordField.addEventListener('input', function() {
            validatePasswordRealTime(this.value);
        });
    }
}

// Function to show alert
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Function to validate password strength
function validatePassword(password) {
    const errors = [];
    
    // Kiểm tra độ dài
    if (password.length < 8) {
        errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    
    if (password.length > 30) {
        errors.push('Mật khẩu không được quá 30 ký tự');
    }
    
    // Kiểm tra chữ hoa đầu
    if (!/^[A-Z]/.test(password)) {
        errors.push('Mật khẩu phải bắt đầu bằng chữ hoa');
    }
    
    // Kiểm tra có ít nhất 1 số
    if (!/\d/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 số');
    }
    
    // Kiểm tra có ít nhất 1 ký tự đặc biệt
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }
    
    return errors;
}

// Function to validate password in real-time
function validatePasswordRealTime(password) {
    // Kiểm tra độ dài
    const lengthValid = password.length >= 8 && password.length <= 30;
    updateRequirement('req-length', lengthValid);
    
    // Kiểm tra chữ hoa đầu
    const uppercaseValid = /^[A-Z]/.test(password);
    updateRequirement('req-uppercase', uppercaseValid);
    
    // Kiểm tra có ít nhất 1 số
    const numberValid = /\d/.test(password);
    updateRequirement('req-number', numberValid);
    
    // Kiểm tra có ít nhất 1 ký tự đặc biệt
    const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    updateRequirement('req-special', specialValid);
}

// Function to update requirement indicator
function updateRequirement(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (element) {
        const icon = element.querySelector('i');
        if (isValid) {
            icon.className = 'fas fa-check text-success';
        } else {
            icon.className = 'fas fa-times text-danger';
        }
    }
}

// Function to handle password change
async function handleChangePassword() {
    const contextPath = window.contextPath || '';
    const oldPassword = document.getElementById('old-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
        showAlert('warning', 'Vui lòng nhập đầy đủ thông tin.');
        return;
    }
    
    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
        showAlert('warning', passwordErrors.join('. '));
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('warning', 'Xác nhận mật khẩu không khớp.');
        return;
    }
    
    if (oldPassword === newPassword) {
        showAlert('warning', 'Mật khẩu mới không được trùng với mật khẩu cũ.');
        return;
    }
    
    try {
        const response = await fetch(contextPath + '/api/doctor/profile?action=changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showAlert('success', result.message);
            
            // Clear form
            document.getElementById('old-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            
            // Hide password section
            const passwordSection = document.getElementById('change-password-section');
            if (passwordSection) {
                passwordSection.style.display = 'none';
            }
        } else {
            showAlert('error', result.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
        }
        
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('error', 'Có lỗi xảy ra khi kết nối đến máy chủ.');
    }
}

// Khởi tạo khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
} else {
    initializeScript();
}