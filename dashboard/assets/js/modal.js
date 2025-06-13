function showModal() {
    // Create modal overlay
    console.log('modal open');
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('custom-modal-overlay');
    modalOverlay.id = 'custom-modal-overlay';

    // Modal structure
    modalOverlay.innerHTML = `
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h5 class="text-center">Update PASSWORD</h5>
                <span id="closeModal" style="margin-left:auto; cursor:pointer; font-size: 40px;">&times;</span>
            </div>
            <div class="custom-modal-content">
                <div class="input-container">
                    <input type="number" placeholder="Old password" id="oldPass">
                    <input type="number" placeholder="New password" id="newPass" class="my-3">
                    <input type="number" placeholder="Confirm new password" id="confirmNewPass">
                </div> 
                <div class="btn-pay">
                    <button class="btn-brand" id="update_password">Update Password</button>
                </div>
            </div>
        </div>
    `;

    // Append modal to body
    document.body.appendChild(modalOverlay);

    // Close modal when clicking the close button
    document.getElementById('closeModal').addEventListener('click', function() {
        modalOverlay.remove();
    });

    // Close modal when clicking outside the modal
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// Attach event listener to button
document.getElementById('openModal').addEventListener('click', function(e) {
    e.preventDefault();
    showModal();
});
