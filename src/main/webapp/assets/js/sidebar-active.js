/**
 * Sidebar Active Link Management
 * This script handles the active state of sidebar navigation links
 */

document.addEventListener("DOMContentLoaded", function() {
    initializeSidebar();
});

function initializeSidebar() {
    // Get all sidebar nav links
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link:not(.static-item):not(.disabled)');

    // Get current page path
    const currentPath = location.pathname;
    const currentPage = currentPath.split("/").pop();

    // Flag to track if any link was activated
    let activeFound = false;

    // Initialize links and attach event handlers
    sidebarLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (!href) return;

        // Skip if it's a collapse toggle or doesn't have href
        if (link.hasAttribute('data-bs-toggle') && link.getAttribute('data-bs-toggle') === 'collapse') return;

        // Normalize paths for comparison
        const normalizedLink = href.replace(/^\.\//, '');
        const normalizedCurrent = currentPage.replace(/^\.\//, '');

        // Check if this link matches current page
        if (normalizedLink === normalizedCurrent) {
            setActiveLink(link);
            activeFound = true;
        }

        // Add click event listener
        link.addEventListener('click', function(e) {
            // Only process if it's a standard link (not a dropdown toggle)
            if (!this.hasAttribute('data-bs-toggle')) {
                setActiveLink(this);

                // Store in localStorage
                localStorage.setItem('activeSidebarLink', href);
            }
        });
    });

    // If no link was activated based on URL, try to restore from localStorage
    if (!activeFound) {
        const savedActiveLink = localStorage.getItem('activeSidebarLink');
        if (savedActiveLink) {
            const linkToActivate = document.querySelector('.sidebar .nav-link[href="' + savedActiveLink + '"]');
            if (linkToActivate) {
                setActiveLink(linkToActivate);
            }
        }
    }
}

function setActiveLink(link) {
    // First, remove active class from all links
    document.querySelectorAll('.sidebar .nav-link').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected link
    link.classList.add('active');

    // If the link is in a collapse, expand it
    const parentCollapse = link.closest('.collapse');
    if (parentCollapse) {
        // Get the toggle button that controls this collapse
        const collapseId = parentCollapse.id;
        const toggleButton = document.querySelector('[data-bs-target="#' + collapseId + '"]');

        if (toggleButton) {
            // Add active class to the parent menu item
            toggleButton.classList.add('active');

            // Make sure the collapse is expanded
            const bsCollapse = new bootstrap.Collapse(parentCollapse, {
                toggle: false
            });
            bsCollapse.show();
        }
    }
}
