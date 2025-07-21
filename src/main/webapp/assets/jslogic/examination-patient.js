// Examination Patient JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load examination results when page loads
    loadExaminationResults();

    // Event for filtering by doctor name
    document.getElementById('doctorSearchInput').addEventListener('input', function () {
        const keyword = this.value.toLowerCase().trim();
        if (keyword === "") {
            displayExaminationResults(allExaminationResults);
            return;
        }

        const filtered = allExaminationResults.filter(result =>
            result.doctorName && result.doctorName.toLowerCase().includes(keyword)
        );

        if (filtered.length > 0) {
            displayExaminationResults(filtered);
        } else {
            document.getElementById('examinationResults').innerHTML = '<p class="text-muted">Không tìm thấy bác sĩ phù hợp.</p>';
        }
    });

    // Event for clearing search
    document.getElementById('clearSearchBtn').addEventListener('click', function () {
        document.getElementById('doctorSearchInput').value = "";
        displayExaminationResults(allExaminationResults);
    });
});

// Global variable to cache all results
let allExaminationResults = [];

/**
 * Load examination results for the current patient
 */
function loadExaminationResults() {
    const loadingElement = document.getElementById('examinationLoading');
    const resultsElement = document.getElementById('examinationResults');
    const noResultsElement = document.getElementById('noResults');
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get('patientId');

    // Show loading
    loadingElement.style.display = 'flex';
    resultsElement.style.display = 'none';
    noResultsElement.style.display = 'none';

    // Make API call to get examination results
    fetch(`/api/examination-results?patientId=${patientId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = 'none';

            if (data.success && data.examinationResults && data.examinationResults.length > 0) {
                allExaminationResults = data.examinationResults;
                displayExaminationResults(data.examinationResults);
            } else {
                showNoResults();
            }
        })
        .catch(error => {
            loadingElement.style.display = 'none';
            showError('Có lỗi xảy ra khi tải kết quả khám bệnh. Vui lòng thử lại sau.');
        });
}

/**
 * Display examination results
 * @param {Array} results - Array of examination results
 */
function displayExaminationResults(results) {
    const resultsElement = document.getElementById('examinationResults');
    let html = `
    <div class="table-responsive">
    <table class="table table-bordered align-middle">
        <thead class="table-light">
            <tr>
                <th>#</th>
                <th>Tên bệnh nhân</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>SĐT bệnh nhân</th>
                <th>Địa chỉ</th>
                <th>Bác sĩ</th>
                <th>Chuyên khoa</th>
                <th>SĐT bác sĩ</th>
                <th>Trình độ</th>
                <th>Triệu chứng</th>
                <th>Chẩn đoán sơ bộ</th>
            </tr>
        </thead>
        <tbody>
    `;
    results.forEach((result, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${result.patientName || ''}</td>
                <td>${result.dob || ''}</td>
                <td>${result.gender || ''}</td>
                <td>${result.patientPhone || ''}</td>  
                <td>${result.address || ''}</td>
                <td>${result.doctorName || ''}</td>
                <td>${result.department || ''}</td>
                <td>${result.doctorPhone || ''}</td>
                <td>${result.eduLevel || ''}</td>
                <td>${result.symptoms || ''}</td>
                <td>${result.preliminaryDiagnosis || ''}</td>
            </tr>
        `;
    });
    html += `
        </tbody>
    </table>
    </div>
    `;
    resultsElement.innerHTML = html;
    resultsElement.style.display = 'block';
}

/**
 * Show no results message
 */
function showNoResults() {
    const noResultsElement = document.getElementById('noResults');
    noResultsElement.style.display = 'block';
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
