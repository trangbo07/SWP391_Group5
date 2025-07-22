$(function() {
    // Tạo bệnh nhân mới
    $('#patientForm').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/receptionist/patient',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(Object.fromEntries(new FormData(this))),
            success: function(data) {
                alert('Tạo bệnh nhân thành công! ID: ' + data.patient_id);
                $('#patientIdInput').val(data.patient_id);
                $('#appointmentSection').show();
                loadDoctors();
            },
            error: function() {
                alert('Tạo bệnh nhân thất bại!');
            }
        });
    });

    // Tạo lịch hẹn mới
    $('#appointmentForm').on('submit', function(e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(this));
        $.ajax({
            url: '/api/receptionist/appointment',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function() {
                alert('Tạo lịch hẹn thành công!');
                location.reload();
            },
            error: function() {
                alert('Tạo lịch hẹn thất bại!');
            }
        });
    });

    function loadDoctors() {
        $.get('/api/receptionist/doctors', function(data) {
            const select = $('#doctorSelect');
            select.empty().append('<option value="">Chọn bác sĩ...</option>');
            data.forEach(doc => {
                select.append(`<option value="${doc.doctor_id}">${doc.full_name} (${doc.specialty})</option>`);
            });
        });
    }
}); 