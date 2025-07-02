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
        "home-adminsys.html": "home-adminsys.html",
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

