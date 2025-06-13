// ALERT MESSAGE FUNCTION

export function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container');

    // Remove existing toast before adding a new one
    toastContainer.innerHTML = '';

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${message} <button class="close-btn" onclick="closeToast(this)">×</button>`;

    toastContainer.appendChild(toast);

    // Show toast with animation
    // setTimeout(() => , 100);
    toast.classList.add('show')

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function closeToast(button) {
    const toast = button.parentElement;
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
}