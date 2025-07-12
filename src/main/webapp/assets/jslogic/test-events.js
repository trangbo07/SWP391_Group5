// Test file to verify event listeners are working
console.log('Test events file loaded');

// Test function to check if elements exist
function testElements() {
    const elements = {
        searchInput: document.getElementById('searchInput'),
        departmentFilter: document.getElementById('departmentFilter'),
        sortSelect: document.getElementById('sortSelect'),
        clearFilters: document.getElementById('clearFilters'),
        resultsCount: document.getElementById('resultsCount'),
        doctorList: document.getElementById('doctorList')
    };
    
    console.log('Elements found:', elements);
    
    // Test if event listeners are attached
    if (elements.searchInput) {
        console.log('Search input found, testing events...');
        elements.searchInput.addEventListener('test', () => {
            console.log('Search input event test successful');
        });
    }
    
    if (elements.departmentFilter) {
        console.log('Department filter found, testing events...');
        elements.departmentFilter.addEventListener('test', () => {
            console.log('Department filter event test successful');
        });
    }
    
    if (elements.sortSelect) {
        console.log('Sort select found, testing events...');
        elements.sortSelect.addEventListener('test', () => {
            console.log('Sort select event test successful');
        });
    }
    
    if (elements.clearFilters) {
        console.log('Clear filters button found, testing events...');
        elements.clearFilters.addEventListener('test', () => {
            console.log('Clear filters event test successful');
        });
    }
}

// Run test when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, running element tests...');
    setTimeout(testElements, 1000); // Wait a bit for other scripts to load
});

// Test global functions
window.testGlobalFunctions = function() {
    console.log('Testing global functions...');
    console.log('clearAllFilters:', typeof window.clearAllFilters);
    console.log('filterDoctors:', typeof window.filterDoctors);
    console.log('sortDoctors:', typeof window.sortDoctors);
    console.log('renderDoctors:', typeof window.renderDoctors);
    console.log('filteredDoctors:', window.filteredDoctors);
}; 