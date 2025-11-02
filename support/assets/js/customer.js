import { showToast } from './message.js'; 

const BASE_URL = 'https://gobapay.onrender.com/api';
let allCustomers = [];
let currentPage = 1;
let totalPages = 1;
let totalUsers = 0;
let limit = 10;

// Utility functions from script.js (already available globally)
const { getToken, showToastSafe } = window;

function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s).replace(/[&<>"']/g, c =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]
    );
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function formatCurrency(amount) {
    if (!amount) return 'NGN 0.00';
    return `NGN ${Number(amount/100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const tbody = document.querySelector('.table-wrapper table tbody');

function setMessageRow(msg) {
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">${escapeHtml(msg)}</td></tr>`;
}

function buildRow(c) {
    const id = escapeHtml(c._id || '');
    const name = escapeHtml(c.fullName || 'No name');
    const accNumber = escapeHtml(c.beneficiaryAccountNumber || 'N/A');
    const joined = escapeHtml(formatDate(c.createdAt || ''));
    const isActive = c.accountStatus === 'active';
    const statusClass = isActive ? 'status-active' : 'status-suspended';
    const statusText = isActive ? 'Active' : 'Inactive';

    // Store complete customer data
    const customerData = JSON.stringify(c).replace(/"/g, '&quot;');

    return `
        <tr class="customer-row" data-customer='${customerData}'>
            <td><input type="checkbox" data-id="${id}"></td>
            <td>
                <div class="name-block">
                    <span class="avatar-placeholder">
                        <i class="fa fa-user"></i>
                    </span>
                    <div class="name-meta">
                        <div><span class="title">${name}</span></div>
                        <div class="subtitle">${escapeHtml(c.email || '')}</div>
                    </div>
                </div>
            </td>
            <td>${accNumber}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${joined}</td>
            <td class="actions">
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-edit" 
                            data-bs-toggle="modal"
                            data-bs-target="#editCustomerModal"
                            data-customer='${customerData}'>
                        <i class="fa fa-edit"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-delete" 
                            data-action="delete" 
                            data-id="${id}">
                        <i class="fa fa-trash-alt"></i>Delete
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Load customers with pagination
async function loadCustomers(page = 1, itemsPerPage = 10) {
    if (!tbody) return;
    setMessageRow('Loading customers...');

    const token = getToken();
    if (!token) {
        setMessageRow('No token found. Please login.');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/staff/allusers?page=${page}&limit=${itemsPerPage}`, {
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Accept': 'application/json' 
            }
        });

        const data = await res.json();

        if (!res.ok) {
            const msg = data && (data.message || data.error) ? (data.message || data.error) : `Request failed (${res.status})`;
            console.error('API Error:', msg);
            setMessageRow('Loading customers...');
            return;
        }

        // Use the exact structure from your API response
        const items = Array.isArray(data.users) ? data.users : [];

        if (!items.length) {
            setMessageRow('No customers found.');
            return;
        }

        // Update pagination data using the exact property names from your API
        allCustomers = items;
        currentPage = data.currentPage || page;
        totalPages = data.totalPages || 1;
        totalUsers = data.totalUsers || 0;
        limit = itemsPerPage;

        // Render table rows
        tbody.innerHTML = items.map(buildRow).join('');

        // Update showing text
        updateShowingText();

        // Render pagination
        renderPagination();

    } catch (err) {
        console.error('loadCustomers error:', err);
        setMessageRow('Loading customers...');
    }
}

function updateShowingText() {
    const showingElement = document.querySelector('.p-3.text-muted');
    if (showingElement) {
        const start = ((currentPage - 1) * limit) + 1;
        const end = Math.min(currentPage * limit, totalUsers);
        showingElement.textContent = `Showing ${start}-${end} of ${totalUsers} total Users`;
    }
}

function renderPagination() {
    // Remove existing pagination
    const existingPagination = document.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }

    // Create pagination container
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) return;

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container mt-4 d-flex justify-content-between align-items-center';

    // Items per page selector
    const itemsPerPageHtml = `
        <div class="items-per-page">
            <label for="itemsPerPage" class="form-label me-2">Items per page:</label>
            <select class="form-select form-select-sm d-inline-block w-auto" id="itemsPerPage">
                <option value="5" ${limit === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${limit === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${limit === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${limit === 50 ? 'selected' : ''}>50</option>
            </select>
        </div>
    `;

    // Pagination buttons
    let paginationHtml = `
        <nav aria-label="Customer pagination">
            <ul class="pagination pagination-sm mb-0">
    `;

    // Previous button
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" style="color: var(--secondary-color);">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="1" style="color: var(--secondary-color);">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link" style="color: var(--secondary-color);">...</span></li>`;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHtml += `
            <li class="page-item ${isActive ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}" 
                   style="${isActive ? 
                       'background-color: var(--secondary-color); color: var(--primary-color); border-color: var(--secondary-color);' : 
                       'color: var(--secondary-color);'}">
                    ${i}
                </a>
            </li>
        `;
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link" style="color: var(--secondary-color);">...</span></li>`;
        }
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}" style="color: var(--secondary-color);">${totalPages}</a>
            </li>
        `;
    }

    // Next button
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" style="color: var(--secondary-color);">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    paginationHtml += `
            </ul>
        </nav>
    `;

    paginationContainer.innerHTML = itemsPerPageHtml + paginationHtml;
    
    // Insert after table wrapper
    tableWrapper.parentNode.insertBefore(paginationContainer, tableWrapper.nextSibling);

    // Add event listeners
    attachPaginationEvents();
}

function attachPaginationEvents() {
    // Page number clicks
    document.querySelectorAll('.page-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                loadCustomers(page, limit);
            }
        });
    });

    // Items per page change
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            limit = parseInt(this.value);
            loadCustomers(1, limit);
        });
    }
}

// Function to open customer details
function openCustomerDetails(customer) {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs and contents
    tabItems.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Keep the "View Customers" tab visually active
    const viewCustomersTab = document.querySelector('.tab-item[data-tab="view-customers"]');
    if (viewCustomersTab) {
        viewCustomersTab.classList.add('active');
    }
    
    // Activate the customer-details tab
    const detailsTab = document.getElementById('customer-details-tab');
    if (detailsTab) {
        detailsTab.classList.add('active');
    }
    
    // Populate the customer details
    populateCustomerDetails(customer);
}

// Function to populate customer details with unique IDs
function populateCustomerDetails(customer) {
    // Format status
    const isActive = customer.accountStatus === 'active';
    const statusClass = isActive ? 'status-active' : 'status-suspended';
    const statusText = isActive ? 'Active' : 'Inactive';
    
    // Format verification status
    const isVerified = customer.isVerified;
    const verificationClass = isVerified ? 'status-active' : 'status-suspended';
    const verificationText = isVerified ? 'Verified' : 'Unverified';
    
    // Format KYC status
    const isKYC = customer.isKYC || customer.profile?.isKYCsubmitted;
    const kycClass = isKYC ? 'status-active' : 'status-suspended';
    const kycText = isKYC ? 'KYC Verified' : 'KYC Unverified';

    console.log('Populating customer details:', customer);

    // Update customer details section
    const profileName = document.querySelector('.customer .profile-name');
    const accountNumber = document.querySelector('.customer .profile-staff-id');
    const balance = document.querySelector('.customer .balance p');
    const statusBadge = document.getElementById('btn-status');
    
    if (profileName) profileName.textContent = customer.fullName || 'No name';
    if (accountNumber) accountNumber.textContent = customer.beneficiaryAccountNumber || 'N/A';
    if (balance) balance.textContent = formatCurrency(customer.balanceInKobo);
    
    if (statusBadge) {
        statusBadge.className = `detail-value ${statusClass}`;
        statusBadge.textContent = statusText;
        statusBadge.style.paddingLeft = '.7rem';
        statusBadge.style.paddingRight = '.7rem';
    }

    // Populate using unique IDs
    const setDetailValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || '';
    };

    const setStatusValue = (id, value, statusClass) => {
        const element = document.getElementById(id);
        if (element) {
            element.className = `detail-value ${statusClass}`;
            element.textContent = value;
        }
    };

    // Personal Information
    setDetailValue('customer-first-name', customer.first_name);
    setDetailValue('customer-middle-name', customer.middle_name);
    setDetailValue('customer-last-name', customer.last_name);
    setDetailValue('customer-gender', customer.gender);
    
    // Contact Information
    setDetailValue('customer-country', customer.country);
    setDetailValue('customer-phone', customer.phone);
    setDetailValue('customer-bvn', customer.bvn);
    
    // Account Verification
    setStatusValue('customer-verification', verificationText, verificationClass);
    
    // Email and Tier
    setDetailValue('customer-email', customer.email);
    setDetailValue('customer-tier', customer.tier || 'Tier 1');
    
    // Business Information
    setDetailValue('customer-business-name', customer.businessName);
    setDetailValue('customer-address', customer.address);
    
    // Dates
    setDetailValue('customer-date-joined', formatDate(customer.createdAt));
    setDetailValue('customer-last-updated', formatDate(customer.updatedAt));
    
    // KYC Status
    setStatusValue('customer-kyc-status', kycText, kycClass);
    
    // Registered By
    setDetailValue('customer-registered-by', 'Marketer');
    
    // NIN
    setDetailValue('customer-nin', customer.profile?.ninNumber || 'N/A');

    // Set current customer for image modal
    imageModal.setCurrentCustomer(customer);

    // Update edit button
    const editButton = document.querySelector('.customer .btn-edit-profile');
    if (editButton) {
        editButton.onclick = function() {
            showToastSafe('Edit customer functionality coming soon', 'info');
        };
    }
    
    // Update delete button
    const deleteButton = document.querySelector('.customer .btn-delete-supervisor');
    if (deleteButton) {
        deleteButton.onclick = function() {
            if (confirm('Delete this customer? This cannot be undone.')) {
                deleteCustomer(customer._id);
            }
        };
    }
    
    // Ensure the view customers tab stays active
    const viewCustomersTab = document.querySelector('.tab-item[data-tab="view-customers"]');
    const allTabItems = document.querySelectorAll('.tab-item');
    
    allTabItems.forEach(item => item.classList.remove('active'));
    if (viewCustomersTab) {
        viewCustomersTab.classList.add('active');
    }
}

// Delete customer function
async function deleteCustomer(id) {
    const token = getToken();
    if (!token) return showToastSafe('Missing token', 'danger');

    try {
        const res = await fetch(`${BASE_URL}/staff/delete-customer/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        showToastSafe(data.message || 'Customer deleted', 'success');
        
        // Only refresh after successful deletion
        loadCustomers(currentPage, limit);
        
        // Also switch back to view customers tab after deletion
        switchToTab('view-customers');
        
    } catch (err) {
        console.error('deleteCustomer error:', err);
        showToastSafe('Network error while deleting', 'danger');
    }
}

// Tab functionality
function attachTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Always allow tab switching
            tabItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const el = document.getElementById(`${tabId}-tab`);
            if (el) el.classList.add('active');

            // Load customers when switching to view-customers tab
            if (tabId === 'view-customers') {
                loadCustomers(currentPage, limit);
            }
        });
    });
}

// Function to switch to a specific tab (for sidebar integration)
function switchToTab(tabId) {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs and contents
    tabItems.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activate the target tab
    const targetTabItem = document.querySelector(`.tab-item[data-tab="${tabId}"]`);
    const targetTabContent = document.getElementById(`${tabId}-tab`);
    
    if (targetTabItem) {
        targetTabItem.classList.add('active');
    }
    if (targetTabContent) {
        targetTabContent.classList.add('active');
    }
    
    // Load customers if switching to view-customers tab
    if (tabId === 'view-customers') {
        loadCustomers(currentPage, limit);
    }
    
    // Clear the stored tab after switching
    localStorage.removeItem('targetTab');
}

// Function to handle tab activation on page load
function activateStoredTab() {
    const targetTab = localStorage.getItem('targetTab');
    if (targetTab) {
        // Small delay to ensure DOM is fully loaded
        setTimeout(() => {
            switchToTab(targetTab);
        }, 100);
    }
}

// Back button functionality
function attachBackButton() {
    const backButton = document.getElementById('backToCustomersBtn');
    if (backButton) {
        backButton.addEventListener('click', function() {
            switchToTab('view-customers');
        });
    }
}

// Image View Modal functionality
function initializeImageViewModal() {
    const viewImageLinks = document.querySelectorAll('.view-image-link');
    const modalImageView = document.getElementById('modalImageView');
    const imageLoading = document.getElementById('imageLoading');
    const imageError = document.getElementById('imageError');
    const downloadImageLink = document.getElementById('downloadImageLink');
    const imageViewModal = new bootstrap.Modal(document.getElementById('imageViewModal'));
    
    let currentCustomer = null;
    let currentImageType = '';

    // Function to get full image URL
    function getImageUrl(filename) {
        if (!filename) return null;
        
        // If it's already a full URL, return as is
        if (filename.startsWith('http')) {
            return filename;
        }
        
        // If it's a relative path, construct the full URL
        const baseUrl = BASE_URL.replace('/api', '');
        return `${baseUrl}/${filename}`;
    }

    // Function to load and display image
    function loadImage(imageUrl) {
        // Show loading state
        modalImageView.classList.add('d-none');
        imageLoading.classList.remove('d-none');
        imageError.classList.add('d-none');
        
        // Set image source
        modalImageView.src = imageUrl;
        downloadImageLink.href = imageUrl;
        
        // Handle image load
        modalImageView.onload = function() {
            modalImageView.classList.remove('d-none');
            imageLoading.classList.add('d-none');
            downloadImageLink.classList.remove('d-none');
        };
        
        // Handle image error
        modalImageView.onerror = function() {
            modalImageView.classList.add('d-none');
            imageLoading.classList.add('d-none');
            imageError.classList.remove('d-none');
            downloadImageLink.classList.add('d-none');
        };
    }

    // Add click event to all view image links
    viewImageLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (!currentCustomer) return;
            
            const imageType = this.getAttribute('data-image-type');
            currentImageType = imageType;
            
            let imageFilename = '';
            
            // Get the appropriate image based on type
            switch(imageType) {
                case 'nin':
                    imageFilename = currentCustomer.profile?.ninFile;
                    break;
                case 'passport':
                    imageFilename = currentCustomer.profile?.passportPhotoFile;
                    break;
            }
            
            if (!imageFilename) {
                showToastSafe('No image available for this document', 'warning');
                return;
            }
            
            const imageUrl = getImageUrl(imageFilename);
            
            if (!imageUrl) {
                showToastSafe('Invalid image path', 'error');
                return;
            }
            
            // Update modal title based on image type
            const modalTitle = document.getElementById('imageViewModalLabel');
            const titles = {
                'nin': 'National ID Document',
                'passport': 'Passport Photo'
            };
            modalTitle.textContent = titles[imageType] || 'Customer Document';
            
            // Load and show image
            loadImage(imageUrl);
            imageViewModal.show();
        });
    });

    // Reset modal when hidden
    document.getElementById('imageViewModal').addEventListener('hidden.bs.modal', function() {
        modalImageView.src = '';
        currentCustomer = null;
        currentImageType = '';
    });

    return {
        setCurrentCustomer: function(customer) {
            currentCustomer = customer;
        }
    };
}

// Initialize image modal
const imageModal = initializeImageViewModal();

// Event listeners
document.addEventListener("click", function (e) {
    // When customer table row is clicked (but not on action elements)
    if (e.target.closest(".customer-row")) {
        const row = e.target.closest(".customer-row");
        
        // Only proceed if NOT clicking on buttons or inputs
        if (!e.target.closest('button') && !e.target.closest('input[type="checkbox"]')) {
            const customer = JSON.parse(row.getAttribute("data-customer"));
            openCustomerDetails(customer);
        }
    }
    
    // When delete button is clicked
    if (e.target.closest(".btn-delete")) {
        const button = e.target.closest(".btn-delete");
        const customerId = button.getAttribute("data-id");
        
        if (confirm('Delete this customer? This cannot be undone.')) {
            deleteCustomer(customerId);
        }
    }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    attachTabs();
    attachBackButton();
    
    // Expose functions for external use
    window.loadCustomers = loadCustomers;
    window.switchToTab = switchToTab;

    // Initialize tab activation from sidebar
    activateStoredTab();

    // Initial load - only load if we're on view-customers tab
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'view-customers') {
        loadCustomers();
    }
});