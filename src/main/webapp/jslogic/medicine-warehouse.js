// Medicine Warehouse Manager
class MedicineWarehouseManager {
    constructor() {
        this.dataTable = null;
        this.medicines = [];
        this.baseUrl = '/medicine-warehouse';
        this.init();
    }

    init() {
        this.loadMedicines();
        this.loadCategories();
        this.loadUnits();
        this.loadWarehouses();
        this.setupFilterButtons();
        this.setupCategoryFilter();
        this.bindEvents();
    }

    bindEvents() {
        // Add medicine button
        const addBtn = document.getElementById('addMedicineBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Modal close events
        const closeBtns = document.querySelectorAll('.close-modal');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Form submission
        const addForm = document.getElementById('addMedicineForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddMedicine(e));
        }

        const updateForm = document.getElementById('updateMedicineForm');
        if (updateForm) {
            updateForm.addEventListener('submit', (e) => this.handleUpdateMedicine(e));
        }

        // Price validation
        this.setupPriceValidation();
    }

    async loadMedicines() {
        try {
            const response = await fetch(this.baseUrl);
            const medicines = await response.json();
            this.medicines = medicines; // Store raw data
            this.updateMedicinesTable(medicines);
        } catch (error) {
            console.error('Error loading medicines:', error);
            this.showErrorMessage('Lỗi tải dữ liệu kho thuốc');
            this.updateMedicinesTable([]);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            const categories = await response.json();
            this.categories = categories; // Store categories for filtering
            this.populateSelect('categoryId', categories, 'category_id', 'categoryName');
            this.populateSelect('updateCategoryId', categories, 'category_id', 'categoryName');
            this.populateCategoryFilter(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadUnits() {
        try {
            const response = await fetch(`${this.baseUrl}/units`);
            const units = await response.json();
            this.populateSelect('unitId', units, 'unit_id', 'unitName');
            this.populateSelect('updateUnitId', units, 'unit_id', 'unitName');
        } catch (error) {
            console.error('Error loading units:', error);
        }
    }

    async loadWarehouses() {
        try {
            const response = await fetch(`${this.baseUrl}/warehouses`);
            const warehouses = await response.json();
            this.populateSelect('warehouseId', warehouses, 'warehouse_id', 'name');
            this.populateSelect('updateWarehouseId', warehouses, 'warehouse_id', 'name');
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    }

    populateSelect(selectId, data, valueKey, textKey) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '<option value="">Chọn...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            select.appendChild(option);
        });
    }

    populateCategoryFilter(categories) {
        const filterSelect = document.getElementById('categoryFilter');
        if (!filterSelect) return;

        filterSelect.innerHTML = '<option value="">Tất cả danh mục</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id;
            option.textContent = category.categoryName;
            filterSelect.appendChild(option);
        });
    }

    setupCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const selectedCategoryId = e.target.value;
                this.filterByCategory(selectedCategoryId);
            });
        }
    }

    filterByCategory(categoryId) {
        const categoryFilter = document.getElementById('categoryFilter');
        
        let filtered = this.medicines;
        
        if (categoryId) {
            filtered = this.medicines.filter(medicine => 
                medicine.category_id === parseInt(categoryId)
            );
            // Add visual feedback for active filter
            if (categoryFilter) {
                categoryFilter.classList.add('filter-active');
            }
        } else {
            // Remove visual feedback when no filter
            if (categoryFilter) {
                categoryFilter.classList.remove('filter-active');
            }
        }
        
        this.updateMedicinesTable(filtered);
    }

    clearAllFilters() {
        // Reset category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = '';
            categoryFilter.classList.remove('filter-active');
        }
        
        // Show all medicines
        this.updateMedicinesTable(this.medicines);
    }

    updateMedicinesTable(medicines) {
        const tbody = document.getElementById('medicinesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        medicines.forEach(medicine => {
            const mappedMedicine = {
                id: medicine.medicine_id,
                fullData: medicine
            };
            
            const row = document.createElement('tr');
            row.id = `medicine-row-${medicine.medicine_id}`;
            row.innerHTML = this.createMedicineRowHTML(mappedMedicine);
            tbody.appendChild(row);
        });
        
        // Update filter counter
        this.updateFilterCounter(medicines.length);
        
        // Reinitialize DataTable if it exists
        if (this.dataTable) {
            this.dataTable.destroy();
        }
        this.dataTable = $("#medicinesTable").DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
            }
        });
    }

    updateFilterCounter(displayedCount) {
        const displayedElement = document.getElementById('displayedCount');
        const totalElement = document.getElementById('totalCount');
        
        if (displayedElement) {
            displayedElement.textContent = displayedCount;
        }
        
        if (totalElement) {
            totalElement.textContent = this.medicines.length;
        }
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
        // Reset category filter when applying other filters
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = '';
            categoryFilter.classList.remove('filter-active');
        }

        let filtered = this.medicines;
        if (type === 'critical') {
            filtered = this.medicines.filter(m => this.getStockStatus(m.quantity) === 'critical');
        } else if (type === 'expiring') {
            filtered = this.medicines.filter(m => this.getExpiryStatus(m.expDate) === 'expiring-soon');
        }
        this.updateMedicinesTable(filtered);
    }

    // CRUD Operations
    showAddModal() {
        const modal = document.getElementById('addMedicineModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('addMedicineForm').reset();
        }
    }

    showUpdateModal(medicine) {
        const modal = document.getElementById('updateMedicineModal');
        if (modal) {
            modal.style.display = 'block';
            this.populateUpdateForm(medicine);
        }
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    populateUpdateForm(medicine) {
        const form = document.getElementById('updateMedicineForm');
        if (!form) return;

        form.querySelector('[name="name"]').value = medicine.fullData.name;
        form.querySelector('[name="unitId"]').value = medicine.fullData.unit_id;
        form.querySelector('[name="categoryId"]').value = medicine.fullData.category_id;
        form.querySelector('[name="ingredient"]').value = medicine.fullData.ingredient || '';
        form.querySelector('[name="usage"]').value = medicine.fullData.usage || '';
        form.querySelector('[name="preservation"]').value = medicine.fullData.preservation || '';
        form.querySelector('[name="manuDate"]').value = this.formatDateForInput(medicine.fullData.manuDate);
        form.querySelector('[name="expDate"]').value = this.formatDateForInput(medicine.fullData.expDate);
        form.querySelector('[name="quantity"]').value = medicine.fullData.quantity;
        form.querySelector('[name="price"]').value = medicine.fullData.price;
        form.querySelector('[name="warehouseId"]').value = medicine.fullData.warehouse_id;
        form.dataset.medicineId = medicine.id;
    }

    async handleAddMedicine(event) {
        event.preventDefault();
        
        // Debug: Log form element
        console.log('=== Form Element Debug ===');
        console.log('Form ID:', event.target.id);
        console.log('Form action:', event.target.action);
        console.log('Form method:', event.target.method);
        
        // Debug: Log all form inputs
        const inputs = event.target.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            console.log(input.name + ' = ' + input.value + ' (type: ' + input.type + ')');
        });
        console.log('==========================');
        
        // Validate form before submission
        if (!this.validateMedicineForm(event.target)) {
            return;
        }
        
        const formData = new FormData(event.target);
        
        // Debug: Log form data
        console.log('=== Form Data for Add ===');
        for (let [key, value] of formData.entries()) {
            console.log(key + ' = ' + value);
        }
        console.log('========================');
        
        try {
            // Convert FormData to JSON for better compatibility
            const formDataObj = {};
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
            }
            
            console.log('=== JSON Data for Add ===');
            console.log(JSON.stringify(formDataObj, null, 2));
            console.log('=========================');
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObj)
            });
            
            const result = await response.json();
            if (result.success) {
                this.showSuccessMessage('Thêm thuốc thành công');
                this.closeModal();
                
                // Add the new medicine to the table immediately
                const newMedicine = {
                    id: result.medicine_id || Date.now(), // Use server ID or fallback
                    fullData: {
                        medicine_id: result.medicine_id || Date.now(),
                        name: formDataObj.name,
                        category_name: this.getCategoryNameById(formDataObj.categoryId),
                        quantity: parseInt(formDataObj.quantity),
                        price: parseFloat(formDataObj.price),
                        expDate: formDataObj.expDate,
                        unit_name: this.getUnitNameById(formDataObj.unitId),
                        warehouse_name: this.getWarehouseNameById(formDataObj.warehouseId),
                        ingredient: formDataObj.ingredient || '',
                        usage: formDataObj.usage || '',
                        preservation: formDataObj.preservation || '',
                        manuDate: formDataObj.manuDate,
                        unit_id: parseInt(formDataObj.unitId),
                        category_id: parseInt(formDataObj.categoryId),
                        warehouse_id: parseInt(formDataObj.warehouseId)
                    }
                };
                
                this.addMedicineToTable(newMedicine);
                this.refreshTableDisplay();
            } else {
                this.showErrorMessage(result.message || 'Thêm thuốc thất bại');
            }
        } catch (error) {
            console.error('Error adding medicine:', error);
            this.showErrorMessage('Lỗi thêm thuốc');
        }
    }

    async handleUpdateMedicine(event) {
        event.preventDefault();
        
        // Validate form before submission
        if (!this.validateMedicineForm(event.target)) {
            return;
        }
        
        const formData = new FormData(event.target);
        const medicineId = event.target.dataset.medicineId;
        
        // Debug: Log form data
        console.log('=== Form Data for Update ===');
        for (let [key, value] of formData.entries()) {
            console.log(key + ' = ' + value);
        }
        console.log('medicineId = ' + medicineId);
        console.log('===========================');
        
        try {
            // Convert FormData to JSON for PUT request
            const formDataObj = {};
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
            }
            
            console.log('=== JSON Data for Update ===');
            console.log(JSON.stringify(formDataObj, null, 2));
            console.log('============================');
            
            const response = await fetch(`${this.baseUrl}/${medicineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObj)
            });
            
            const result = await response.json();
            if (result.success) {
                this.showSuccessMessage('Cập nhật thuốc thành công');
                this.closeModal();
                
                // Update the medicine in the table immediately
                const updatedMedicine = {
                    id: medicineId,
                    fullData: {
                        medicine_id: parseInt(medicineId),
                        name: formDataObj.name,
                        category_name: this.getCategoryNameById(formDataObj.categoryId),
                        quantity: parseInt(formDataObj.quantity),
                        price: parseFloat(formDataObj.price),
                        expDate: formDataObj.expDate,
                        unit_name: this.getUnitNameById(formDataObj.unitId),
                        warehouse_name: this.getWarehouseNameById(formDataObj.warehouseId),
                        ingredient: formDataObj.ingredient || '',
                        usage: formDataObj.usage || '',
                        preservation: formDataObj.preservation || '',
                        manuDate: formDataObj.manuDate,
                        unit_id: parseInt(formDataObj.unitId),
                        category_id: parseInt(formDataObj.categoryId),
                        warehouse_id: parseInt(formDataObj.warehouseId)
                    }
                };
                
                this.updateMedicineInTable(updatedMedicine);
                this.refreshTableDisplay();
            } else {
                this.showErrorMessage(result.message || 'Cập nhật thuốc thất bại');
            }
        } catch (error) {
            console.error('Error updating medicine:', error);
            this.showErrorMessage('Lỗi cập nhật thuốc');
        }
    }

    async editMedicine(medicineId) {
        try {
            const response = await fetch(`${this.baseUrl}/${medicineId}`);
            const medicine = await response.json();
            const mappedMedicine = {
                id: medicine.medicine_id,
                fullData: medicine
            };
            this.showUpdateModal(mappedMedicine);
        } catch (error) {
            console.error('Error loading medicine for edit:', error);
            this.showErrorMessage('Lỗi tải thông tin thuốc');
        }
    }

    async deleteMedicine(medicineId) {
        if (!confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${medicineId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            if (result.success) {
                this.showSuccessMessage('Xóa thuốc thành công');
                this.removeMedicineFromTable(medicineId);
                this.refreshTableDisplay();
            } else {
                this.showErrorMessage(result.message || 'Xóa thuốc thất bại');
            }
        } catch (error) {
            console.error('Error deleting medicine:', error);
            this.showErrorMessage('Lỗi xóa thuốc');
        }
    }

    // Helper methods
    getStockStatus(quantity) {
        if (quantity <= 10) return 'critical';
        if (quantity <= 50) return 'low';
        if (quantity <= 100) return 'moderate';
        return 'good';
    }

    getStockStatusLabel(quantity) {
        if (quantity <= 10) return 'Nguy Hiểm';
        if (quantity <= 50) return 'Thấp';
        if (quantity <= 100) return 'Trung Bình';
        return 'Tốt';
    }

    getExpiryStatus(expDate) {
        if (!expDate) return 'good';
        const daysToExpiry = this.getDaysToExpiry(expDate);
        if (daysToExpiry <= 30) return 'expiring-soon';
        if (daysToExpiry <= 90) return 'monitor';
        return 'good';
    }

    getExpiryStatusLabel(expDate) {
        if (!expDate) return 'Tốt';
        const daysToExpiry = this.getDaysToExpiry(expDate);
        if (daysToExpiry <= 30) return 'Sắp Hết Hạn';
        if (daysToExpiry <= 90) return 'Theo Dõi';
        return 'Tốt';
    }

    getDaysToExpiry(expDate) {
        if (!expDate) return 0;
        const today = new Date();
        const expiry = new Date(expDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Helper methods for real-time updates
    getCategoryNameById(categoryId) {
        const categorySelect = document.getElementById('categoryId');
        if (categorySelect) {
            const option = categorySelect.querySelector(`option[value="${categoryId}"]`);
            return option ? option.textContent : 'N/A';
        }
        return 'N/A';
    }

    getUnitNameById(unitId) {
        const unitSelect = document.getElementById('unitId');
        if (unitSelect) {
            const option = unitSelect.querySelector(`option[value="${unitId}"]`);
            return option ? option.textContent : 'N/A';
        }
        return 'N/A';
    }

    getWarehouseNameById(warehouseId) {
        const warehouseSelect = document.getElementById('warehouseId');
        if (warehouseSelect) {
            const option = warehouseSelect.querySelector(`option[value="${warehouseId}"]`);
            return option ? option.textContent : 'N/A';
        }
        return 'N/A';
    }

    addMedicineToTable(medicine) {
        // Add to medicines array
        this.medicines.push(medicine.fullData);
        
        // Add to table
        const tbody = document.getElementById('medicinesTableBody');
        if (!tbody) return;

        const row = document.createElement('tr');
        row.id = `medicine-row-${medicine.id}`;
        row.innerHTML = this.createMedicineRowHTML(medicine);
        tbody.appendChild(row);
    }

    updateMedicineInTable(medicine) {
        // Update in medicines array
        const index = this.medicines.findIndex(m => m.medicine_id === medicine.fullData.medicine_id);
        if (index !== -1) {
            this.medicines[index] = medicine.fullData;
        }
        
        // Update in table
        const row = document.getElementById(`medicine-row-${medicine.id}`);
        if (row) {
            row.innerHTML = this.createMedicineRowHTML(medicine);
        }
    }

    removeMedicineFromTable(medicineId) {
        // Remove from medicines array
        this.medicines = this.medicines.filter(m => m.medicine_id !== parseInt(medicineId));
        
        // Remove from table
        const row = document.getElementById(`medicine-row-${medicineId}`);
        if (row) {
            row.remove();
        }
    }

    refreshTableDisplay() {
        // Trigger any table refresh events if needed
        const event = new Event('tableUpdated');
        document.dispatchEvent(event);
    }

    createMedicineRowHTML(medicine) {
        const stockStatus = this.getStockStatus(medicine.fullData.quantity);
        const stockStatusLabel = this.getStockStatusLabel(medicine.fullData.quantity);
        const expiryStatus = this.getExpiryStatus(medicine.fullData.expDate);
        const expiryStatusLabel = this.getExpiryStatusLabel(medicine.fullData.expDate);
        const daysToExpiry = this.getDaysToExpiry(medicine.fullData.expDate);

        return `
            <td>
                <div class="d-flex align-items-center">
                    <div class="medicine-info">
                        <h6 class="mb-0">${medicine.fullData.name}</h6>
                        <small class="text-muted">${medicine.fullData.unit_name}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-primary">${medicine.fullData.category_name}</span>
            </td>
            <td>
                <span class="fw-bold">${this.formatNumber(medicine.fullData.quantity)}</span>
            </td>
            <td>
                <span class="badge bg-${this.getStatusBadgeClass(stockStatus)}">${stockStatusLabel}</span>
            </td>
            <td>
                <span class="fw-bold text-success">${this.formatCurrency(medicine.fullData.price)}</span>
            </td>
            <td>
                <span class="text-muted">${this.formatDate(medicine.fullData.expDate)}</span>
            </td>
            <td>
                <span class="badge bg-${this.getStatusBadgeClass(expiryStatus)}">${expiryStatusLabel}</span>
            </td>
            <td>
                <span class="text-${daysToExpiry <= 30 ? 'expiring-soon' : daysToExpiry <= 90 ? 'monitor' : 'good'}">
                    ${daysToExpiry} ngày
                </span>
            </td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-primary" onclick="medicineWarehouseManager.editMedicine(${medicine.fullData.medicine_id})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="medicineWarehouseManager.deleteMedicine(${medicine.fullData.medicine_id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
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

    showSuccessMessage(msg) {
        if (window.Swal) {
            Swal.fire('Thành công', msg, 'success');
        } else {
            alert(msg);
        }
    }

    showErrorMessage(msg) {
        if (window.Swal) {
            Swal.fire('Lỗi', msg, 'error');
        } else {
            alert(msg);
        }
    }

    setupPriceValidation() {
        const priceInputs = ['price', 'updatePrice'];
        
        priceInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (value && !this.isValidPrice(value)) {
                        e.target.setCustomValidity('Giá phải là số nguyên dương');
                    } else {
                        e.target.setCustomValidity('');
                    }
                });

                input.addEventListener('blur', (e) => {
                    const value = e.target.value;
                    if (value) {
                        // Format giá khi blur
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue > 0) {
                            e.target.value = numValue;
                        }
                    }
                });
            }
        });
    }

    isValidPrice(value) {
        const numValue = parseInt(value);
        return !isNaN(numValue) && numValue > 0 && Number.isInteger(numValue);
    }

    validateMedicineForm(form) {
        const name = form.querySelector('[name="name"]').value.trim();
        const categoryId = form.querySelector('[name="categoryId"]').value;
        const unitId = form.querySelector('[name="unitId"]').value;
        const warehouseId = form.querySelector('[name="warehouseId"]').value;
        const quantity = form.querySelector('[name="quantity"]').value;
        const price = form.querySelector('[name="price"]').value;
        const manuDate = form.querySelector('[name="manuDate"]').value;
        const expDate = form.querySelector('[name="expDate"]').value;

        // Validate required fields
        if (!name) {
            this.showErrorMessage('Vui lòng nhập tên thuốc');
            return false;
        }

        if (!categoryId) {
            this.showErrorMessage('Vui lòng chọn danh mục');
            return false;
        }

        if (!unitId) {
            this.showErrorMessage('Vui lòng chọn đơn vị');
            return false;
        }

        if (!warehouseId) {
            this.showErrorMessage('Vui lòng chọn kho');
            return false;
        }

        if (!quantity || quantity <= 0) {
            this.showErrorMessage('Vui lòng nhập số lượng hợp lệ');
            return false;
        }

        if (!price || !this.isValidPrice(price)) {
            this.showErrorMessage('Vui lòng nhập giá hợp lệ');
            return false;
        }

        if (!manuDate) {
            this.showErrorMessage('Vui lòng chọn ngày sản xuất');
            return false;
        }

        if (!expDate) {
            this.showErrorMessage('Vui lòng chọn ngày hết hạn');
            return false;
        }

        // Validate date logic
        const manuDateObj = new Date(manuDate);
        const expDateObj = new Date(expDate);
        const today = new Date();

        if (manuDateObj > today) {
            this.showErrorMessage('Ngày sản xuất không thể lớn hơn ngày hiện tại');
            return false;
        }

        if (expDateObj <= manuDateObj) {
            this.showErrorMessage('Ngày hết hạn phải lớn hơn ngày sản xuất');
            return false;
        }

        return true;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.medicineWarehouseManager = new MedicineWarehouseManager();
}); 