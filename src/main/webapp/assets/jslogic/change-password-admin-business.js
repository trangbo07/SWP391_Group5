// Change Password functionality for Admin Business

// Global function for toggling password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + '-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const btnChangePass = document.getElementById('show-change-password');
    const btnSecurity = document.getElementById('show-security-info');
    const sectionChangePass = document.getElementById('change-password-section');
    const sectionSecurity = document.getElementById('security-info-section');
    const changePasswordForm = document.getElementById('change-password-form');
    const cancelChangePassword = document.getElementById('cancel-change-password');
    
    if (!btnChangePass || !changePasswordForm) {
        console.warn('Change password elements not found');
        return;
    }
    
    // Toggle change password section
    btnChangePass.addEventListener('click', function() {
        sectionChangePass.style.display = (sectionChangePass.style.display === 'none' || sectionChangePass.style.display === '') ? 'block' : 'none';
        sectionSecurity.style.display = 'none';
        // Reset form when showing
        if (sectionChangePass.style.display === 'block') {
            changePasswordForm.reset();
            clearValidationErrors();
        }
    });
    
    // Cancel change password
    if (cancelChangePassword) {
        cancelChangePassword.addEventListener('click', function() {
            sectionChangePass.style.display = 'none';
            changePasswordForm.reset();
            clearValidationErrors();
        });
    }
    
    // Handle form submission
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleChangePassword();
    });
    
    // Toggle security info
    if (btnSecurity) {
        btnSecurity.addEventListener('click', function() {
            sectionSecurity.style.display = (sectionSecurity.style.display === 'none' || sectionSecurity.style.display === '') ? 'block' : 'none';
            sectionChangePass.style.display = 'none';
        });
    }
    
    // Functions for password change
    function clearValidationErrors() {
        const inputs = changePasswordForm.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
        const errorDivs = changePasswordForm.querySelectorAll('.invalid-feedback');
        errorDivs.forEach(div => {
            div.textContent = '';
        });
    }
    
    function showValidationError(fieldName, message) {
        const input = document.getElementById(fieldName);
        const errorDiv = document.getElementById(fieldName + '-error');
        if (input && errorDiv) {
            input.classList.add('is-invalid');
            errorDiv.textContent = message;
        }
    }
    
    function handleChangePassword() {
        clearValidationErrors();
        
        const formData = new FormData(changePasswordForm);
        const data = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        // Client-side validation
        let hasError = false;
        
        if (!data.currentPassword) {
            showValidationError('current-password', 'Vui lòng nhập mật khẩu hiện tại');
            hasError = true;
        }
        
        if (!data.newPassword) {
            showValidationError('new-password', 'Vui lòng nhập mật khẩu mới');
            hasError = true;
        } else if (data.newPassword.length < 6) {
            showValidationError('new-password', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            hasError = true;
        }
        
        if (!data.confirmPassword) {
            showValidationError('confirm-password', 'Vui lòng xác nhận mật khẩu mới');
            hasError = true;
        } else if (data.newPassword !== data.confirmPassword) {
            showValidationError('confirm-password', 'Mật khẩu xác nhận không khớp');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Disable submit button
        const submitBtn = document.getElementById('submit-change-password');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
        
        // Send request to server
        fetch('/api/adminbusiness/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: result.message,
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reset form and hide section
                    changePasswordForm.reset();
                    sectionChangePass.style.display = 'none';
                });
            } else {
                // Show error message
                if (result.errors) {
                    // Handle validation errors
                    Object.keys(result.errors).forEach(field => {
                        const fieldName = field === 'currentPassword' ? 'current-password' : 
                                        field === 'newPassword' ? 'new-password' : 'confirm-password';
                        showValidationError(fieldName, result.errors[field]);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: result.message,
                        confirmButtonText: 'OK'
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.',
                confirmButtonText: 'OK'
            });
        })
        .finally(() => {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
    }
}); 