document.addEventListener('DOMContentLoaded', async function () {
    try {
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
        
        // Update the doctor's name in the greeting
        const doctorNameElement = document.getElementById('doctor-name');
        if (doctorNameElement) {
            doctorNameElement.textContent = data.fullName || 'Doctor';
        }

    } catch (err) {
        console.error('Error loading doctor profile:', err);
        // Set a default name if there's an error
        const doctorNameElement = document.getElementById('doctor-name');
        if (doctorNameElement) {
            doctorNameElement.textContent = 'Doctor';
        }
    }
}); 