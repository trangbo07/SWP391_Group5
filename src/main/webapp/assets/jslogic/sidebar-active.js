document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar-menu");

    // Ghi nhớ href mỗi khi click
    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function () {
            const href = this.getAttribute("href");
            if (href && !href.startsWith("#") && href !== "#") {
                localStorage.setItem("sidebar-active", href);
            }
        });
    });

    // Lấy href đã lưu hoặc fallback theo URL hiện tại
    const currentPath = window.location.pathname.split("/").pop();
    let activeHref = localStorage.getItem("sidebar-active") || currentPath;

    // 🧠 Mapping tùy chỉnh (ví dụ: "home-adminsys.html" thuộc Admin Dashboard)
    const customMap = {
        // Admin System Dashboard
        "home-adminsys.html": "home-adminsys.html",
        "announcement-adminsys.html": "home-adminsys.html",
        "announcements-adminsys.html": "home-adminsys.html",
        "report.html": "home-adminsys.html",
        "manage-services.html": "home-adminsys.html",
        "payment.html": "home-adminsys.html",
        "medicine-warehouse.html": "home-adminsys.html",
        // Admin Business Dashboard
        "home-adminbusiness.html": "home-adminbusiness.html",
        "announcement-adminbusiness.html": "home-adminbusiness.html",
        "report.html": "home-adminbusiness.html",
        "manage-services.html": "home-adminbusiness.html",
        "payment.html": "home-adminbusiness.html",
        "medicine-warehouse.html": "home-adminbusiness.html",
        // Add more mappings as needed
    };

    // Nếu đang ở 1 trang alias → gán đúng vào "home-adminsys.html"
    if (customMap[currentPath]) {
        activeHref = customMap[currentPath];
    }

    // Bỏ tất cả trạng thái cũ
    sidebar.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    sidebar.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    sidebar.querySelectorAll(".sub-nav").forEach(sub => sub.classList.remove("show"));

    // Active đúng link theo href
    const activeLink = sidebar.querySelector(`.nav-link[href="${activeHref}"]`);
    if (activeLink) {
        activeLink.classList.add("active");

        const navItem = activeLink.closest(".nav-item");
        if (navItem) navItem.classList.add("active");

        const subNav = activeLink.closest(".sub-nav");
        if (subNav) {
            subNav.classList.add("show");

            const parentToggle = subNav.previousElementSibling;
            if (parentToggle) {
                parentToggle.classList.remove("collapsed");
                parentToggle.classList.add("active");
                parentToggle.setAttribute("aria-expanded", "true");

                const parentItem = parentToggle.closest(".nav-item");
                if (parentItem) parentItem.classList.add("active");
            }
        }
    }
});

