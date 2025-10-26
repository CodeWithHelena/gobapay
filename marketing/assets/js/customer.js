import { showToast } from './message.js'; 

const BASE_URL = 'https://gobapay.onrender.com/api';
const TOKEN_KEY = 'admin_tkn';
let allCustomers = [];

// Auth token from localStorage
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

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

function showToastSafe(msg, type = 'info') {
  if (typeof showToast === 'function') showToast(msg, type);
  else alert(msg);
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

// Load customers function
async function loadCustomers() {
  if (!tbody) return;
  setMessageRow('Loading customers...');

  const token = getToken();
  if (!token) {
    setMessageRow('No token found. Please login.');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/staff/my-customers`, {
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      }
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data && (data.message || data.error) ? (data.message || data.error) : `Request failed (${res.status})`;
      showToastSafe(msg, 'danger');
      return;
    }

    const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (Array.isArray(data.customers) ? data.customers : []));
    if (!items.length) {
      setMessageRow('No customers found.');
      return;
    }

    allCustomers = items;
    tbody.innerHTML = items.map(buildRow).join('');

  } catch (err) {
    console.error('loadCustomers error:', err);
    setMessageRow('Network error. Check console.');
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

// Function to populate customer details
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

  // Get all detail item wrappers and populate them in order
  const detailWrappers = document.querySelectorAll('.customer .detail-item-wrapper');
  
  if (detailWrappers.length >= 17) {
    // Personal Information
    detailWrappers[0].querySelector('.detail-value').textContent = customer.first_name || '';
    detailWrappers[1].querySelector('.detail-value').textContent = customer.middle_name || '';
    detailWrappers[2].querySelector('.detail-value').textContent = customer.last_name || '';
    detailWrappers[3].querySelector('.detail-value').textContent = customer.gender || '';
    
    // Contact Information
    detailWrappers[4].querySelector('.detail-value').textContent = customer.country || '';
    detailWrappers[5].querySelector('.detail-value').textContent = customer.phone || '';
    detailWrappers[6].querySelector('.detail-value').textContent = customer.bvn || '';
    
    // Account Verification
    const verificationElement = detailWrappers[7].querySelector('.detail-value');
    if (verificationElement) {
      verificationElement.className = `detail-value ${verificationClass}`;
      verificationElement.textContent = verificationText;
    }
    
    // Email and Tier
    detailWrappers[8].querySelector('.detail-value').textContent = customer.email || '';
    detailWrappers[9].querySelector('.detail-value').textContent = customer.tier || 'Tier 1';
    
    // Business Information
    detailWrappers[10].querySelector('.detail-value').textContent = customer.businessName || '';
    detailWrappers[11].querySelector('.detail-value').textContent = customer.address || '';
    
    // Dates
    detailWrappers[12].querySelector('.detail-value').textContent = formatDate(customer.createdAt);
    detailWrappers[13].querySelector('.detail-value').textContent = formatDate(customer.updatedAt);
    
    // KYC Status
    const kycElement = detailWrappers[14].querySelector('.detail-value');
    if (kycElement) {
      kycElement.className = `detail-value ${kycClass}`;
      kycElement.textContent = kycText;
    }
    
    // Registered By
    detailWrappers[15].querySelector('.detail-value').textContent = 'Marketer';
    
    // NIN
    detailWrappers[16].querySelector('.detail-value').textContent = customer.profile?.ninNumber || 'N/A';
  }

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
    const data = await res.json();
    if (!res.ok) {
      const msg = data && (data.message || data.error) ? (data.message || data.error) : `Delete failed (${res.status})`;
      return showToastSafe(msg, 'danger');
    }
    showToastSafe(data.message || 'Customer deleted', 'success');
    
    // Only refresh after successful deletion
    loadCustomers();
    
    // Also switch back to view customers tab after deletion
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabItems.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    const viewCustomersTab = document.querySelector('.tab-item[data-tab="view-customers"]');
    const viewCustomersContent = document.getElementById('view-customers-tab');
    
    if (viewCustomersTab) viewCustomersTab.classList.add('active');
    if (viewCustomersContent) viewCustomersContent.classList.add('active');
    
  } catch (err) {
    console.error('deleteCustomer error:', err);
    showToastSafe('Network error while deleting', 'danger');
  }
}

// Clear inputs function
function clearInputs() {
  const form = document.getElementById('addCustomerForm');
  if (!form) return;
  form.reset();

  // Reset borders
  form.querySelectorAll('input, select, textarea').forEach(f => f.style.borderColor = '#ddd');

  // Focus first field
  const first = document.getElementById('first_name');
  if (first) first.focus();
}

// Attach form handler for adding customers
function attachFormHandler() {
  const form = document.getElementById('addCustomerForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate required inputs
    const required = form.querySelectorAll('input[required]');
    let ok = true;
    required.forEach(f => {
      if (!f.value || !String(f.value).trim()) {
        ok = false;
        f.style.borderColor = '#f4717f';
      } else {
        f.style.borderColor = '#ddd';
      }
    });
    if (!ok) return showToastSafe('Please fill in all required fields.', 'danger');

    // Collect values
    const first_name = document.getElementById('first_name').value.trim();
    const middle_name = document.getElementById('middle_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const country = document.getElementById('country').value.trim();
    const address = document.getElementById('address').value.trim();
    const businessName = document.getElementById('businessName').value.trim();
    const bvn = document.getElementById('bvn').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('comfirm-password').value;

    // Get gender value
    const genderRadio = document.querySelector('input[name="gender"]:checked');
    const gender = genderRadio ? genderRadio.value : '';

    // Validation
    if (password.length < 6) return showToastSafe('Password must be at least 6 characters long', 'danger');
    if (password !== confirm_password) return showToastSafe('Passwords do not match', 'danger');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToastSafe('Please enter a valid email', 'danger');
    if (!gender) return showToastSafe('Please select a gender', 'danger');
    
    // BVN Validation - Must be exactly 11 digits
    if (bvn && bvn.length !== 11) return showToastSafe('BVN must be exactly 11 digits', 'danger');
    if (bvn && !/^\d+$/.test(bvn)) return showToastSafe('BVN must contain only numbers', 'danger');

    const payload = { 
      first_name, 
      middle_name, 
      last_name, 
      email, 
      phone, 
      gender,
      country, 
      address, 
      bvn, 
      password, 
      businessName 
    };

    const token = getToken();
    if (!token) return showToastSafe('No token found. Please login again.', 'danger');

    const submitBtn = document.getElementById('createCustomerBtn');
    const origText = submitBtn ? submitBtn.textContent : 'Adding...';
    if (submitBtn) {
      submitBtn.setAttribute('disabled', '');
      submitBtn.textContent = 'Adding Customer...';
    }

    try {
      const res = await fetch(`${BASE_URL}/staff/register-customer-by-marketer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data && (data.message || data.error) ? (data.message || data.error) : `Request failed (${res.status})`;
        throw new Error(msg);
      }

      // Success
      showToastSafe(data.message || 'Customer created successfully', 'success');
      clearInputs();
      
      // Refresh customers table after successful addition
      loadCustomers();
      
    } catch (err) {
      console.error('createCustomer error:', err);
      showToastSafe(err.message || 'Error creating customer', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.textContent = origText || 'Add Customer';
      }
    }
  });
}

// Cancel button handler
function attachCancelHandler() {
  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      clearInputs();
      showToastSafe('Action cancelled', 'info');
    });
  }
}

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

// Back button functionality
function attachBackButton() {
  const backButton = document.getElementById('backToCustomersBtn');
  if (backButton) {
    backButton.addEventListener('click', function() {
      // Switch back to view customers tab
      const tabItems = document.querySelectorAll('.tab-item');
      const tabContents = document.querySelectorAll('.tab-content');
      
      // Remove active class from all tabs and contents
      tabItems.forEach(item => item.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activate view customers tab and content
      const viewCustomersTab = document.querySelector('.tab-item[data-tab="view-customers"]');
      const viewCustomersContent = document.getElementById('view-customers-tab');
      
      if (viewCustomersTab) {
        viewCustomersTab.classList.add('active');
      }
      if (viewCustomersContent) {
        viewCustomersContent.classList.add('active');
      }
      
      // No refresh needed when just viewing details
    });
  }
}

// Tabs functionality
function attachTabs() {
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');

  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // Always allow tab switching - remove any prevention logic
      tabItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const el = document.getElementById(`${tabId}-tab`);
      if (el) el.classList.add('active');
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  attachTabs();
  attachFormHandler();
  attachCancelHandler();
  attachBackButton();
  
  // Expose functions for external use
  window.clearInputs = clearInputs;
  window.loadCustomers = loadCustomers;

  // Initial load
  loadCustomers();
});