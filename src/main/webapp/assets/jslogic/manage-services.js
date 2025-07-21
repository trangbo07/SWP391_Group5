let currentPage = 1;
const pageSize = 10;
let totalPages = 1;

$(document).ready(function() {
    loadServices();
    
    // Khôi phục trạng thái toggle từ localStorage
    let savedGlobalToggle = localStorage.getItem('globalNotificationToggle');
    let savedModalToggle = localStorage.getItem('modalNotificationToggle');
    
    if (savedGlobalToggle !== null) {
        $('#globalNotificationToggle').prop('checked', savedGlobalToggle === 'true');
    }
    if (savedModalToggle !== null) {
        $('#notificationToggle').prop('checked', savedModalToggle === 'true');
    }
    
    // Lưu trạng thái toggle toàn cục
    $('#globalNotificationToggle').on('change', function() {
        localStorage.setItem('globalNotificationToggle', $(this).is(':checked'));
    });
    
    // Lưu trạng thái toggle modal
    $('#notificationToggle').on('change', function() {
        localStorage.setItem('modalNotificationToggle', $(this).is(':checked'));
    });

    // Tìm kiếm dịch vụ
    $('#searchInput').on('input', function() {
        currentPage = 1;
        let keyword = $(this).val();
        loadServices(keyword);
    });

    // Xử lý submit form (thêm/sửa)
    $('#serviceForm').on('submit', function(e) {
        e.preventDefault();
        let id = $('#serviceId').val();
        let data = {
            name: $('#serviceName').val(),
            description: $('#serviceDescription').val(),
            price: $('#servicePrice').val()
        };
        
        // Kiểm tra toggle thông báo (ưu tiên toggle toàn cục)
        let showNotification = $('#globalNotificationToggle').is(':checked') && $('#notificationToggle').is(':checked');
        
        if (id) {
            data.service_id = id;
            $.ajax({
                url: '/services?action=update',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function() {
                    $('#serviceModal').modal('hide');
                    loadServices();
                    
                    // Hiển thị thông báo nếu toggle được bật
                    if (showNotification) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thành công!',
                            text: 'Dịch vụ đã được cập nhật thành công.',
                            showConfirmButton: false,
                            timer: 2000,
                            position: 'top-end',
                            toast: true
                        });
                    }
                },
                error: function() {
                    if (showNotification) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi!',
                            text: 'Không thể cập nhật dịch vụ. Vui lòng thử lại.',
                            showConfirmButton: false,
                            timer: 3000,
                            position: 'top-end',
                            toast: true
                        });
                    }
                }
            });
        } else {
            $.ajax({
                url: '/services?action=add',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function() {
                    $('#serviceModal').modal('hide');
                    loadServices();
                    
                    // Hiển thị thông báo nếu toggle được bật
                    if (showNotification) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thành công!',
                            text: 'Dịch vụ đã được thêm thành công.',
                            showConfirmButton: false,
                            timer: 2000,
                            position: 'top-end',
                            toast: true
                        });
                    }
                },
                error: function() {
                    if (showNotification) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi!',
                            text: 'Không thể thêm dịch vụ. Vui lòng thử lại.',
                            showConfirmButton: false,
                            timer: 3000,
                            position: 'top-end',
                            toast: true
                        });
                    }
                }
            });
        }
    });

    // Sự kiện chuyển trang
    $(document).on('click', '.pagination .page-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page && page !== currentPage && page >= 1 && page <= totalPages) {
            currentPage = page;
            loadServices($('#searchInput').val());
        }
    });
});

// Load danh sách dịch vụ có phân trang
function loadServices(keyword = '') {
    let url = '/services?action=api&page=' + currentPage + '&size=' + pageSize;
    if (keyword) url += '&search=' + encodeURIComponent(keyword);
    $.get(url, function(data) {
        let tbody = $('#servicesTable tbody');
        tbody.empty();
        let from = 0, to = 0, total = 0;
        if (data && data.services && data.services.length > 0) {
            data.services.forEach(function(service) {
                tbody.append(`
                    <tr>
                        <td>${service.service_id}</td>
                        <td>${service.name}</td>
                        <td>${service.description}</td>
                        <td>${service.price.toLocaleString()}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="openEditModal(${service.service_id})">Sửa</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteService(${service.service_id})">Xóa</button>
                        </td>
                    </tr>
                `);
            });
            from = (data.page - 1) * pageSize + 1;
            to = from + data.services.length - 1;
            total = data.totalItems;
        } else {
            tbody.append('<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
            from = 0; to = 0; total = 0;
        }
        // Cập nhật phân trang
        totalPages = data.totalPages || 1;
        renderPagination();
        // Hiển thị info
        $('#pagination-info').text(`Showing ${from} to ${to} of ${total} entries`);
    });
}

// Vẽ thanh phân trang
function renderPagination() {
    let paginationHtml = '<nav><ul class="pagination justify-content-end mb-0">';
    let maxShow = 5;
    let start = Math.max(1, currentPage - Math.floor(maxShow/2));
    let end = Math.min(totalPages, start + maxShow - 1);
    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);
    if (currentPage > 1) {
        paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage-1}">Previous</a></li>`;
    }
    for (let i = start; i <= end; i++) {
        paginationHtml += `<li class="page-item${i === currentPage ? ' active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    if (currentPage < totalPages) {
        paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage+1}">Next</a></li>`;
    }
    paginationHtml += '</ul></nav>';
    $('#pagination-wrapper').html(paginationHtml);
}

// Mở modal thêm mới
function openAddModal() {
    $('#serviceModalLabel').text('Thêm dịch vụ');
    $('#serviceId').val('');
    $('#serviceName').val('');
    $('#serviceDescription').val('');
    $('#servicePrice').val('');
    $('#serviceModal').modal('show');
}

// Mở modal sửa
function openEditModal(id) {
    $.get('/services?action=api&id=' + id, function(service) {
        $('#serviceModalLabel').text('Sửa dịch vụ');
        $('#serviceId').val(service.service_id);
        $('#serviceName').val(service.name);
        $('#serviceDescription').val(service.description);
        $('#servicePrice').val(service.price);
        $('#serviceModal').modal('show');
    });
}

// Xóa dịch vụ
function deleteService(id) {
    Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: "Bạn không thể hoàn tác hành động này!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Có, xóa nó!',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/services?action=delete&id=' + id,
                type: 'POST',
                success: function() {
                    loadServices($('#searchInput').val());
                    
                    // Kiểm tra toggle thông báo (ưu tiên toggle toàn cục)
                    let showNotification = $('#globalNotificationToggle').is(':checked') && $('#notificationToggle').is(':checked');
                    if (showNotification) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Đã xóa!',
                            text: 'Dịch vụ đã được xóa thành công.',
                            showConfirmButton: false,
                            timer: 2000,
                            position: 'top-end',
                            toast: true
                        });
                    }
                },
                error: function() {
                    let showNotification = $('#globalNotificationToggle').is(':checked') && $('#notificationToggle').is(':checked');
                    if (showNotification) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi!',
                            text: 'Không thể xóa dịch vụ. Vui lòng thử lại.',
                            showConfirmButton: false,
                            timer: 3000,
                            position: 'top-end',
                            toast: true
                        });
                    }
                }
            });
        }
    });
} 