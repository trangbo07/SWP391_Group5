// Medicine Warehouse Manager
class MedicineWarehouseManager {
    constructor() {
        this.dataTable = null;
        this.medicines = [];
        this.init();
    }

    init() {
        this.loadMedicines();
        this.setupFilterButtons();
    }

    async loadMedicines() {
        // Gọi API lấy dữ liệu kho thuốc
        try {
            const response = await fetch('/api/medicine/warehouse');
            if (!response.ok) throw new Error('Lỗi tải dữ liệu kho thuốc');
            const result = await response.json();
            if (result.success) {
                // Map lại dữ liệu cho đúng với backend mới
                this.medicines = (result.data || []).map(med => ({
                    name: med.medicine_name,
                    category: med.category,
                    stock: med.current_stock,
                    stockStatus: (med.stock_status || '').toLowerCase().replace(' ', '-'),
                    stockStatusLabel: med.stock_status,
                    price: med.price,
                    expiryDate: med.expiration_date,
                    expiryStatus: (med.expiry_status || '').toLowerCase().replace(' ', '-'),
                    expiryStatusLabel: med.expiry_status,
                    daysLeft: med.days_to_expiry
                }));
                this.updateMedicinesTable(this.medicines);
            } else {
                throw new Error(result.message || 'Không có dữ liệu kho thuốc');
            }
        } catch (error) {
            this.showErrorMessage(error.message);
            this.updateMedicinesTable([]);
        }
    }

    updateMedicinesTable(medicines) {
        const tbody = document.getElementById('medicinesTableBody');
        tbody.innerHTML = '';
        medicines.forEach(med => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${med.name}</td>
                <td>${med.category}</td>
                <td>${this.formatNumber(med.stock)}</td>
                <td><span class="status-badge ${this.getStatusBadgeClass(med.stockStatus)}">${med.stockStatusLabel}</span></td>
                <td>${this.formatCurrency(med.price)}</td>
                <td>${med.expiryDate}</td>
                <td><span class="status-badge ${this.getStatusBadgeClass(med.expiryStatus)}">${med.expiryStatusLabel}</span></td>
                <td>${med.daysLeft}</td>
            `;
            tbody.appendChild(tr);
        });
        if (this.dataTable) {
            this.dataTable.destroy();
        }
        this.dataTable = $("#medicinesTable").DataTable();
    }

    setupFilterButtons() {
        document.querySelectorAll('.btn-group button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = btn.getAttribute('onclick').match(/filterMedicines\('(.+?)'\)/)[1];
                this.filterMedicines(type);
            });
        });
    }

    filterMedicines(type) {
        let filtered = this.medicines;
        if (type === 'critical') {
            filtered = this.medicines.filter(m => m.stockStatus === 'critical');
        } else if (type === 'expiring') {
            filtered = this.medicines.filter(m => m.expiryStatus === 'expiring-soon');
        }
        this.updateMedicinesTable(filtered);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    }
    formatNumber(number) {
        return new Intl.NumberFormat('vi-VN').format(number || 0);
    }
    getStatusBadgeClass(status) {
        switch (status) {
            case 'critical': return 'critical';
            case 'low': return 'low';
            case 'moderate': return 'moderate';
            case 'good': return 'good';
            case 'expiring-soon': return 'expiring-soon';
            case 'monitor': return 'monitor';
            default: return '';
        }
    }
    showErrorMessage(msg) {
        if (window.Swal) {
            Swal.fire('Lỗi', msg, 'error');
        } else {
            alert(msg);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.medicineWarehouseManager = new MedicineWarehouseManager();
}); 