// Invoice Creation JavaScript Logic
class InvoiceManager {
    constructor() {
        this.services = [];
        this.medications = [];
        this.allServices = [];
        this.allMedicines = [];
        this.init();
    }

    init() {
        this.loadServices();
        this.loadMedicines();
        this.bindEvents();
    }

    bindEvents() {
        $('#loadPatientBtn').click(() => this.loadPatientInfo());
        $('#addServiceBtn').click(() => $('#serviceModal').modal('show'));
        $('#addMedicationBtn').click(() => $('#medicationModal').modal('show'));
        $('#addServiceConfirm').click(() => this.addService());
        $('#addMedicationConfirm').click(() => this.addMedication());
        $('#serviceSelect').change(() => this.updateServicePrice());
        $('#medicationSelect').change(() => this.updateMedicationPrice());
        $('#serviceQuantity').on('input', () => this.updateServicePrice());
        $('#medicationQuantity').on('input', () => this.updateMedicationPrice());
        $('#invoiceForm').submit((e) => this.submitInvoice(e));
    }

    loadServices() {
        $.get('/create-invoice?action=getServices')
            .done((data) => {
                this.allServices = data;
                const select = $('#serviceSelect');
                select.empty().append('<option value="">Chọn dịch vụ...</option>');
                data.forEach(service => {
                    select.append(`<option value="${service.service_id}" data-price="${service.price}">${service.service_name}</option>`);
                });
            })
            .fail(() => {
                Swal.fire('Lỗi', 'Không thể tải danh sách dịch vụ', 'error');
            });
    }

    loadMedicines() {
        $.get('/create-invoice?action=getMedicines')
            .done((data) => {
                this.allMedicines = data;
                const select = $('#medicationSelect');
                select.empty().append('<option value="">Chọn thuốc...</option>');
                data.forEach(medicine => {
                    select.append(`<option value="${medicine.medicine_id}" data-price="${medicine.price}">${medicine.medicine_name}</option>`);
                });
            })
            .fail(() => {
                Swal.fire('Lỗi', 'Không thể tải danh sách thuốc', 'error');
            });
    }

    loadPatientInfo() {
        const patientId = $('#patientId').val();
        if (!patientId) {
            Swal.fire('Lỗi', 'Vui lòng nhập mã bệnh nhân', 'warning');
            return;
        }

        $.get(`/create-invoice?action=getPatientInfo&patientId=${patientId}`)
            .done((data) => {
                if (data && data.patient_name) {
                    $('#patientName').val(data.patient_name);
                    $('#medicineRecordId').val(data.medicineRecord_id);
                    $('#diagnosis').val(data.diagnosis);
                    $('#treatmentPlan').val(data.treatment_plan);
                    
                    Swal.fire('Thành công', 'Đã tải thông tin bệnh nhân', 'success');
                } else {
                    Swal.fire('Lỗi', 'Không tìm thấy thông tin bệnh nhân', 'error');
                }
            })
            .fail(() => {
                Swal.fire('Lỗi', 'Không thể tải thông tin bệnh nhân', 'error');
            });
    }

    updateServicePrice() {
        const selected = $('#serviceSelect option:selected');
        const price = selected.data('price') || 0;
        const quantity = parseInt($('#serviceQuantity').val()) || 1;
        $('#servicePrice').val(this.formatCurrency(price * quantity));
    }

    updateMedicationPrice() {
        const selected = $('#medicationSelect option:selected');
        const price = selected.data('price') || 0;
        const quantity = parseInt($('#medicationQuantity').val()) || 1;
        $('#medicationPrice').val(this.formatCurrency(price * quantity));
    }

    addService() {
        const select = $('#serviceSelect');
        const serviceId = select.val();
        const serviceName = select.find('option:selected').text();
        const quantity = parseInt($('#serviceQuantity').val());
        const unitPrice = parseFloat(select.find('option:selected').data('price'));
        const totalPrice = unitPrice * quantity;

        if (!serviceId || !quantity || quantity <= 0) {
            Swal.fire('Lỗi', 'Vui lòng chọn dịch vụ và nhập số lượng hợp lệ', 'warning');
            return;
        }

        const service = {
            itemId: parseInt(serviceId),
            itemName: serviceName,
            itemType: 'Service',
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            description: ''
        };

        this.services.push(service);
        this.renderServicesTable();
        this.updateTotalAmount();
        $('#serviceModal').modal('hide');
        
        // Reset form
        $('#serviceSelect').val('');
        $('#serviceQuantity').val(1);
        $('#servicePrice').val('');
    }

    addMedication() {
        const select = $('#medicationSelect');
        const medicationId = select.val();
        const medicationName = select.find('option:selected').text();
        const quantity = parseInt($('#medicationQuantity').val());
        const unitPrice = parseFloat(select.find('option:selected').data('price'));
        const totalPrice = unitPrice * quantity;

        if (!medicationId || !quantity || quantity <= 0) {
            Swal.fire('Lỗi', 'Vui lòng chọn thuốc và nhập số lượng hợp lệ', 'warning');
            return;
        }

        const medication = {
            itemId: parseInt(medicationId),
            itemName: medicationName,
            itemType: 'Medication',
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            description: ''
        };

        this.medications.push(medication);
        this.renderMedicationsTable();
        this.updateTotalAmount();
        $('#medicationModal').modal('hide');
        
        // Reset form
        $('#medicationSelect').val('');
        $('#medicationQuantity').val(1);
        $('#medicationPrice').val('');
    }

    renderServicesTable() {
        const tbody = $('#servicesTableBody');
        tbody.empty();
        
        this.services.forEach((service, index) => {
            tbody.append(`
                <tr>
                    <td>${service.itemName}</td>
                    <td>${service.quantity}</td>
                    <td>${this.formatCurrency(service.unitPrice)}</td>
                    <td>${this.formatCurrency(service.totalPrice)}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm" onclick="invoiceManager.removeService(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    renderMedicationsTable() {
        const tbody = $('#medicationsTableBody');
        tbody.empty();
        
        this.medications.forEach((medication, index) => {
            tbody.append(`
                <tr>
                    <td>${medication.itemName}</td>
                    <td>${medication.quantity}</td>
                    <td>${this.formatCurrency(medication.unitPrice)}</td>
                    <td>${this.formatCurrency(medication.totalPrice)}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm" onclick="invoiceManager.removeMedication(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    removeService(index) {
        this.services.splice(index, 1);
        this.renderServicesTable();
        this.updateTotalAmount();
    }

    removeMedication(index) {
        this.medications.splice(index, 1);
        this.renderMedicationsTable();
        this.updateTotalAmount();
    }

    updateTotalAmount() {
        let total = 0;
        this.services.forEach(service => total += service.totalPrice);
        this.medications.forEach(medication => total += medication.totalPrice);
        $('#totalAmount').text(this.formatCurrency(total));
    }

    submitInvoice(e) {
        e.preventDefault();
        
        const patientId = $('#patientId').val();
        const medicineRecordId = $('#medicineRecordId').val();
        const patientName = $('#patientName').val();
        
        if (!patientId || !medicineRecordId || !patientName) {
            Swal.fire('Lỗi', 'Vui lòng tải thông tin bệnh nhân trước khi tạo hóa đơn', 'warning');
            return;
        }

        if (this.services.length === 0 && this.medications.length === 0) {
            Swal.fire('Lỗi', 'Vui lòng thêm ít nhất một dịch vụ hoặc thuốc', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('medicineRecordId', medicineRecordId);
        formData.append('doctorId', $('#doctorId').val());
        formData.append('patientName', patientName);
        formData.append('diagnosis', $('#diagnosis').val());
        formData.append('treatmentPlan', $('#treatmentPlan').val());
        formData.append('notes', $('#notes').val());
        formData.append('services', JSON.stringify(this.services));
        formData.append('medications', JSON.stringify(this.medications));

        $('#submitBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...');

        $.ajax({
            url: '/invoice/create',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: response.message,
                        showConfirmButton: true
                    }).then(() => {
                        window.location.href = '/view/doctor-dashboard.html';
                    });
                } else {
                    Swal.fire('Lỗi', response.message, 'error');
                }
            },
            error: () => {
                Swal.fire('Lỗi', 'Có lỗi xảy ra khi tạo hóa đơn', 'error');
            },
            complete: () => {
                $('#submitBtn').prop('disabled', false).html('<i class="fas fa-save me-2"></i>Tạo hóa đơn');
            }
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
}

// Global functions for onclick events
function removeService(index) {
    if (window.invoiceManager) {
        window.invoiceManager.removeService(index);
    }
}

function removeMedication(index) {
    if (window.invoiceManager) {
        window.invoiceManager.removeMedication(index);
    }
}

// Initialize when document is ready
$(document).ready(function() {
    window.invoiceManager = new InvoiceManager();
}); 