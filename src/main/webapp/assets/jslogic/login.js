const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginBtn = document.getElementById("loginBtn");
const loginText = document.getElementById("loginText");
const loginIcon = document.getElementById("loginIcon");
const loginLoading = document.getElementById("loginLoading");

// Function to show loading state with smooth animation
function showLoading() {
    // Disable button immediately
    loginBtn.disabled = true;
    
    // Smooth transition for button state
    loginBtn.style.opacity = '0.7';
    loginBtn.style.transform = 'scale(0.98)';
    
    // Update text with smooth transition
    loginText.style.transition = 'opacity 0.2s ease-out';
    loginText.style.opacity = '0';
    
    setTimeout(() => {
        loginText.textContent = "Đang đăng nhập...";
        loginText.style.opacity = '1';
    }, 200);
    
    // Update icon with smooth transition
    loginIcon.style.transition = 'opacity 0.2s ease-out';
    loginIcon.style.opacity = '0';
    
    setTimeout(() => {
        loginIcon.innerHTML = '<div class="spinner-border spinner-border-sm" role="status" style="width: 1rem; height: 1rem;"><span class="visually-hidden">Loading...</span></div>';
        loginIcon.style.opacity = '1';
    }, 200);
    
    // Show loading div with fade-in animation
    loginLoading.style.display = "block";
    setTimeout(() => {
        loginLoading.style.opacity = '1';
    }, 50);
}

// Function to hide loading state with smooth animation
function hideLoading() {
    // Enable button
    loginBtn.disabled = false;
    
    // Restore button appearance
    loginBtn.style.opacity = '1';
    loginBtn.style.transform = 'scale(1)';
    
    // Hide loading div with fade-out animation
    loginLoading.style.opacity = '0';
    setTimeout(() => {
        loginLoading.style.display = "none";
    }, 300);
    
    // Update text with smooth transition
    loginText.style.transition = 'opacity 0.2s ease-out';
    loginText.style.opacity = '0';
    
    setTimeout(() => {
        loginText.textContent = "Đăng nhập";
        loginText.style.opacity = '1';
    }, 200);
    
    // Update icon with smooth transition
    loginIcon.style.transition = 'opacity 0.2s ease-out';
    loginIcon.style.opacity = '0';
    
    setTimeout(() => {
        loginIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 8 8" fill="none">
                <path d="M7.32046 4.70834H4.74952V7.25698C4.74952 7.66734 4.41395 8 4 8C3.58605 8 3.25048 7.66734 3.25048 7.25698V4.70834H0.679545C0.293423 4.6687 0 4.34614 0 3.96132C0 3.5765 0.293423 3.25394 0.679545 3.21431H3.24242V0.673653C3.28241 0.290878 3.60778 0 3.99597 0C4.38416 0 4.70954 0.290878 4.74952 0.673653V3.21431H7.32046C7.70658 3.25394 8 3.5765 8 3.96132C8 4.34614 7.70658 4.6687 7.32046 4.70834Z" fill="currentColor"></path>
            </svg>
        `;
        loginIcon.style.opacity = '1';
    }, 200);
}

// Function to show success state
function showSuccess() {
    loginText.style.transition = 'opacity 0.2s ease-out';
    loginText.style.opacity = '0';
    
    setTimeout(() => {
        loginText.textContent = "Đăng nhập thành công!";
        loginText.style.opacity = '1';
        loginText.style.color = '#28a745';
    }, 200);
    
    // Change icon to success
    loginIcon.style.transition = 'opacity 0.2s ease-out';
    loginIcon.style.opacity = '0';
    
    setTimeout(() => {
        loginIcon.innerHTML = '<i class="fas fa-check text-success"></i>';
        loginIcon.style.opacity = '1';
    }, 200);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";
    errorMessage.style.display = "none";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rememberme = document.getElementById("rememberme").checked;

    // Validate input
    if (!username || !password) {
        errorMessage.textContent = "Vui lòng nhập đầy đủ thông tin đăng nhập.";
        errorMessage.style.display = "block";
        errorMessage.style.animation = "shake 0.5s ease-in-out";
        return;
    }

    // Show loading state
    showLoading();

    const contextPath = window.location.pathname.split('/')[1];
    const data = {username, password, rememberme};

    try {
        const res = await fetch("/api/login", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
            // Show success state
            showSuccess();
            
            // Redirect after a short delay to show success message
            setTimeout(() => {
                window.location.href = result.redirectUrl;
            }, 1000);
        } else {
            hideLoading();
            errorMessage.textContent = result.message || "Đăng nhập thất bại.";
            errorMessage.style.display = "block";
            errorMessage.style.animation = "shake 0.5s ease-in-out";
        }

    } catch (err) {
        hideLoading();
        errorMessage.textContent = "Lỗi hệ thống. Vui lòng thử lại sau.";
        errorMessage.style.display = "block";
        errorMessage.style.animation = "shake 0.5s ease-in-out";
        console.error("Login error:", err);
    }
});