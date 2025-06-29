/**
 * Service Order Status Management JavaScript
 * This file provides functions to update waitlist status and visittype after service order creation
 */

// === CORE API FUNCTIONS ===

/**
 * Set both status and visittype for a waitlist after service order creation
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @param {string} status - New status value
 * @param {string} visittype - New visittype value
 * @returns {Promise<Object>} Response object
 */
async function setServiceOrderStatus(serviceOrderId, waitlistId, status, visittype) {
    try {
        const requestBody = {
            serviceOrderId: serviceOrderId,
            waitlistId: waitlistId
        };

        if (status) requestBody.status = status;
        if (visittype) requestBody.visittype = visittype;

        const response = await fetch('/api/service-order/status', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Service order status updated successfully:', result);
            showAlert(result.message, 'success');
            return result;
        } else {
            throw new Error(result.message || 'Failed to update service order status');
        }
    } catch (error) {
        console.error("Error updating service order status:", error);
        showAlert(error.message || 'Failed to update service order status', 'danger');
        throw error;
    }
}

/**
 * Set only status for a waitlist after service order creation
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @param {string} status - New status value
 * @returns {Promise<Object>} Response object
 */
async function setServiceOrderStatusOnly(serviceOrderId, waitlistId, status) {
    return await setServiceOrderStatus(serviceOrderId, waitlistId, status, null);
}

/**
 * Set only visittype for a waitlist after service order creation
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @param {string} visittype - New visittype value
 * @returns {Promise<Object>} Response object
 */
async function setServiceOrderVisittypeOnly(serviceOrderId, waitlistId, visittype) {
    return await setServiceOrderStatus(serviceOrderId, waitlistId, null, visittype);
}

// === PREDEFINED STATUS FUNCTIONS ===

/**
 * Mark service order as completed and set visittype to Result
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @returns {Promise<Object>} Response object
 */
async function markServiceOrderCompleted(serviceOrderId, waitlistId) {
    return await setServiceOrderStatus(serviceOrderId, waitlistId, 'Waiting', 'Result');
}

/**
 * Mark service order as in progress
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @returns {Promise<Object>} Response object
 */
async function markServiceOrderInProgress(serviceOrderId, waitlistId) {
    return await setServiceOrderStatusOnly(serviceOrderId, waitlistId, 'InProgress');
}

/**
 * Mark service order as completed
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @returns {Promise<Object>} Response object
 */
async function markServiceOrderFinished(serviceOrderId, waitlistId) {
    return await setServiceOrderStatusOnly(serviceOrderId, waitlistId, 'Completed');
}

/**
 * Set visittype back to Initial (for re-examination)
 * @param {number} serviceOrderId - ID of the service order
 * @param {number} waitlistId - ID of the waitlist
 * @returns {Promise<Object>} Response object
 */
async function setServiceOrderToInitial(serviceOrderId, waitlistId) {
    return await setServiceOrderVisittypeOnly(serviceOrderId, waitlistId, 'Initial');
}

// === UTILITY FUNCTIONS ===

/**
 * Get API information
 * @returns {Promise<Object>} API documentation
 */
async function getServiceOrderStatusAPIInfo() {
    try {
        const response = await fetch('/api/service-order/status', {
            method: 'GET',
            credentials: 'include'
        });

        const apiInfo = await response.json();
        console.log('Service Order Status API Info:', apiInfo);
        return apiInfo;
    } catch (error) {
        console.error("Error getting API info:", error);
        throw error;
    }
}

/**
 * Test the service order status API with sample data
 */
async function testServiceOrderStatusAPI() {
    console.log('=== Testing Service Order Status API ===');
    
    // Test getting API info
    try {
        const apiInfo = await getServiceOrderStatusAPIInfo();
        console.log('✓ API Info retrieved successfully');
        console.log('Examples:', apiInfo.examples);
    } catch (error) {
        console.error('✗ Failed to get API info:', error.message);
    }
    
    // Note: Actual testing with real data should be done with valid IDs
    console.log('To test with real data, use:');
    console.log('await markServiceOrderCompleted(123, 456);');
    console.log('await setServiceOrderStatus(123, 456, "Result", "Waiting");');
}

/**
 * Show alert message (assumes Bootstrap alert system)
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    // Check if showAlert function exists globally
    if (typeof window.showAlert === 'function') {
        window.showAlert(message, type);
    } else {
        // Fallback to console if no alert system available
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Try to create a simple Bootstrap alert if possible
        try {
            const alertContainer = document.getElementById('alert-container') || document.body;
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            alertContainer.appendChild(alertDiv);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (alertDiv && alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 5000);
        } catch (err) {
            // If even this fails, just use console
            console.log(`Alert: ${message}`);
        }
    }
}

// === INTEGRATION HELPER FUNCTIONS ===

/**
 * Helper function to be called after successful service order creation
 * Automatically sets status to "Result" and visittype to "Waiting"
 * @param {number} serviceOrderId - ID of the newly created service order
 * @param {number} waitlistId - ID of the waitlist (optional)
 */
async function afterServiceOrderCreated(serviceOrderId, waitlistId) {
    if (!serviceOrderId) {
        console.error('Service order ID is required');
        return false;
    }

    try {
        if (waitlistId) {
            // Set to standard post-service-order state
            const result = await markServiceOrderCompleted(serviceOrderId, waitlistId);
            console.log('Service order post-creation status updated:', result);
            return true;
        } else {
            console.log('No waitlist ID provided, service order created successfully without waitlist update');
            return true;
        }
    } catch (error) {
        console.error('Failed to update status after service order creation:', error);
        return false;
    }
}

/**
 * Batch update multiple service orders
 * @param {Array} serviceOrders - Array of {serviceOrderId, waitlistId, status, visittype}
 */
async function batchUpdateServiceOrderStatus(serviceOrders) {
    const results = [];
    
    for (const order of serviceOrders) {
        try {
            const result = await setServiceOrderStatus(
                order.serviceOrderId,
                order.waitlistId,
                order.status,
                order.visittype
            );
            results.push({ success: true, ...result });
        } catch (error) {
            results.push({ 
                success: false, 
                serviceOrderId: order.serviceOrderId,
                error: error.message 
            });
        }
    }
    
    console.log('Batch update results:', results);
    return results;
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Service Order Status API loaded');
    console.log('Available functions:');
    console.log('- setServiceOrderStatus(serviceOrderId, waitlistId, status, visittype)');
    console.log('- markServiceOrderCompleted(serviceOrderId, waitlistId)');
    console.log('- markServiceOrderInProgress(serviceOrderId, waitlistId)');
    console.log('- markServiceOrderFinished(serviceOrderId, waitlistId)');
    console.log('- setServiceOrderToInitial(serviceOrderId, waitlistId)');
    console.log('- afterServiceOrderCreated(serviceOrderId, waitlistId)');
    console.log('- testServiceOrderStatusAPI()');
    console.log('- getServiceOrderStatusAPIInfo()');
}); 