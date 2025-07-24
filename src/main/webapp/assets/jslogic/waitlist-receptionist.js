document.addEventListener('DOMContentLoaded', function() {
    // Initialize DataTable
    // Hàm chuyển trạng thái sang tiếng Việt
    function getStatusVN(status) {
        switch ((status || '').toLowerCase()) {
            case 'waiting': return 'Đang chờ';
            case 'in progress': return 'Đang khám';
            case 'completed': return 'Đã hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status || '';
        }
    }
    // Hàm chuyển loại khám sang tiếng Việt
    function getVisitTypeVN(type) {
        switch ((type || '').toLowerCase()) {
            case 'initial': return 'Khám ban đầu';
            case 'result': return 'Trả kết quả';
            default: return type || '';
        }
    }
    const waitlistTable = $('#waitlist-table').DataTable({
        responsive: true,
        order: [[5, 'asc']], // Sort by registered_at by default
        language: {
            sProcessing:   'Đang xử lý...',
            sLengthMenu:   'Hiển thị _MENU_ mục',
            sZeroRecords:  'Không tìm thấy dòng nào phù hợp',
            sInfo:         'Hiển thị _START_ đến _END_ của _TOTAL_ mục',
            sInfoEmpty:    'Hiển thị 0 đến 0 của 0 mục',
            sInfoFiltered: '(lọc từ _MAX_ mục)',
            sInfoPostFix:  '',
            sSearch:       'Tìm kiếm:',
            sUrl:          '',
            oPaginate: {
                sFirst:    'Đầu',
                sPrevious: 'Trước',
                sNext:     'Tiếp',
                sLast:     'Cuối'
            }
        },
        columns: [
            { data: 'waitlist_id' },
            { data: 'patientName' },
            { data: 'doctorName' },
            { data: 'roomName' },
            { 
                data: 'status',
                render: function(data) {
                    let badgeClass = '';
                    switch(data.toLowerCase()) {
                        case 'waiting': badgeClass = 'bg-warning'; break;
                        case 'in progress': badgeClass = 'bg-info'; break;
                        case 'completed': badgeClass = 'bg-success'; break;
                        case 'cancelled': badgeClass = 'bg-danger'; break;
                        default: badgeClass = 'bg-secondary';
                    }
                    return `<span class="badge ${badgeClass}">${getStatusVN(data)}</span>`;
                }
            },
            { 
                data: 'registered_at',
                render: function(data) {
                    return moment(data).format('DD/MM/YYYY HH:mm');
                }
            },
            { 
                data: 'estimated_time',
                render: function(data) {
                    return moment(data).format('HH:mm');
                }
            },
            { 
                data: 'visittype',
                render: function(data) {
                    return getVisitTypeVN(data);
                }
            },
            {
                data: null,
                render: function(data) {
                    let buttons = '';
                    if (data.status.toLowerCase() !== 'completed' && data.status.toLowerCase() !== 'cancelled') {
                        buttons += `
                            <button class="btn btn-sm btn-info me-1" onclick="updateStatus(${data.waitlist_id}, 'in progress')">
                                Bắt đầu khám
                            </button>
                            <button class="btn btn-sm btn-success me-1" onclick="updateStatus(${data.waitlist_id}, 'completed')">
                                Hoàn thành
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="updateStatus(${data.waitlist_id}, 'cancelled')">
                                Hủy
                            </button>
                        `;
                    }
                    return buttons;
                }
            }
        ]
    });

    // Function to fetch waitlist data
    function fetchWaitlist() {
        fetch('../receptionist/waitlist')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data); // Debug log
                waitlistTable.clear().rows.add(data).draw();
            })
            .catch(error => {
                console.error('Error fetching waitlist:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải danh sách chờ. Vui lòng thử lại.'
                });
            });
    }

    // Function to update waitlist status
    window.updateStatus = function(waitlistId, newStatus) {
        Swal.fire({
            title: 'Xác nhận thay đổi trạng thái',
            text: `Bạn có chắc chắn muốn chuyển trạng thái sang "${getStatusVN(newStatus)}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`../receptionist/waitlist/${waitlistId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: 'Cập nhật trạng thái thành công!'
                    });
                    fetchWaitlist(); // Refresh the table
                })
                .catch(error => {
                    console.error('Error updating status:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Cập nhật trạng thái thất bại. Vui lòng thử lại.'
                    });
                });
            }
        });
    };

    // Initial load of waitlist data
    fetchWaitlist();

    // Refresh waitlist data every 30 seconds
    setInterval(fetchWaitlist, 30000);
}); 