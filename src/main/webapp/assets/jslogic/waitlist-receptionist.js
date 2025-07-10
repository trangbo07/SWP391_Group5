document.addEventListener('DOMContentLoaded', function() {
    // Initialize DataTable
    const waitlistTable = $('#waitlist-table').DataTable({
        responsive: true,
        order: [[5, 'asc']], // Sort by registered_at by default
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
                        case 'waiting':
                            badgeClass = 'bg-warning';
                            break;
                        case 'in progress':
                            badgeClass = 'bg-info';
                            break;
                        case 'completed':
                            badgeClass = 'bg-success';
                            break;
                        case 'cancelled':
                            badgeClass = 'bg-danger';
                            break;
                        default:
                            badgeClass = 'bg-secondary';
                    }
                    return `<span class="badge ${badgeClass}">${data}</span>`;
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
            { data: 'visittype' },
            {
                data: null,
                render: function(data) {
                    let buttons = '';
                    
                    // Only show status change buttons if not completed or cancelled
                    if (data.status.toLowerCase() !== 'completed' && data.status.toLowerCase() !== 'cancelled') {
                        buttons += `
                            <button class="btn btn-sm btn-info me-1" onclick="updateStatus(${data.waitlist_id}, 'in progress')">
                                Start
                            </button>
                            <button class="btn btn-sm btn-success me-1" onclick="updateStatus(${data.waitlist_id}, 'completed')">
                                Complete
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="updateStatus(${data.waitlist_id}, 'cancelled')">
                                Cancel
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
                    title: 'Error',
                    text: 'Failed to load waitlist data. Please try again.'
                });
            });
    }

    // Function to update waitlist status
    window.updateStatus = function(waitlistId, newStatus) {
        Swal.fire({
            title: 'Confirm Status Change',
            text: `Are you sure you want to change the status to ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!',
            cancelButtonText: 'No, cancel'
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
                        title: 'Success',
                        text: 'Status updated successfully!'
                    });
                    fetchWaitlist(); // Refresh the table
                })
                .catch(error => {
                    console.error('Error updating status:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to update status. Please try again.'
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