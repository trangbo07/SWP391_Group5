document.addEventListener('DOMContentLoaded', async function () {
    // Gọi API lấy profile (KHÔNG cần truyền patientId)
    try {
        const response = await fetch('/api/patient/profile', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Lỗi khi lấy thông tin bệnh nhân từ API');
        }

        const data = await response.json();

        // Hiển thị thông tin bệnh nhân
        document.getElementById('patient-name').textContent = data.username || "---";
        document.getElementById('patient-phone').textContent = data.phone || "---";
        document.getElementById('patient-email').textContent = data.email || "---";
        document.getElementById('patient-username').textContent = data.username || "---";
        document.getElementById('patient-img').src = data.img || "/img/default-avatar.png";

    } catch (err) {
        console.error('Lỗi khi tải thông tin bệnh nhân:', err);
    }

    // Toggle đổi mật khẩu
    const btnChangePass = document.getElementById('show-change-password');
    const btnSecurity = document.getElementById('show-security-info');
    const sectionChangePass = document.getElementById('change-password-section');
    const sectionSecurity = document.getElementById('security-info-section');

    btnChangePass?.addEventListener('click', function () {
        sectionChangePass.style.display =
            (sectionChangePass.style.display === 'none' || sectionChangePass.style.display === '') ? 'block' : 'none';
    });

    btnSecurity?.addEventListener('click', function () {
        sectionSecurity.style.display =
            (sectionSecurity.style.display === 'none' || sectionSecurity.style.display === '') ? 'block' : 'none';
    });

    // Toggle chi tiết hồ sơ
    const btnProfileDetail = document.getElementById('toggle-profile-detail');
    const sectionProfileDetail = document.getElementById('profile-detail-section');
    let detailOpen = false;

    btnProfileDetail?.addEventListener('click', function () {
        detailOpen = !detailOpen;
        sectionProfileDetail.style.display = detailOpen ? 'block' : 'none';
        btnProfileDetail.innerHTML = detailOpen
            ? '<i class="fas fa-chevron-up me-2"></i>Hide Details'
            : '<i class="fas fa-chevron-down me-2"></i>Show Details';
    });
});
