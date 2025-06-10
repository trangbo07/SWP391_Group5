// Get the context path of the application
function getContextPath() {
    const path = window.location.pathname;
    const segments = path.split('/');
    // Remove empty segments and the current page
    segments.pop();
    return segments.join('/');
}

// Function to get full path for assets
function getAssetPath(path) {
    const contextPath = getContextPath();
    // Remove leading slash if exists
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return contextPath + '/' + cleanPath;
}

// Function to fix all image sources
function fixImagePaths() {
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        const originalSrc = img.getAttribute('src');
        if (originalSrc && !originalSrc.startsWith('http')) {
            img.setAttribute('src', getAssetPath(originalSrc));
        }
    }
}

// Run when document is ready
document.addEventListener('DOMContentLoaded', fixImagePaths); 