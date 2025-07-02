document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch reports
    async function fetchReport(reportType) {
        try {
            const response = await fetch(`/reports?type=${reportType}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok. Status: ${response.status}. Message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${reportType} report:`, error);
            displayErrorMessage(`Failed to load ${reportType} report: ${error.message}`);
            return null;
        }
    }

    // Function to display error message
    function displayErrorMessage(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <div class="iq-alert-icon">
                        <i class="ri-information-line"></i>
                    </div>
                    <div class="iq-alert-text">${message}</div>
                </div>
            `;
            console.error('Displayed error:', message);
        }
    }

    // Function to render revenue report
    function renderRevenueReport(data) {
        const revenueContainer = document.getElementById('revenue-report');
        if (revenueContainer) {
            revenueContainer.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="header-title">
                            <h4 class="card-title">Revenue Report</h4>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-lg-4">
                                <div class="card card-body bg-soft-primary">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Total Revenue</h6>
                                            <p class="text-primary mb-0">${data.total_revenue.toLocaleString()} VND</p>
                                        </div>
                                        <div class="rounded-circle bg-primary p-3">
                                            <i class="ri-money-dollar-circle-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="card card-body bg-soft-info">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Total Invoices</h6>
                                            <p class="text-info mb-0">${data.total_invoices}</p>
                                        </div>
                                        <div class="rounded-circle bg-info p-3">
                                            <i class="ri-file-list-3-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="card card-body bg-soft-success">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Avg Invoice Amount</h6>
                                            <p class="text-success mb-0">${data.average_invoice_amount.toLocaleString()} VND</p>
                                        </div>
                                        <div class="rounded-circle bg-success p-3">
                                            <i class="ri-calculator-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Function to render service usage report
    function renderServiceUsageReport(data) {
        const serviceContainer = document.getElementById('services-report');
        if (serviceContainer) {
            const tableRows = data.map(service => `
                <tr>
                    <td>${service.service_name}</td>
                    <td>${service.service_count}</td>
                    <td>${service.total_service_revenue.toLocaleString()} VND</td>
                </tr>
            `).join('');

            serviceContainer.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="header-title">
                            <h4 class="card-title">Service Usage Report</h4>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Service Name</th>
                                        <th>Service Count</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Function to render patient visits report
    function renderPatientVisitReport(data) {
        const patientContainer = document.getElementById('patients-report');
        if (patientContainer) {
            patientContainer.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="header-title">
                            <h4 class="card-title">Patient Visits Report</h4>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-lg-3 col-md-6">
                                <div class="card card-body bg-soft-primary">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Total Patients</h6>
                                            <p class="text-primary mb-0">${data.total_patients}</p>
                                        </div>
                                        <div class="rounded-circle bg-primary p-3">
                                            <i class="ri-user-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <div class="card card-body bg-soft-info">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Total Appointments</h6>
                                            <p class="text-info mb-0">${data.total_appointments}</p>
                                        </div>
                                        <div class="rounded-circle bg-info p-3">
                                            <i class="ri-calendar-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <div class="card card-body bg-soft-success">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Completed</h6>
                                            <p class="text-success mb-0">${data.completed_appointments}</p>
                                        </div>
                                        <div class="rounded-circle bg-success p-3">
                                            <i class="ri-check-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <div class="card card-body bg-soft-danger">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-2">Cancelled</h6>
                                            <p class="text-danger mb-0">${data.cancelled_appointments}</p>
                                        </div>
                                        <div class="rounded-circle bg-danger p-3">
                                            <i class="ri-close-line text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Function to render medicine inventory report
    function renderMedicineInventoryReport(data) {
        const medicineContainer = document.getElementById('medicines-report');
        if (medicineContainer) {
            // Check if data is empty or null
            if (!data || data.length === 0) {
                displayErrorMessage('No medicine inventory data available.');
                medicineContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header d-flex justify-content-between">
                            <div class="header-title">
                                <h4 class="card-title">Medicine Inventory Report</h4>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-warning" role="alert">
                                <div class="iq-alert-icon">
                                    <i class="ri-information-line"></i>
                                </div>
                                <div class="iq-alert-text">No medicine inventory data found.</div>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            const tableRows = data.map(medicine => {
                // Safely handle potential undefined or null values
                const medicineName = medicine.medicine_name || 'Unknown';
                const currentStock = medicine.current_stock !== undefined ? medicine.current_stock : 'N/A';
                const category = medicine.category || 'Uncategorized';
                const price = medicine.price !== undefined ? medicine.price.toLocaleString() + ' VND' : 'N/A';
                
                // Handle expiration date
                let expirationDate = 'N/A';
                if (medicine.expiration_date) {
                    try {
                        expirationDate = new Date(medicine.expiration_date).toLocaleDateString();
                    } catch (error) {
                        console.error('Error parsing expiration date:', error);
                    }
                }

                return `
                    <tr>
                        <td>${medicineName}</td>
                        <td>${currentStock}</td>
                        <td>${category}</td>
                        <td>${price}</td>
                        <td>${expirationDate}</td>
                    </tr>
                `;
            }).join('');

            medicineContainer.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="header-title">
                            <h4 class="card-title">Medicine Inventory Report</h4>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Medicine Name</th>
                                        <th>Current Stock</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Expiration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Main function to load all reports
    async function loadReports() {
        try {
            // Fetch revenue report
            const revenueData = await fetchReport('revenue');
            if (revenueData) renderRevenueReport(revenueData);

            // Fetch service usage report
            const servicesData = await fetchReport('services');
            if (servicesData) renderServiceUsageReport(servicesData);

            // Fetch patient visits report
            const patientsData = await fetchReport('patients');
            if (patientsData) renderPatientVisitReport(patientsData);

            // Fetch medicine inventory report
            const medicinesData = await fetchReport('medicines');
            if (medicinesData) renderMedicineInventoryReport(medicinesData);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    // Load reports when the page is ready
    loadReports();
}); 