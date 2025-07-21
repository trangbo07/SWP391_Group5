// Avatar upload logic for profile-doctor.html
if (document.getElementById('avatarUploadBtn')) {
    let selectedFile = null;
    const fileInput = document.getElementById('avatarInput');
    const imgTag = document.getElementById('doctor-img');
    const resultDiv = document.getElementById('avatarUploadResult');
    const loadingDiv = document.getElementById('avatarLoading');
    let originalImgSrc = imgTag ? imgTag.src : '';
    let previewUrl = null;

    // Khi chọn file, chỉ preview (không đổi src thật)
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                previewUrl = URL.createObjectURL(fileInput.files[0]);
                imgTag.src = previewUrl;
                selectedFile = fileInput.files[0];
            } else {
                imgTag.src = originalImgSrc;
                selectedFile = null;
            }
        });
    }

    document.getElementById('avatarUploadBtn').addEventListener('click', async function() {
        resultDiv.textContent = '';
        if (!selectedFile) {
            resultDiv.textContent = 'Vui lòng chọn ảnh.';
            return;
        }
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
            if (loadingDiv) loadingDiv.style.display = 'flex';
            // Upload to imgbb
            const imgbbRes = await fetch('https://api.imgbb.com/1/upload?key=6e5a2b7d14ba6b9677de0b419a4577f1', {
                method: 'POST',
                body: formData
            });
            const imgbbData = await imgbbRes.json();
            if (!imgbbData.success) {
                resultDiv.textContent = 'Upload ảnh lên imgbb thất bại.';
                if (loadingDiv) loadingDiv.style.display = 'none';
                return;
            }
            const imageUrl = imgbbData.data.url;
            // Cập nhật ảnh đại diện trên giao diện bằng link thực tế
            if (imgTag) imgTag.src = imageUrl;
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                previewUrl = null;
            }
            // Gửi URL lên backend với context path đúng
            const pathParts = window.location.pathname.split('/');
            let contextPath = '';
            if (pathParts.length > 1 && pathParts[1] !== 'view') {
                contextPath = '/' + pathParts[1];
            }
            const apiPath = contextPath + '/api/upload-image';
            const backendRes = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'imageUrl=' + encodeURIComponent(imageUrl)
            });
            // Đọc body 1 lần, parse JSON
            let backendText = await backendRes.text();
            let backendData;
            try {
                backendData = JSON.parse(backendText);
            } catch (e) {
                resultDiv.textContent = 'Lỗi: Không phải JSON!\nServer trả về: ' + backendText;
                return;
            }
            if (backendData.success) {
                resultDiv.textContent = 'Cập nhật ảnh đại diện thành công!';
                selectedFile = null;
                originalImgSrc = imageUrl;
            } else {
                resultDiv.textContent = 'Lưu ảnh vào hệ thống thất bại: ' + backendData.message;
            }
        } catch (err) {
            resultDiv.textContent = 'Lỗi: ' + err;
        } finally {
            if (loadingDiv) loadingDiv.style.display = 'none';
        }
    });
} 