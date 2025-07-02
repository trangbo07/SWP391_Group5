// Services Management JavaScript

class ServicesManager {
    constructor() {
        this.servicesData = [];
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.loadServices();
        this.bindEvents();
    }

    bindEvents() {
        // Add Service Form
        const saveBtn = document.getElementById('saveServiceBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => this.handleAddService(e));
        }

        // Update Service Form
        const updateBtn = document.getElementById('updateServiceBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', (e) => this.handleUpdateService(e));
        }

        // Form Reset on Modal Close
        const addModal = document.getElementById('offcanvasServiceAdd');
        if (addModal) {
            addModal.addEventListener('hidden.bs.offcanvas', () => this.resetAddForm());
        }

        const editModal = document.getElementById('offcanvasServiceEdit');
        if (editModal) {
            editModal.addEventListener('hidden.bs.offcanvas', () => this.resetEditForm());
        }

        // Search box event with debounce
        const searchInput = document.getElementById('serviceSearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                
                // Show/hide clear button
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = value ? 'block' : 'none';
                }
                
                // Clear previous timeout
                clearTimeout(searchTimeout);
                
                // Set new timeout for debouncing
                searchTimeout = setTimeout(() => {
                    if (value === '') {
                        this.loadServices();
                    } else {
                        this.searchServicesByName(value);
                    }
                }, 300); // 300ms delay
            });
            
            // Also handle Enter key for immediate search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(searchTimeout);
                    const value = e.target.value.trim();
                    if (value === '') {
                        this.loadServices();
                    } else {
                        this.searchServicesByName(value);
                    }
                }
            });
        }
        
        // Clear search button event
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    clearSearchBtn.style.display = 'none';
                    this.loadServices();
                }
            });
        }
    }

    async loadServices() {
        try {
            // Build URL relative to current page location
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const url = `${basePath}/../services?action=api`;
            
            console.log('Loading services from:', url); // Debug log
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.servicesData = await response.json();
            this.renderServicesTable();
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError('Failed to load services. Please try again later.');
        }
    }

    async searchServicesByName(name) {
        try {
            // Show loading state
            this.showLoadingState();
            
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const url = `${basePath}/../services?action=api&search=${encodeURIComponent(name)}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.servicesData = await response.json();
            this.renderServicesTable();
        } catch (error) {
            console.error('Error searching services:', error);
            this.showError('Failed to search services. Please try again later.');
        }
    }

    showLoadingState() {
        const tbody = document.getElementById('servicesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Searching...</span>
                        </div>
                        <div class="mt-2 text-muted">Searching services...</div>
                    </td>
                </tr>
            `;
        }
    }

    renderServicesTable() {
        const tbody = document.getElementById('servicesTableBody');
        if (!tbody) {
            console.error('Services table body not found');
            return;
        }

        if (this.servicesData.length === 0) {
            const searchInput = document.getElementById('serviceSearchInput');
            const isSearching = searchInput && searchInput.value.trim() !== '';
            
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="alert alert-info mb-0">
                            <i class="icon-20" data-bs-toggle="tooltip" title="No Services">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"/>
                                    <path d="M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                                </svg>
                            </i>
                            ${isSearching ? 'No services found matching your search criteria' : 'No medical services found'}
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let tableRows = '';
        this.servicesData.forEach((service, index) => {
            const formattedPrice = this.formatPrice(service.price);
            tableRows += `
                <tr data-item="list">
                    <th scope="row">${index + 1}</th>
                    <td>#${service.service_id}</td>
                    <td>
                        <h6 class="mb-0 text-body fw-normal">${this.escapeHtml(service.name)}</h6>
                    </td>
                    <td>
                        <span class="text-muted small">${this.escapeHtml(service.description || 'No description')}</span>
                    </td>
                    <td>
                        <span class="text-success fw-bold">${formattedPrice}</span>
                    </td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" 
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="icon-20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                    </svg>
                                </i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="servicesManager.viewService(${service.service_id})">
                                    <i class="icon-16 me-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                        </svg>
                                    </i>
                                    View Details
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="servicesManager.editService(${service.service_id})">
                                    <i class="icon-16 me-2 text-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L14.5 5.207l-8 8L2 14l.793-4.5 8-8L12.146.146zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293L12.793 5.5zM9.854 8.146a.5.5 0 0 0-.708.708l.647.646a.5.5 0 0 0 .708-.708l-.647-.646z"/>
                                        </svg>
                                    </i>
                                    Edit Service
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="servicesManager.deleteService(${service.service_id})">
                                    <i class="icon-16 me-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                        </svg>
                                    </i>
                                    Delete Service
                                </a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = tableRows;
    }

    formatPrice(price) {
        if (typeof price === 'number') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
        }
        return price;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const tbody = document.getElementById('servicesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="alert alert-danger mb-0">
                            <i class="icon-20 me-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                </svg>
                            </i>
                            ${message}
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    viewService(serviceId) {
        const service = this.servicesData.find(s => s.service_id === serviceId);
        if (service) {
            // Show service details in a modal or alert
            alert(`Service Details:\n\nID: ${service.service_id}\nName: ${service.name}\nDescription: ${service.description}\nPrice: ${this.formatPrice(service.price)}`);
        }
    }

    async editService(serviceId) {
        try {
            const service = this.servicesData.find(s => s.service_id === serviceId);
            if (!service) {
                this.showAlert('Service not found!', 'error');
                return;
            }

            // Populate edit form
            document.getElementById('edit_serviceId').value = service.service_id;
            document.getElementById('edit_serviceName').value = service.name;
            document.getElementById('edit_serviceDescription').value = service.description || '';
            document.getElementById('edit_servicePrice').value = service.price;

            this.currentEditingId = serviceId;
            
            // Show edit modal
            const editOffcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasServiceEdit'));
            editOffcanvas.show();
            
        } catch (error) {
            console.error('Error loading service for edit:', error);
            this.showAlert('Failed to load service data for editing.', 'error');
        }
    }

    async deleteService(serviceId) {
        const service = this.servicesData.find(s => s.service_id === serviceId);
        if (!service) {
            this.showAlert('Service not found!', 'error');
            return;
        }

        // Show confirmation dialog
        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                title: 'Delete Service?',
                text: `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await this.performDeleteService(serviceId);
            }
        } else {
            // Fallback to native confirm
            if (confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
                await this.performDeleteService(serviceId);
            }
        }
    }

    async performDeleteService(serviceId) {
        try {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const url = `${basePath}/../services?action=delete&id=${serviceId}`;

            const response = await fetch(url, {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showAlert('Service deleted successfully!', 'success');
                await this.loadServices(); // Reload the services list
            } else {
                this.showAlert(result.error || 'Failed to delete service.', 'error');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            this.showAlert('An error occurred while deleting the service.', 'error');
        }
    }

    async handleAddService(event) {
        event.preventDefault();
        
        const form = document.getElementById('addServiceForm');
        const formData = new FormData(form);
        
        // Clear previous errors
        this.clearFormErrors('add');
        
        // Validate form
        if (!this.validateServiceForm('add')) {
            return;
        }
        
        const serviceData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            price: parseFloat(formData.get('price'))
        };
        
        try {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const url = `${basePath}/../services?action=add`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showAlert('Service added successfully!', 'success');
                
                // Close modal and reset form
                const addOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasServiceAdd'));
                addOffcanvas.hide();
                
                // Reload services
                await this.loadServices();
            } else {
                this.showAlert(result.error || 'Failed to add service.', 'error');
            }
            
        } catch (error) {
            console.error('Error adding service:', error);
            this.showAlert('An error occurred while adding the service.', 'error');
        }
    }

    async handleUpdateService(event) {
        event.preventDefault();
        
        const form = document.getElementById('editServiceForm');
        const formData = new FormData(form);
        
        // Clear previous errors
        this.clearFormErrors('edit');
        
        // Validate form
        if (!this.validateServiceForm('edit')) {
            return;
        }
        
        const serviceData = {
            service_id: parseInt(formData.get('service_id')),
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            price: parseFloat(formData.get('price'))
        };
        
        try {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const url = `${basePath}/../services?action=update`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showAlert('Service updated successfully!', 'success');
                
                // Close modal and reset form
                const editOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasServiceEdit'));
                editOffcanvas.hide();
                
                // Reload services
                await this.loadServices();
            } else {
                this.showAlert(result.error || 'Failed to update service.', 'error');
            }
            
        } catch (error) {
            console.error('Error updating service:', error);
            this.showAlert('An error occurred while updating the service.', 'error');
        }
    }

    validateServiceForm(formType) {
        let isValid = true;
        const prefix = formType === 'add' ? 'add' : 'edit';
        
        // Validate service name
        const nameField = document.getElementById(`${prefix}_serviceName`);
        const name = nameField.value.trim();
        if (!name) {
            this.showFieldError(`${prefix}_serviceName`, 'Service name is required.');
            isValid = false;
        } else if (name.length < 2) {
            this.showFieldError(`${prefix}_serviceName`, 'Service name must be at least 2 characters long.');
            isValid = false;
        }
        
        // Validate price
        const priceField = document.getElementById(`${prefix}_servicePrice`);
        const price = parseFloat(priceField.value);
        if (isNaN(price) || price <= 0) {
            this.showFieldError(`${prefix}_servicePrice`, 'Price must be a positive number.');
            isValid = false;
        }
        
        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}_error`);
        
        field.classList.add('is-invalid');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    clearFormErrors(formType) {
        const prefix = formType === 'add' ? 'add' : 'edit';
        const fields = [`${prefix}_serviceName`, `${prefix}_servicePrice`];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorDiv = document.getElementById(`${fieldId}_error`);
            
            if (field) field.classList.remove('is-invalid');
            if (errorDiv) errorDiv.textContent = '';
        });
    }

    resetAddForm() {
        const form = document.getElementById('addServiceForm');
        if (form) {
            form.reset();
            this.clearFormErrors('add');
        }
    }

    resetEditForm() {
        const form = document.getElementById('editServiceForm');
        if (form) {
            form.reset();
            this.clearFormErrors('edit');
        }
        this.currentEditingId = null;
    }

    showAlert(message, type = 'info') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info',
                text: message,
                icon: type,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            // Fallback to alert
            alert(message);
        }
    }

    refreshServices() {
        this.loadServices();
    }
}

// Initialize services manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.servicesManager = new ServicesManager();
});

// Refresh function for external use
function refreshServicesTable() {
    if (window.servicesManager) {
        window.servicesManager.refreshServices();
    }
} 