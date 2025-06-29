// Examination Patient JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load examination results when page loads
    loadExaminationResults();
});

/**
 * Load examination results for the current patient
 */
function loadExaminationResults() {
    const loadingElement = document.getElementById('examinationLoading');
    const resultsElement = document.getElementById('examinationResults');
    const noResultsElement = document.getElementById('noResults');

    // Show loading
    loadingElement.style.display = 'flex';
    resultsElement.style.display = 'none';
    noResultsElement.style.display = 'none';

    // Make API call to get examination results
    fetch('/api/examination-results', {
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
        // Hide loading
        loadingElement.style.display = 'none';

        if (data.success && data.examinationResults && data.examinationResults.length > 0) {
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
    
    let html = '';
    
    results.forEach((result, index) => {
        html += `
            <div class="examination-section">
                <div class="examination-date">
                    <i class="fas fa-calendar-alt me-2"></i>
                    Kết quả khám ngày: ${formatDate(result.examinationDate)}
                </div>
                
                <div class="examination-result">
                    <h6><i class="fas fa-user-md me-2"></i>Bác sĩ khám:</h6>
                    <p>${result.doctorName || 'Chưa có thông tin'}</p>
                </div>
                
                <div class="examination-result">
                    <h6><i class="fas fa-notes-medical me-2"></i>Triệu chứng:</h6>
                    <p>${result.symptoms || 'Chưa có thông tin'}</p>
                </div>
                
                <div class="examination-result">
                    <h6><i class="fas fa-stethoscope me-2"></i>Chẩn đoán sơ bộ:</h6>
                    <p>${result.preliminaryDiagnosis || 'Chưa có thông tin'}</p>
                </div>
            </div>
        `;
    });
    
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

/**
 * Format date to Vietnamese format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return 'Chưa có thông tin';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}
