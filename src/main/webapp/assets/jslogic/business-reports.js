// Business Reports Manager
class BusinessReportsManager {
    constructor() {
        this.charts = {};
        this.dataTables = {};
        this.currentData = null;
        this.filters = {
            startDate: '',
            endDate: '',
            year: new Date().getFullYear()
        };
        
        this.init();
    }

    init() {
        console.log('Initializing Business Reports Manager...');
        this.setupDateFilters();
        this.setupEventListeners();
        this.checkDOMElements();
        this.loadInitialData();
    }

    checkDOMElements() {
        console.log('Checking DOM elements...');
        const requiredElements = [
            'loadingOverlay',
            'totalRevenue',
            'totalInvoices', 
            'totalPatients',
            'completionRate',
            'revenueChart',
            'departmentChart',
            'servicesTableBody',
            'doctorsTableBody', 
            'medicinesTableBody',
            'departmentDetails'
        ];
        
        const missingElements = [];
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingElements.push(id);
                console.error(`Missing DOM element: ${id}`);
            }
        });
        
        if (missingElements.length > 0) {
            console.error('Missing DOM elements:', missingElements);
            this.showErrorMessage(`Thiếu các thành phần giao diện: ${missingElements.join(', ')}`);
        } else {
            console.log('All required DOM elements found');
        }
    }

    setupDateFilters() {
        console.log('Setting up date filters...');
        // Set default dates - last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        document.getElementById('startDate').value = this.formatDate(startDate);
        document.getElementById('endDate').value = this.formatDate(endDate);
        
        // Populate year selector
        const yearSelect = document.getElementById('yearSelect');
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        // Auto-refresh on filter change
        document.getElementById('startDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('endDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('yearSelect').addEventListener('change', () => this.applyFilters());
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
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

    showLoading() {
        console.log('Showing loading overlay...');
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        } else {
            console.error('Loading overlay element not found');
        }
    }

    hideLoading() {
        console.log('Hiding loading overlay...');
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('Loading overlay hidden successfully');
        } else {
            console.error('Loading overlay element not found');
        }
    }

    async loadInitialData() {
        console.log('Loading initial data...');
        this.showLoading();
        try {
            await this.loadDashboardData();
            console.log('Dashboard data loaded successfully');
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showErrorMessage('Lỗi tải dữ liệu ban đầu: ' + error.message);
            // Load demo data as fallback
            this.loadDemoData();
        } finally {
            console.log('Calling hideLoading...');
            this.hideLoading();
        }
    }

    async applyFilters() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const year = document.getElementById('yearSelect').value;

        this.filters = { startDate, endDate, year };
        
        this.showLoading();
        try {
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showErrorMessage('Lỗi áp dụng bộ lọc: ' + error.message);
            // Load demo data as fallback
            this.loadDemoData();
        } finally {
            this.hideLoading();
        }
    }

    async loadDashboardData() {
        try {
            console.log('Loading dashboard data...');
            // Build query parameters
            const params = new URLSearchParams();
            params.append('type', 'dashboard');
            
            if (this.filters.startDate) params.append('startDate', this.filters.startDate);
            if (this.filters.endDate) params.append('endDate', this.filters.endDate);
            if (this.filters.year) params.append('year', this.filters.year);

            const url = `../reports?${params}`;
            console.log('Fetching from URL:', url);

            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);

            if (result.success) {
                this.currentData = result.data;
                this.updateDashboard(result.data);
            } else {
                throw new Error(result.message || 'Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    loadDemoData() {
        console.log('Loading demo data as fallback...');
        const demoData = {
            revenue: {
                total_revenue: 50000000,
                total_invoices: 123,
                average_invoice_amount: 406504,
                paid_invoices: 100,
                pending_invoices: 15,
                cancelled_invoices: 8
            },
            patients: {
                total_patients: 89,
                total_appointments: 156,
                completed_appointments: 134,
                cancelled_appointments: 12,
                pending_appointments: 10,
                inprogress_appointments: 0,
                completion_rate: 85.9
            },
            topServices: [
                { service_name: 'Khám tổng quát', service_price: 200000, service_count: 45, total_service_revenue: 9000000, avg_service_revenue: 200000, revenue_percentage: 25.5 },
                { service_name: 'Siêu âm', service_price: 300000, service_count: 32, total_service_revenue: 9600000, avg_service_revenue: 300000, revenue_percentage: 22.1 },
                { service_name: 'Xét nghiệm máu', service_price: 150000, service_count: 67, total_service_revenue: 10050000, avg_service_revenue: 150000, revenue_percentage: 18.8 },
                { service_name: 'Chụp X-quang', service_price: 400000, service_count: 28, total_service_revenue: 11200000, avg_service_revenue: 400000, revenue_percentage: 15.2 },
                { service_name: 'Khám chuyên khoa', service_price: 500000, service_count: 19, total_service_revenue: 9500000, avg_service_revenue: 500000, revenue_percentage: 12.4 }
            ],
            departments: [
                { department: 'Tim mạch', staff_count: 3, total_appointments: 45, completed_appointments: 40, success_rate: 88.9 },
                { department: 'Nhi khoa', staff_count: 4, total_appointments: 52, completed_appointments: 48, success_rate: 92.3 },
                { department: 'Thần kinh', staff_count: 2, total_appointments: 28, completed_appointments: 24, success_rate: 85.7 },
                { department: 'Da liễu', staff_count: 2, total_appointments: 19, completed_appointments: 16, success_rate: 84.2 },
                { department: 'Nội khoa', staff_count: 3, total_appointments: 34, completed_appointments: 29, success_rate: 85.3 }
            ],
            medicines: [
                { medicine_id: 1, medicine_name: 'Paracetamol', current_stock: 15, category: 'Thuốc giảm đau', price: 5000, expiration_date: '2024-12-31', stock_status: 'Critical', expiry_status: 'Good', days_to_expiry: 180 },
                { medicine_id: 2, medicine_name: 'Amoxicillin', current_stock: 35, category: 'Kháng sinh', price: 8000, expiration_date: '2024-11-30', stock_status: 'Low', expiry_status: 'Good', days_to_expiry: 150 },
                { medicine_id: 3, medicine_name: 'Ibuprofen', current_stock: 78, category: 'Thuốc giảm đau', price: 12000, expiration_date: '2025-03-15', stock_status: 'Moderate', expiry_status: 'Good', days_to_expiry: 280 },
                { medicine_id: 4, medicine_name: 'Aspirin', current_stock: 120, category: 'Thuốc tim mạch', price: 15000, expiration_date: '2025-06-20', stock_status: 'Good', expiry_status: 'Good', days_to_expiry: 365 },
                { medicine_id: 5, medicine_name: 'Vitamin C', current_stock: 200, category: 'Vitamin', price: 3000, expiration_date: '2025-01-10', stock_status: 'Good', expiry_status: 'Good', days_to_expiry: 200 }
            ],
            monthlyTrend: [
                { month: 1, month_name: 'January', monthly_revenue: 4200000, monthly_invoices: 12 },
                { month: 2, month_name: 'February', monthly_revenue: 3800000, monthly_invoices: 11 },
                { month: 3, month_name: 'March', monthly_revenue: 4500000, monthly_invoices: 15 },
                { month: 4, month_name: 'April', monthly_revenue: 5100000, monthly_invoices: 17 },
                { month: 5, month_name: 'May', monthly_revenue: 4800000, monthly_invoices: 16 },
                { month: 6, month_name: 'June', monthly_revenue: 5300000, monthly_invoices: 18 }
            ]
        };
        
        this.currentData = demoData;
        this.updateDashboard(demoData);
    }

    updateDashboard(data) {
        console.log('Updating dashboard with data:', data);
        this.debugLoadingState();
        
        try {
            this.updateMetrics(data.revenue, data.patients);
            this.updateRevenueChart(data.monthlyTrend || []);
            this.updateDepartmentChart(data.departments || []);
            this.updateServicesTable(data.topServices || []);
            this.updateDoctorsTable(data.doctors || []);
            this.updateMedicinesTable(data.medicines || []);
            this.updateDepartmentDetails(data.departments || []);
            
            // Force hide loading after successful update
            console.log('Dashboard update complete, forcing hide loading...');
            this.forceHideLoading();
            this.debugLoadingState();
            
            // Additional safety net - force hide after a short delay
            setTimeout(() => {
                console.log('Safety timeout - force hiding loading overlay');
                this.forceHideLoading();
            }, 500);
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showErrorMessage('Lỗi cập nhật dashboard: ' + error.message);
            this.forceHideLoading();
            this.debugLoadingState();
        }
    }

    updateMetrics(revenue, patients) {
        console.log('Updating metrics...', { revenue, patients });
        
        // Update revenue metrics
        if (revenue) {
            const totalRevenueElement = document.getElementById('totalRevenue');
            const totalInvoicesElement = document.getElementById('totalInvoices');
            
            if (totalRevenueElement) {
                totalRevenueElement.textContent = this.formatCurrency(revenue.total_revenue);
                console.log('Updated totalRevenue:', revenue.total_revenue);
            } else {
                console.error('totalRevenue element not found');
            }
            
            if (totalInvoicesElement) {
                totalInvoicesElement.textContent = this.formatNumber(revenue.total_invoices);
                console.log('Updated totalInvoices:', revenue.total_invoices);
            } else {
                console.error('totalInvoices element not found');
            }
        }

        // Update patient metrics
        if (patients) {
            const totalPatientsElement = document.getElementById('totalPatients');
            const completionRateElement = document.getElementById('completionRate');
            
            if (totalPatientsElement) {
                totalPatientsElement.textContent = this.formatNumber(patients.total_patients);
                console.log('Updated totalPatients:', patients.total_patients);
            } else {
                console.error('totalPatients element not found');
            }
            
            if (completionRateElement) {
                const completionRate = patients.completion_rate || 0;
                completionRateElement.textContent = `${completionRate.toFixed(1)}%`;
                console.log('Updated completionRate:', completionRate);
            } else {
                console.error('completionRate element not found');
            }
        }
        
        console.log('Metrics update complete');
    }

    updateRevenueChart(monthlyData) {
        console.log('Updating revenue chart...');
        try {
            const ctx = document.getElementById('revenueChart');
            if (!ctx) {
                console.error('Revenue chart canvas not found');
                return;
            }
            
            const chartCtx = ctx.getContext('2d');
            
            if (this.charts.revenue) {
                this.charts.revenue.destroy();
            }

            const labels = monthlyData.map(item => item.month_name || `Tháng ${item.month}`);
            const revenues = monthlyData.map(item => item.monthly_revenue || 0);
            const invoices = monthlyData.map(item => item.monthly_invoices || 0);

            this.charts.revenue = new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Doanh Thu (VNĐ)',
                        data: revenues,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        yAxisID: 'y'
                    }, {
                        label: 'Số Hóa Đơn',
                        data: invoices,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Xu Hướng Doanh Thu Theo Tháng'
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        notation: 'compact'
                                    }).format(value);
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false,
                            },
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating revenue chart:', error);
        }
    }

    updateDepartmentChart(departments) {
        console.log('Updating department chart...');
        try {
            const ctx = document.getElementById('departmentChart');
            if (!ctx) {
                console.error('Department chart canvas not found');
                return;
            }
            
            const chartCtx = ctx.getContext('2d');
            
            if (this.charts.department) {
                this.charts.department.destroy();
            }

            const labels = departments.map(dept => dept.department || 'Không xác định');
            const appointmentCounts = departments.map(dept => dept.total_appointments || 0);
            const colors = [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ];

            this.charts.department = new Chart(chartCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: appointmentCounts,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Phân Bổ Lịch Hẹn Theo Khoa'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating department chart:', error);
        }
    }

    updateServicesTable(services) {
        console.log('Updating services table...');
        try {
            const tableBody = document.getElementById('servicesTableBody');
            if (!tableBody) {
                console.error('Services table body not found');
                return;
            }
            
            tableBody.innerHTML = '';

            services.forEach((service, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.service_name || 'N/A'}</td>
                    <td>${this.formatCurrency(service.service_price)}</td>
                    <td>${this.formatNumber(service.service_count)}</td>
                    <td class="fw-bold text-primary">${this.formatCurrency(service.total_service_revenue)}</td>
                    <td>${(service.revenue_percentage || 0).toFixed(1)}%</td>
                    <td>${this.formatCurrency(service.avg_service_revenue)}</td>
                `;
                tableBody.appendChild(row);
            });

            // Initialize DataTable if not already done
            if (!this.dataTables.services && typeof $ !== 'undefined') {
                this.dataTables.services = $('#servicesTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
                    },
                    pageLength: 10,
                    order: [[3, 'desc']] // Sort by revenue descending
                });
            } else if (this.dataTables.services) {
                this.dataTables.services.draw();
            }
        } catch (error) {
            console.error('Error updating services table:', error);
        }
    }

    async updateDoctorsTable(doctors) {
        console.log('Updating doctors table...');
        try {
            // If doctors data is not provided, fetch it separately
            if (!doctors || doctors.length === 0) {
                try {
                    const params = new URLSearchParams();
                    params.append('type', 'doctors');
                    if (this.filters.startDate) params.append('startDate', this.filters.startDate);
                    if (this.filters.endDate) params.append('endDate', this.filters.endDate);

                    const response = await fetch(`../reports?${params}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        doctors = result.data;
                    }
                } catch (error) {
                    console.error('Error loading doctors data:', error);
                    doctors = [];
                }
            }

            const tableBody = document.getElementById('doctorsTableBody');
            if (!tableBody) {
                console.error('Doctors table body not found');
                return;
            }
            
            tableBody.innerHTML = '';

            doctors.forEach(doctor => {
                const completionRate = doctor.completion_rate || 0;
                const rateClass = completionRate >= 80 ? 'text-success' : completionRate >= 60 ? 'text-warning' : 'text-danger';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="fw-bold">${doctor.doctor_name || 'N/A'}</td>
                    <td><span class="badge bg-info">${doctor.department || 'N/A'}</span></td>
                    <td>${this.formatNumber(doctor.total_appointments)}</td>
                    <td class="text-success">${this.formatNumber(doctor.completed_appointments)}</td>
                    <td class="text-danger">${this.formatNumber(doctor.cancelled_appointments)}</td>
                    <td class="${rateClass} fw-bold">${completionRate.toFixed(1)}%</td>
                    <td>${this.formatNumber(doctor.unique_patients)}</td>
                `;
                tableBody.appendChild(row);
            });

            // Initialize DataTable if not already done
            if (!this.dataTables.doctors && typeof $ !== 'undefined') {
                this.dataTables.doctors = $('#doctorsTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
                    },
                    pageLength: 10,
                    order: [[2, 'desc']] // Sort by total appointments descending
                });
            } else if (this.dataTables.doctors) {
                this.dataTables.doctors.draw();
            }
        } catch (error) {
            console.error('Error updating doctors table:', error);
        }
    }

    updateMedicinesTable(medicines) {
        console.log('Updating medicines table...');
        try {
            const tableBody = document.getElementById('medicinesTableBody');
            if (!tableBody) {
                console.error('Medicines table body not found');
                return;
            }
            
            tableBody.innerHTML = '';

            medicines.forEach(medicine => {
                const stockStatus = medicine.stock_status || 'Good';
                const expiryStatus = medicine.expiry_status || 'Good';
                const daysToExpiry = medicine.days_to_expiry || 0;

                const stockBadgeClass = this.getStatusBadgeClass(stockStatus);
                const expiryBadgeClass = this.getStatusBadgeClass(expiryStatus);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="fw-bold">${medicine.medicine_name || 'N/A'}</td>
                    <td>${medicine.category || 'N/A'}</td>
                    <td class="text-center">${this.formatNumber(medicine.current_stock)}</td>
                    <td><span class="status-badge ${stockBadgeClass}">${stockStatus}</span></td>
                    <td>${this.formatCurrency(medicine.price)}</td>
                    <td>${medicine.expiration_date || 'N/A'}</td>
                    <td><span class="status-badge ${expiryBadgeClass}">${expiryStatus}</span></td>
                    <td class="text-center">${daysToExpiry}</td>
                `;
                tableBody.appendChild(row);
            });

            // Initialize DataTable if not already done
            if (!this.dataTables.medicines && typeof $ !== 'undefined') {
                this.dataTables.medicines = $('#medicinesTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
                    },
                    pageLength: 10,
                    order: [[2, 'asc']] // Sort by stock ascending (show low stock first)
                });
            } else if (this.dataTables.medicines) {
                this.dataTables.medicines.draw();
            }
        } catch (error) {
            console.error('Error updating medicines table:', error);
        }
    }

    getStatusBadgeClass(status) {
        const statusMap = {
            'Critical': 'critical',
            'Low': 'low',
            'Moderate': 'moderate',
            'Good': 'good',
            'Expiring Soon': 'expiring-soon',
            'Monitor': 'monitor'
        };
        return statusMap[status] || 'good';
    }

    updateDepartmentDetails(departments) {
        console.log('Updating department details...');
        try {
            const container = document.getElementById('departmentDetails');
            if (!container) {
                console.error('Department details container not found');
                return;
            }
            
            container.innerHTML = '';

            departments.forEach(dept => {
                const successRate = dept.success_rate || 0;
                const rateClass = successRate >= 80 ? 'text-success' : successRate >= 60 ? 'text-warning' : 'text-danger';
                
                const card = document.createElement('div');
                card.className = 'department-card';
                card.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6 class="mb-1 fw-bold">${dept.department || 'Không xác định'}</h6>
                            <small class="text-muted">${this.formatNumber(dept.staff_count)} nhân viên</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="metric-value">${this.formatNumber(dept.total_appointments)}</div>
                            <small class="text-muted">Tổng lịch hẹn</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="metric-value text-success">${this.formatNumber(dept.completed_appointments)}</div>
                            <small class="text-muted">Hoàn thành</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="metric-value ${rateClass}">${successRate.toFixed(1)}%</div>
                            <small class="text-muted">Tỷ lệ thành công</small>
                        </div>
                        <div class="col-md-3">
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar ${rateClass.replace('text-', 'bg-')}" 
                                     style="width: ${successRate}%"></div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error updating department details:', error);
        }
    }

    // Filter functions
    async filterMedicines(filterType) {
        const table = this.dataTables.medicines;
        if (!table) return;

        switch (filterType) {
            case 'critical':
                table.column(3).search('Critical').draw();
                break;
            case 'expiring':
                table.column(6).search('Expiring Soon').draw();
                break;
            case 'all':
            default:
                table.search('').columns().search('').draw();
                break;
        }
    }

    sortDoctors(sortType) {
        const table = this.dataTables.doctors;
        if (!table) return;

        switch (sortType) {
            case 'appointments':
                table.order([2, 'desc']).draw(); // Sort by total appointments
                break;
            case 'completion':
                table.order([5, 'desc']).draw(); // Sort by completion rate
                break;
        }
    }

    toggleServiceDetail() {
        // This could expand to show more detailed service analytics
        console.log('Toggle service detail view');
    }

    // Export functions
    async exportReport(format) {
        try {
            this.showLoading();
            
            if (format === 'pdf') {
                await this.exportToPDF();
            } else if (format === 'excel') {
                await this.exportToExcel();
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showErrorMessage('Lỗi xuất báo cáo');
        } finally {
            this.hideLoading();
        }
    }

    async exportToPDF() {
        // For now, use browser's print functionality
        window.print();
    }

    async exportToExcel() {
        // Collect all data and create a downloadable Excel file
        const data = {
            revenue: this.currentData.revenue,
            services: this.currentData.topServices,
            doctors: this.currentData.doctors,
            medicines: this.currentData.medicines,
            departments: this.currentData.departments
        };
        
        // Create CSV content as a simple export option
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add revenue summary
        csvContent += "BÁO CÁO TỔNG HỢP KINH DOANH\n\n";
        csvContent += "TỔNG QUAN DOANH THU\n";
        csvContent += `Tổng doanh thu,${data.revenue?.total_revenue || 0}\n`;
        csvContent += `Tổng hóa đơn,${data.revenue?.total_invoices || 0}\n\n`;
        
        // Add services data
        csvContent += "TOP DỊCH VỤ\n";
        csvContent += "Tên dịch vụ,Giá,Số lượng,Doanh thu\n";
        (data.services || []).forEach(service => {
            csvContent += `${service.service_name},${service.service_price},${service.service_count},${service.total_service_revenue}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bao-cao-kinh-doanh-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async refreshReports() {
        await this.loadDashboardData();
        this.showSuccessMessage('Báo cáo đã được làm mới');
    }

    showErrorMessage(message) {
        // Use a toast or alert to show error
        console.error(message);
        alert(message); // Simple alert for now
    }

    showSuccessMessage(message) {
        // Use a toast or alert to show success
        console.log(message);
        // Could implement a toast notification here
    }

    forceHideLoading() {
        console.log('Force hiding loading overlay...');
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            // Multiple ways to ensure overlay is hidden
            overlay.style.display = 'none';
            overlay.style.visibility = 'hidden';
            overlay.classList.add('d-none');
            overlay.setAttribute('hidden', 'true');
            console.log('Loading overlay force hidden with multiple methods');
        } else {
            console.error('Loading overlay element not found');
        }
        
        // Also try to find and hide any other loading elements
        const allLoadingElements = document.querySelectorAll('[id*="loading"], [class*="loading"], [class*="spinner"]');
        allLoadingElements.forEach(el => {
            if (el.id === 'loadingOverlay' || el.textContent.includes('Đang tải')) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.classList.add('d-none');
                console.log('Hidden additional loading element:', el.id || el.className);
            }
        });
    }

    debugLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            console.log('Loading overlay state:', {
                display: overlay.style.display,
                className: overlay.className,
                visible: overlay.offsetParent !== null
            });
        } else {
            console.error('Loading overlay element not found for debug');
        }
    }
}

// Initialize the reports manager when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Report Manager');
    window.reportManager = new BusinessReportsManager();
    
    // Safety net: Force hide loading after 3 seconds
    setTimeout(() => {
        console.log('Safety timeout after 3 seconds - force hiding any loading overlays');
        if (window.reportManager) {
            window.reportManager.forceHideLoading();
        }
        
        // Manual DOM manipulation as backup
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.style.visibility = 'hidden';
            loadingOverlay.classList.add('d-none');
            console.log('Manual loading overlay hidden via backup method');
        }
    }, 3000);
});

// Add print styles
const printStyles = `
    @media print {
        .sidebar, .export-buttons, .filter-section { display: none !important; }
        .main-content { margin-left: 0 !important; }
        .chart-container { height: 300px !important; }
        .card { break-inside: avoid; }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet); 