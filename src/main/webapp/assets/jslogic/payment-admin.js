// Payment Admin Business Logic
class PaymentAdmin {
    constructor() {
        this.payments = [];
        this.filteredPayments = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.init();
    }

    init() {
        this.loadAnalytics();
        this.loadPayments();
        this.bindEvents();
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
    }

    bindEvents() {
        // Filter button
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.applyFilters();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Auto refresh analytics when date changes
        document.getElementById('startDate').addEventListener('change', () => {
            this.loadAnalytics();
        });

        document.getElementById('endDate').addEventListener('change', () => {
            this.loadAnalytics();
        });

        // Pagination events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.getAttribute('data-page'));
                this.goToPage(page);
            }
        });

        // Update button in edit modal
        const updateBtn = document.querySelector('#offcanvasPaymentEdit .btn.btn-primary');
        if (updateBtn) {
            updateBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.submitEditPayment();
            });
        }
    }

    async loadAnalytics() {
        try {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const year = new Date().getFullYear();

            const response = await fetch(`/payment-admin/analytics?startDate=${startDate}&endDate=${endDate}&year=${year}`);
            
            if (!response.ok) {
                throw new Error('Failed to load analytics');
            }

            const analytics = await response.json();
            this.updateAnalyticsDisplay(analytics);
            
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }

    updateAnalyticsDisplay(analytics) {
        // Update revenue
        document.getElementById('totalRevenue').textContent = 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
            .format(analytics.totalRevenue || 0);

        // Update payment counts
        let totalPayments = 0;
        let completedPayments = 0;
        let pendingPayments = 0;

        if (this.payments) {
            totalPayments = this.payments.length;
            completedPayments = this.payments.filter(p => p.status === 'Paid').length;
            pendingPayments = this.payments.filter(p => p.status === 'Pending').length;
        }

        document.getElementById('totalPayments').textContent = totalPayments;
        document.getElementById('completedPayments').textContent = completedPayments;
        document.getElementById('pendingPayments').textContent = pendingPayments;

        // Update revenue by payment method chart if needed
        this.updatePaymentMethodChart(analytics.revenueByPaymentMethod);
        
        // Update monthly revenue chart if needed
        this.updateMonthlyChart(analytics.monthlyRevenue);
    }

    async loadPayments() {
        try {
            const response = await fetch('/payment-admin', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load payments');
            }

            this.payments = await response.json();
            this.filteredPayments = [...this.payments];
            this.currentPage = 1; // Reset to first page
            this.updatePaymentTable();
            this.loadAnalytics(); // Refresh analytics with new data
            
        } catch (error) {
            console.error('Error loading payments:', error);
            this.showError('Failed to load payment data');
        }
    }

    applyFilters() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        this.filteredPayments = this.payments.filter(payment => {
            let matches = true;

            // Date filter
            if (startDate && endDate) {
                const paymentDate = new Date(payment.payment_date);
                matches = matches && paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
            }

            // Payment method filter
            if (paymentMethod) {
                matches = matches && payment.payment_type === paymentMethod;
            }

            return matches;
        });

        this.currentPage = 1; // Reset to first page after filtering
        this.updatePaymentTable();
        this.updatePagination();
        this.loadAnalytics(); // Refresh analytics with filtered data
    }

    updatePaymentTable() {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pagedPayments = this.filteredPayments.slice(startIndex, endIndex);

        pagedPayments.forEach((payment, index) => {
            const row = this.createPaymentRow(payment, startIndex + index + 1);
            tbody.appendChild(row);
        });

        this.updatePagination();
    }

    createPaymentRow(payment, index) {
        const row = document.createElement('tr');
        row.setAttribute('data-item', 'list');
        
        // Format date
        const paymentDate = new Date(payment.payment_date);
        const formattedDate = paymentDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Format amount
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(payment.amount);

        // Status badge
        const statusClass = payment.status === 'Paid' ? 'success' : 
                          payment.status === 'Pending' ? 'warning' : 'danger';

        row.innerHTML = `
            <th scope="row">${index}</th>
            <td data-customer>${payment.customer_name || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${payment.payment_type}</td>
            <td>${formattedAmount}</td>
            <td><span class="badge bg-${statusClass}">${payment.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="paymentAdmin.editPayment(${payment.payment_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="paymentAdmin.updateStatus(${payment.payment_id}, 'Paid')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="paymentAdmin.updateStatus(${payment.payment_id}, 'Pending')">
                    <i class="fas fa-clock"></i>
                </button>
            </td>
        `;

        return row;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredPayments.length / this.pageSize);
        const paginationContainer = document.querySelector('.page-number');
        
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        // Previous and Next buttons
        const prevBtn = document.querySelector('.card-footer .btn-secondary');
        const nextBtn = document.querySelector('.card-footer .btn-primary');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
            nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - this.currentPage) <= 1) {
                const pageItem = document.createElement('li');
                pageItem.className = i === this.currentPage ? 
                    'text-center bg-primary text-white rounded page-btn' : 
                    'text-center bg-primary-subtle text-primary rounded page-btn';
                pageItem.style.cursor = 'pointer';
                pageItem.style.padding = '8px 12px';
                pageItem.style.margin = '0 2px';
                pageItem.textContent = i;
                pageItem.setAttribute('data-page', i);
                paginationContainer.appendChild(pageItem);
            } else if (Math.abs(i - this.currentPage) === 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'text-center text-primary rounded fs-1';
                ellipsis.textContent = '...';
                ellipsis.style.padding = '8px 12px';
                paginationContainer.appendChild(ellipsis);
            }
        }

        // Update showing info
        const startRecord = (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, this.filteredPayments.length);
        const totalRecords = this.filteredPayments.length;
        
        // Find the card header span and update it
        const cardHeaderSpan = document.querySelector('.card-header span');
        if (cardHeaderSpan) {
            cardHeaderSpan.textContent = `Showing ${startRecord}-${endRecord} of ${totalRecords} payments`;
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredPayments.length / this.pageSize);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.updatePaymentTable();
    }

    getCustomerName(invoiceId) {
        // This would typically come from a join query in the backend
        // For now, return a placeholder
        return `Customer #${invoiceId}`;
    }

    async updateStatus(paymentId, status) {
        try {
            const response = await fetch('/payment-admin/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `paymentId=${paymentId}&status=${status}`
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Payment status updated successfully');
                this.loadPayments(); // Reload data
            } else {
                this.showError(result.message || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            this.showError('Failed to update payment status');
        }
    }

    editPayment(paymentId) {
        const payment = this.payments.find(p => p.payment_id === paymentId);
        if (payment) {
            // Populate edit form
            document.getElementById('Name').value = payment.customer_name || 'N/A';
            document.getElementById('datetime').value = new Date(payment.payment_date).toISOString().split('T')[0];
            document.getElementById('payment-method').value = payment.payment_type;
            document.getElementById('Amount').value = `$${payment.amount}`;
            document.getElementById('payment_id').value = payment.status;
            this.editingPaymentId = payment.payment_id;
            // Show edit offcanvas
            const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasPaymentEdit'));
            offcanvas.show();
        }
    }

    async submitEditPayment() {
        // Get paymentId from the currently edited payment
        const paymentId = this.editingPaymentId;
        if (!paymentId) {
            this.showError('No payment selected for update');
            return;
        }

        // Get form values
        const name = document.getElementById('Name').value.trim();
        const paymentDate = document.getElementById('datetime').value;
        const paymentType = document.getElementById('payment-method').value;
        const amountStr = document.getElementById('Amount').value.replace('$', '').replace(',', '');
        const status = document.getElementById('payment_id').value;

        // Validation
        if (!name || !paymentDate || !paymentType || !amountStr || !status) {
            this.showError('Please fill in all required fields');
            return;
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        // Show loading state
        const updateBtn = document.querySelector('#offcanvasPaymentEdit .btn.btn-primary');
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
        updateBtn.disabled = true;

        try {
            console.log('Updating payment:', {
                paymentId,
                amount,
                paymentType,
                status,
                paymentDate
            });

            const response = await fetch('/payment-admin/update', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: `paymentId=${encodeURIComponent(paymentId)}&amount=${encodeURIComponent(amount)}&paymentType=${encodeURIComponent(paymentType)}&status=${encodeURIComponent(status)}&paymentDate=${encodeURIComponent(paymentDate)}`
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Update result:', result);

            if (result.success) {
                this.showSuccess('Payment updated successfully');
                
                // Close modal
                const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasPaymentEdit'));
                if (offcanvas) {
                    offcanvas.hide();
                }

                // Refresh data and analytics immediately
                await Promise.all([
                    this.loadPayments(),
                    this.loadAnalytics()
                ]);
                
                // Clear editing payment ID
                this.editingPaymentId = null;
            } else {
                this.showError(result.message || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            this.showError('Failed to update payment: ' + error.message);
        } finally {
            // Restore button state
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        }
    }

    exportData() {
        try {
            // Create CSV content
            const headers = ['#', 'Customer Name', 'Date & Time', 'Payment Method', 'Amount', 'Status'];
            let csvContent = headers.join(',') + '\n';

                         this.filteredPayments.forEach((payment, index) => {
                const row = [
                    index + 1,
                    `"${payment.customer_name || 'N/A'}"`,
                    `"${new Date(payment.payment_date).toLocaleString()}"`,
                    `"${payment.payment_type}"`,
                    payment.amount,
                    `"${payment.status}"`
                ];
                csvContent += row.join(',') + '\n';
            });

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Payment data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export payment data');
        }
    }

    updatePaymentMethodChart(data) {
        // Implement chart update logic here if using Chart.js or similar
        console.log('Revenue by payment method:', data);
    }

    updateMonthlyChart(data) {
        // Implement monthly chart update logic here
        console.log('Monthly revenue:', data);
    }

    showSuccess(message) {
        // Use SweetAlert or similar for notifications
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: message,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            alert(message);
        }
    }

    showError(message) {
        // Use SweetAlert or similar for notifications
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        } else {
            alert(message);
        }
    }

    // Test method to verify update functionality
    testUpdateFunctionality() {
        console.log('Testing update functionality...');
        console.log('Available payments:', this.payments);
        
        if (this.payments && this.payments.length > 0) {
            const firstPayment = this.payments[0];
            console.log('Testing with payment:', firstPayment);
            this.editPayment(firstPayment.payment_id);
        } else {
            console.log('No payments available for testing');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.paymentAdmin = new PaymentAdmin();
});