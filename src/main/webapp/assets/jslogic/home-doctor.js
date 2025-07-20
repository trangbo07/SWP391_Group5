// Simple test to see if JavaScript is working
console.log('Home doctor JavaScript loaded!');

document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM Content Loaded!');
    
    // Load doctor profile and display it
    try {
        console.log('Loading doctor profile...');
        const response = await fetch('/api/doctor/profile', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load doctor profile');
        }

        const data = await response.json();
        console.log('Doctor profile data:', data);
        
        // Update the doctor's name in the greeting
        const doctorNameElement = document.getElementById('doctor-name');
        if (doctorNameElement) {
            doctorNameElement.textContent = data.fullName || 'Doctor';
        }

        // Display doctor profile in the card
        const profileElement = document.getElementById('doctor-profile');
        if (profileElement) {
            console.log('Found doctor-profile element, updating content');
            profileElement.innerHTML = `
                <div style="text-align: center;">
                    <img src="${data.img || '../assets/assets/images/avatars/14.png'}" alt="Doctor Avatar" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
                    <h5 class="mt-2">${data.fullName || 'Doctor'}</h5>
                </div>
                <div class="mt-3">
                    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                    <p><strong>Department:</strong> ${data.department || 'N/A'}</p>
                    <p><strong>Education Level:</strong> ${data.eduLevel || 'N/A'}</p>
                    <p><strong>Username:</strong> ${data.username || 'N/A'}</p>
                    <p><strong>Role:</strong> ${data.role || 'N/A'}</p>
                </div>
            `;
            console.log('Doctor profile updated successfully');
        } else {
            console.error('Could not find doctor-profile element');
        }

    } catch (err) {
        console.error('Error loading doctor profile:', err);
        
        // Set a default name if there's an error
        const doctorNameElement = document.getElementById('doctor-name');
        if (doctorNameElement) {
            doctorNameElement.textContent = 'Doctor';
        }
        
        // Show error message in profile card
        const profileElement = document.getElementById('doctor-profile');
        if (profileElement) {
            profileElement.innerHTML = `
                <div class="text-center py-3">
                    <div class="bg-light rounded p-3">
                        <h5 class="text-muted mb-2">Profile Unavailable</h5>
                        <p class="mb-0 small text-muted">Please check your connection and try again.</p>
                    </div>
                </div>
            `;
        }
    }
});
