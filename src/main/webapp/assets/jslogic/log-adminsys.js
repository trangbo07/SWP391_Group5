async function loadSelectForLogFilter(logType, field, selectId, defaultOptionText) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`Element with ID '${selectId}' not found. Cannot load filter.`);
        return;
    }

    select.innerHTML = `<option value="">Đang tải...</option>`;
    select.disabled = true;

    try {
        const response = await fetch(`/api/systemlogs/${logType}?action=distinct&field=${field}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        let valuesToProcess = [];

        if (Array.isArray(data)) {
            valuesToProcess = data;
        } else if (data && typeof data === 'object' && data.success && Array.isArray(data.values)) {
            valuesToProcess = data.values;
        } else {
            console.error(`Invalid data format for ${logType} ${field} filter:`, data);
            select.innerHTML = `<option value="">Lỗi tải dữ liệu</option>`;
            return;
        }

        select.innerHTML = `<option value="">${defaultOptionText}</option>`;

        const translationMap = {
            'DOCTOR': 'Bác sĩ',
            'RECEPTIONIST': 'Lễ tân',
            'ADMINSYS': 'Quản trị hệ thống',
            'ADMINBUSINESS': 'Quản trị kinh doanh',

            'CREATE': 'Tạo mới',
            'UPDATE': 'Cập nhật',
            'DELETE': 'Xóa',
            'PRINT': 'In',
            'APPROVE': 'Duyệt',
            'CANCEL': 'Hủy',
            'FEEDBACK': 'Phản hồi',
            'BOOK': 'Đặt lịch'
        };

        valuesToProcess.forEach(val => {
            if (val) {
                const upperVal = val.toUpperCase();
                let displayVal = translationMap[upperVal] ||
                    val.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

                select.innerHTML += `<option value="${val}">${displayVal}</option>`;
            }
        });
    } catch (error) {
        console.error(`Lỗi khi tải bộ lọc ${field} cho ${logType}: `, error);
        select.innerHTML = `<option value="">Lỗi tải dữ liệu</option>`;
    } finally {
        select.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadSelectForLogFilter('patient', 'action_type', 'filterPatientLogActionType', 'Tất cả hành động');
    loadSelectForLogFilter('staff', 'action_type', 'filterStaffLogActionType', 'Tất cả hành động');
    loadSelectForLogFilter('staff', 'role', 'filterStaffLogRole', 'Tất cả vai trò'); // Thêm cho Staff Role
    loadSelectForLogFilter('pharmacist', 'action_type', 'filterPharmacistLogActionType', 'Tất cả hành động');


    document.getElementById('patient-log-tab').addEventListener('shown.bs.tab', () => {
        fetchPatientLogsWithFilter();
    });
    document.getElementById('btnRefreshPatientLog').addEventListener('click', fetchPatientLogsWithFilter);
    document.getElementById('selectPatientLogPageSize').addEventListener('change', (e) => {
        pageSizePatientLog = parseInt(e.target.value);
        currentPagePatientLog = 1;
        fetchPatientLogsWithFilter();
    });
    document.getElementById('searchPatientLogInput').addEventListener('input', debounce(fetchPatientLogsWithFilter, 400));
    document.getElementById('filterPatientLogActionType').addEventListener('change', fetchPatientLogsWithFilter);
    document.getElementById('btnPreviousPatientLogPage').addEventListener('click', e => {
        e.preventDefault();
        changePatientLogPage(-1);
    });
    document.getElementById('btnNextPatientLogPage').addEventListener('click', e => {
        e.preventDefault();
        changePatientLogPage(1);
    });
    document.getElementById('btnReversePatientLogList').addEventListener('click', () => {
        isReversedPatientLog = !isReversedPatientLog;
        toggleReverseButtonClass('btnReversePatientLogList', isReversedPatientLog);
        currentPagePatientLog = 1;
        fetchPatientLogsWithFilter();
    });

    document.getElementById('staff-log-tab').addEventListener('shown.bs.tab', () => {
        fetchStaffLogsWithFilter();
    });
    document.getElementById('btnRefreshStaffLog').addEventListener('click', fetchStaffLogsWithFilter);
    document.getElementById('selectStaffLogPageSize').addEventListener('change', (e) => {
        pageSizeStaffLog = parseInt(e.target.value);
        currentPageStaffLog = 1;
        fetchStaffLogsWithFilter();
    });
    document.getElementById('searchStaffLogInput').addEventListener('input', debounce(fetchStaffLogsWithFilter, 400));
    document.getElementById('filterStaffLogActionType').addEventListener('change', fetchStaffLogsWithFilter);
    document.getElementById('filterStaffLogRole').addEventListener('change', fetchStaffLogsWithFilter); // Mới cho Staff Role
    document.getElementById('btnPreviousStaffLogPage').addEventListener('click', e => {
        e.preventDefault();
        changeStaffLogPage(-1);
    });
    document.getElementById('btnNextStaffLogPage').addEventListener('click', e => {
        e.preventDefault();
        changeStaffLogPage(1);
    });
    document.getElementById('btnReverseStaffLogList').addEventListener('click', () => {
        isReversedStaffLog = !isReversedStaffLog;
        toggleReverseButtonClass('btnReverseStaffLogList', isReversedStaffLog);
        currentPageStaffLog = 1;
        fetchStaffLogsWithFilter();
    });

    document.getElementById('pharmacist-log-tab').addEventListener('shown.bs.tab', () => {
        fetchPharmacistLogsWithFilter();
    });
    document.getElementById('btnRefreshPharmacistLog').addEventListener('click', fetchPharmacistLogsWithFilter);
    document.getElementById('selectPharmacistLogPageSize').addEventListener('change', (e) => {
        pageSizePharmacistLog = parseInt(e.target.value);
        currentPagePharmacistLog = 1;
        fetchPharmacistLogsWithFilter();
    });
    document.getElementById('searchPharmacistLogInput').addEventListener('input', debounce(fetchPharmacistLogsWithFilter, 400));
    document.getElementById('filterPharmacistLogActionType').addEventListener('change', fetchPharmacistLogsWithFilter);
    document.getElementById('btnPreviousPharmacistLogPage').addEventListener('click', e => {
        e.preventDefault();
        changePharmacistLogPage(-1);
    });
    document.getElementById('btnNextPharmacistLogPage').addEventListener('click', e => {
        e.preventDefault();
        changePharmacistLogPage(1);
    });
    document.getElementById('btnReversePharmacistLogList').addEventListener('click', () => {
        isReversedPharmacistLog = !isReversedPharmacistLog;
        toggleReverseButtonClass('btnReversePharmacistLogList', isReversedPharmacistLog);
        currentPagePharmacistLog = 1;
        fetchPharmacistLogsWithFilter();
    });


    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function toggleReverseButtonClass(buttonId, isReversed) {
        const btn = document.getElementById(buttonId);
        const icon = btn.querySelector('i');

        if (isReversed) {
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-secondary');
            icon.classList.remove('fa-sort-amount-down-alt');
            icon.classList.add('fa-sort-amount-up-alt');
        } else {
            btn.classList.add('btn-outline-secondary');
            btn.classList.remove('btn-secondary');
            icon.classList.add('fa-sort-amount-down-alt');
            icon.classList.remove('fa-sort-amount-up-alt');
        }
    }

    const activeTabButton = document.querySelector('.nav-link.active[data-bs-toggle="tab"]');
    if (activeTabButton && activeTabButton.id === 'patient-log-tab') {
        fetchPatientLogsWithFilter();
    }

});

let patientLogsData = [];
let currentPagePatientLog = 1;
let pageSizePatientLog = 5;
let isReversedPatientLog = false;

let staffLogsData = [];
let currentPageStaffLog = 1;
let pageSizeStaffLog = 5;
let isReversedStaffLog = false;

let pharmacistLogsData = [];
let currentPagePharmacistLog = 1;
let pageSizePharmacistLog = 5;
let isReversedPharmacistLog = false;

function formatTimestamp(timestampString) {
    if (!timestampString) return '';
    try {
        const date = new Date(timestampString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Định dạng 24h
        });
    } catch (e) {
        console.error("Lỗi định dạng timestamp:", timestampString, e);
        return timestampString;
    }
}

async function fetchPatientLogsWithFilter() {
    const spinner = document.getElementById('loadingPatientLogSpinner');
    const tableBody = document.getElementById('patientLogTableBody');
    const searchTerm = document.getElementById('searchPatientLogInput').value;
    const actionType = document.getElementById('filterPatientLogActionType').value;

    spinner.style.display = 'block';
    tableBody.innerHTML = '';

    try {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            actionType: actionType
        });
        const response = await fetch(`/api/systemlogs/patient?${queryParams.toString()}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        patientLogsData = data;

        paginatePatientLogs();

    } catch (error) {
        console.error("Lỗi khi tải nhật ký bệnh nhân:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    } finally {
        spinner.style.display = 'none';
    }
}

function paginatePatientLogs() {
    let displayLogs = [...patientLogsData];

    if (isReversedPatientLog) {
        displayLogs.reverse();
    }

    const startIndex = (currentPagePatientLog - 1) * pageSizePatientLog;
    const endIndex = startIndex + pageSizePatientLog;
    const logsToDisplay = displayLogs.slice(startIndex, endIndex);

    const tableBody = document.getElementById('patientLogTableBody');
    tableBody.innerHTML = '';

    if (logsToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Không có nhật ký bệnh nhân nào.</td></tr>';
    } else {
        const translationMap = {
            // Roles
            'DOCTOR': 'Bác sĩ',
            'RECEPTIONIST': 'Lễ tân',
            'ADMINSYS': 'Quản trị hệ thống',
            'ADMINBUSINESS': 'Quản trị kinh doanh',

            // Action Types
            'CREATE': 'Tạo mới',
            'UPDATE': 'Cập nhật',
            'DELETE': 'Xóa',
            'PRINT': 'In',
            'APPROVE': 'Duyệt',
            'CANCEL': 'Hủy',
            'FEEDBACK': 'Phản hồi',
            'BOOK': 'Đặt lịch'
        };
        logsToDisplay.forEach(log => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = log.log_id;
            row.insertCell().textContent = log.action;
            row.insertCell().textContent = translationMap[log.action_type];
            row.insertCell().textContent = formatTimestamp(log.log_time); // Định dạng thời gian
        });
    }

    updatePatientLogPaginationInfo(displayLogs.length);
}

function updatePatientLogPaginationInfo(totalItems) {
    const paginationInfoSpan = document.getElementById('patientLogPaginationInfo');
    const startIndex = (currentPagePatientLog - 1) * pageSizePatientLog + 1;
    const endIndex = Math.min(startIndex + pageSizePatientLog - 1, totalItems);
    paginationInfoSpan.textContent = `Hiển thị ${totalItems > 0 ? startIndex : 0} đến ${endIndex} trên tổng ${totalItems} mục`;
}

function changePatientLogPage(direction) {
    const totalPages = Math.ceil(patientLogsData.length / pageSizePatientLog);
    currentPagePatientLog += direction;

    if (currentPagePatientLog < 1) {
        currentPagePatientLog = 1;
    } else if (currentPagePatientLog > totalPages) {
        currentPagePatientLog = totalPages;
    }
    paginatePatientLogs();
}

async function fetchStaffLogsWithFilter() {
    const spinner = document.getElementById('loadingStaffLogSpinner');
    const tableBody = document.getElementById('staffLogTableBody');
    const searchTerm = document.getElementById('searchStaffLogInput').value;
    const actionType = document.getElementById('filterStaffLogActionType').value;
    const role = document.getElementById('filterStaffLogRole').value; // Lấy giá trị của filter role

    spinner.style.display = 'block';
    tableBody.innerHTML = '';

    try {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            actionType: actionType,
            role: role // Thêm tham số role
        });
        const response = await fetch(`/api/systemlogs/staff?${queryParams.toString()}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        staffLogsData = data;
        paginateStaffLogs();

    } catch (error) {
        console.error("Lỗi khi tải nhật ký nhân viên:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    } finally {
        spinner.style.display = 'none';
    }
}

function paginateStaffLogs() {
    let displayLogs = [...staffLogsData];

    if (isReversedStaffLog) {
        displayLogs.reverse();
    }

    const startIndex = (currentPageStaffLog - 1) * pageSizeStaffLog;
    const endIndex = startIndex + pageSizeStaffLog;
    const logsToDisplay = displayLogs.slice(startIndex, endIndex);

    const tableBody = document.getElementById('staffLogTableBody');
    tableBody.innerHTML = '';

    if (logsToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có nhật ký nhân viên nào.</td></tr>';
    } else {
        const translationMap = {
            // Roles
            'Doctor': 'Bác sĩ',
            'Receptionist': 'Lễ tân',
            'AdminSys': 'Quản trị hệ thống',
            'AdminBusiness': 'Quản trị kinh doanh',

            // Action Types
            'CREATE': 'Tạo mới',
            'UPDATE': 'Cập nhật',
            'DELETE': 'Xóa',
            'PRINT': 'In',
            'APPROVE': 'Duyệt',
            'CANCEL': 'Hủy',
            'FEEDBACK': 'Phản hồi',
            'BOOK': 'Đặt lịch'
        };

        logsToDisplay.forEach(log => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = log.log_id;
            row.insertCell().textContent = log.action;
            row.insertCell().textContent = translationMap[log.action_type];
            row.insertCell().textContent = formatTimestamp(log.log_time);
            row.insertCell().textContent = translationMap[log.role];
        });
    }

    updateStaffLogPaginationInfo(displayLogs.length);
}

function updateStaffLogPaginationInfo(totalItems) {
    const paginationInfoSpan = document.getElementById('staffLogPaginationInfo');
    const startIndex = (currentPageStaffLog - 1) * pageSizeStaffLog + 1;
    const endIndex = Math.min(startIndex + pageSizeStaffLog - 1, totalItems);
    paginationInfoSpan.textContent = `Hiển thị ${totalItems > 0 ? startIndex : 0} đến ${endIndex} trên tổng ${totalItems} mục`;
}

function changeStaffLogPage(direction) {
    const totalPages = Math.ceil(staffLogsData.length / pageSizeStaffLog);
    currentPageStaffLog += direction;

    if (currentPageStaffLog < 1) {
        currentPageStaffLog = 1;
    } else if (currentPageStaffLog > totalPages) {
        currentPageStaffLog = totalPages;
    }
    paginateStaffLogs();
}

// --- Pharmacist Log Functions ---
async function fetchPharmacistLogsWithFilter() {
    const spinner = document.getElementById('loadingPharmacistLogSpinner');
    const tableBody = document.getElementById('pharmacistLogTableBody');
    const searchTerm = document.getElementById('searchPharmacistLogInput').value;
    const actionType = document.getElementById('filterPharmacistLogActionType').value;

    spinner.style.display = 'block';
    tableBody.innerHTML = '';

    try {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            actionType: actionType
        });
        const response = await fetch(`/api/systemlogs/pharmacist?${queryParams.toString()}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        pharmacistLogsData = data;
        paginatePharmacistLogs();

    } catch (error) {
        console.error("Lỗi khi tải nhật ký dược sĩ:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    } finally {
        spinner.style.display = 'none';
    }
}

function paginatePharmacistLogs() {
    let displayLogs = [...pharmacistLogsData];

    if (isReversedPharmacistLog) {
        displayLogs.reverse();
    }

    const startIndex = (currentPagePharmacistLog - 1) * pageSizePharmacistLog;
    const endIndex = startIndex + pageSizePharmacistLog;
    const logsToDisplay = displayLogs.slice(startIndex, endIndex);

    const tableBody = document.getElementById('pharmacistLogTableBody');
    tableBody.innerHTML = '';

    if (logsToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Không có nhật ký dược sĩ nào.</td></tr>';
    } else {
        const translationMap = {
            // Roles
            'DOCTOR': 'Bác sĩ',
            'RECEPTIONIST': 'Lễ tân',
            'ADMINSYS': 'Quản trị hệ thống',
            'ADMINBUSINESS': 'Quản trị kinh doanh',

            // Action Types
            'CREATE': 'Tạo mới',
            'UPDATE': 'Cập nhật',
            'DELETE': 'Xóa',
            'PRINT': 'In',
            'APPROVE': 'Duyệt',
            'CANCEL': 'Hủy',
            'FEEDBACK': 'Phản hồi',
            'BOOK': 'Đặt lịch'
        };
        logsToDisplay.forEach(log => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = log.log_id;
            row.insertCell().textContent = log.action;
            row.insertCell().textContent = translationMap[log.action_type];
            row.insertCell().textContent = formatTimestamp(log.log_time);
        });
    }

    updatePharmacistLogPaginationInfo(displayLogs.length);
}

function updatePharmacistLogPaginationInfo(totalItems) {
    const paginationInfoSpan = document.getElementById('pharmacistLogPaginationInfo');
    const startIndex = (currentPagePharmacistLog - 1) * pageSizePharmacistLog + 1;
    const endIndex = Math.min(startIndex + pageSizePharmacistLog - 1, totalItems);
    paginationInfoSpan.textContent = `Hiển thị ${totalItems > 0 ? startIndex : 0} đến ${endIndex} trên tổng ${totalItems} mục`;
}

function changePharmacistLogPage(direction) {
    const totalPages = Math.ceil(pharmacistLogsData.length / pageSizePharmacistLog);
    currentPagePharmacistLog += direction;

    if (currentPagePharmacistLog < 1) {
        currentPagePharmacistLog = 1;
    } else if (currentPagePharmacistLog > totalPages) {
        currentPagePharmacistLog = totalPages;
    }
    paginatePharmacistLogs();
}