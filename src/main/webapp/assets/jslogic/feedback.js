document.querySelectorAll('.view-feedback-btn').forEach(button => {
    button.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/patient/feedback`, {
                credentials: 'include'
            });
            const data = await response.json();

            const modalBody = document.getElementById('feedbackModalBody');
            if (data.length === 0) {
                modalBody.innerHTML = `<p class="text-muted">Bạn chưa gửi feedback nào.</p>`;
            } else {
                let html = "";
                data.forEach(fb => {
                    html += `
<div class="border p-2 rounded mb-2">
  <p><strong>Bác sĩ:</strong> ${fb.doctor_name || "(Không rõ tên bác sĩ)"}</p>
  <p><strong>Nội dung:</strong> <span class="feedback-content">${fb.content}</span></p>
  <p><small><strong>Thời gian:</strong> ${new Date(fb.created_at_formatted).toLocaleString()}</small></p>
  <button class="btn btn-sm btn-primary update-feedback-btn" 
          data-doctor-id="${fb.doctor_id}" 
          data-content="${fb.content}">
    Cập nhật
  </button>
  <div class="feedback-message text-success mt-1" style="display:none;"></div>
</div>
`;
                });
                modalBody.innerHTML = html;

                // ✅ Gán sự kiện sau khi render các nút update
                document.querySelectorAll('.update-feedback-btn').forEach(updateBtn => {
                    updateBtn.addEventListener('click', () => {
                        const doctorId = updateBtn.dataset.doctorId;
                        const oldContent = updateBtn.dataset.content;

                        const newContent = prompt("📝 Nhập nội dung feedback mới:", oldContent);
                        if (newContent && newContent !== oldContent) {
                            fetch('/api/patient/feedback/update', {
                                method: 'PUT',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ doctorId, newContent })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    const messageBox = updateBtn.parentElement.querySelector('.feedback-message');

                                    if (data.success) {
                                        // ✅ Hiển thị thông báo thành công
                                        messageBox.textContent = "✅ Đã cập nhật feedback!";
                                        messageBox.className = "feedback-message text-success mt-1";
                                        messageBox.style.display = 'block';

                                        // ✅ Cập nhật giao diện luôn
                                        updateBtn.dataset.content = newContent;
                                        updateBtn.parentElement.querySelector('.feedback-content').textContent = newContent;
                                    } else {
                                        // ❌ Hiển thị lỗi
                                        messageBox.textContent = "❌ Không thể cập nhật: " + (data.message || "Lỗi không xác định.");
                                        messageBox.className = "feedback-message text-danger mt-1";
                                        messageBox.style.display = 'block';
                                    }
                                })
                                .catch(err => {
                                    console.error(err);
                                    const messageBox = updateBtn.parentElement.querySelector('.feedback-message');
                                    messageBox.textContent = "❌ Lỗi kết nối đến server.";
                                    messageBox.className = "feedback-message text-danger mt-1";
                                    messageBox.style.display = 'block';
                                });
                        }
                    });
                });
            }

            const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
            feedbackModal.show();
        } catch (err) {
            console.error(err);
            document.getElementById('feedbackModalBody').innerHTML = `<p class="text-danger">❌ Không thể tải feedback.</p>`;
            new bootstrap.Modal(document.getElementById('feedbackModal')).show();
        }
    });
});
