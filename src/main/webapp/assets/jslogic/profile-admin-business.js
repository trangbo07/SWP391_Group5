// Load admin business profile on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAdminProfile();
    
    // Handle change password button click from inline script
    const changePasswordBtn = document.querySelector('#change-password-section button');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }
});

// Function to load admin profile
async function loadAdminProfile() {
    try {
        const response = await fetch(contextPath + '/api/admin-business/profile');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = contextPath + '/view/login.html';
                return;
            }
            throw new Error('Failed to load profile');
        }
        
        const profile = await response.json();
        
        // Update profile elements
        updateProfileElements(profile);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('error', 'Failed to load profile information');
    }
}

// Function to update profile elements with data
function updateProfileElements(profile) {
    // Update name
    const nameElement = document.getElementById('doctor-name');
    if (nameElement) {
        nameElement.textContent = profile.fullName || 'N/A';
    }
    
    // Update image if exists
    const imgElement = document.getElementById('doctor-img');
    if (imgElement && profile.img) {
        imgElement.src = profile.img;
    }
    
    // Update department
    const deptElement = document.getElementById('doctor-department');
    if (deptElement) {
        deptElement.textContent = profile.department || 'N/A';
    }
    
    // Update education level (using role as education level for admin)
    const eduElement = document.getElementById('doctor-eduLevel');
    if (eduElement) {
        eduElement.textContent = profile.role || 'Admin Business';
    }
    
    // Update phone
    const phoneElement = document.getElementById('doctor-phone');
    if (phoneElement) {
        phoneElement.textContent = profile.phone || 'N/A';
    }
    
    // Update email
    const emailElement = document.getElementById('doctor-email');
    if (emailElement) {
        emailElement.textContent = profile.email || 'N/A';
    }
    
    // Update username
    const usernameElement = document.getElementById('doctor-username');
    if (usernameElement) {
        usernameElement.textContent = profile.username || 'N/A';
    }
}

// Function to handle password change
async function handleChangePassword() {
    const passwordInput = document.getElementById('change-password');
    const newPassword = passwordInput ? passwordInput.value.trim() : '';
    
    if (!newPassword) {
        showAlert('warning', 'Please enter a new password');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('warning', 'Password must be at least 6 characters long');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'changePassword');
        formData.append('newPassword', newPassword);
        
        const response = await fetch(contextPath + '/api/admin-business/profile', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showAlert('success', 'Password changed successfully!');
            passwordInput.value = '';
            
            // Hide password section after successful change
            const passwordSection = document.getElementById('change-password-section');
            if (passwordSection) {
                passwordSection.style.display = 'none';
            }
        } else {
            showAlert('error', result.message || 'Failed to change password');
        }
        
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('error', 'An error occurred while changing password');
    }
}

// Function to show alerts
function showAlert(type, message) {
    // You can use SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type,
            title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Warning',
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    } else {
        // Fallback to native alert
        alert(message);
    }
}

// Add security level check
function checkSecurityLevel() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        // You can add logic here to calculate actual security level
        // For now, we'll use a placeholder value
        const securityLevel = 85; // This could be calculated based on various factors
        progressBar.style.width = securityLevel + '%';
        
        // Update badge color based on level
        const badge = document.querySelector('.badge.bg-success');
        if (badge) {
            if (securityLevel >= 80) {
                badge.classList.add('bg-success');
                badge.textContent = 'High';
            } else if (securityLevel >= 50) {
                badge.classList.remove('bg-success');
                badge.classList.add('bg-warning');
                badge.textContent = 'Medium';
            } else {
                badge.classList.remove('bg-success');
                badge.classList.add('bg-danger');
                badge.textContent = 'Low';
            }
        }
    }
}

// Call security check on load
document.addEventListener('DOMContentLoaded', checkSecurityLevel); 