import { showToast } from './message.js'; 


const BASE_URL = 'https://gobapay.onrender.com/api';
const TOKEN_KEY = 'admin_tkn';
let allSupervisors = []; 

//Auth token from localStorage
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

function showToastSafe(msg, type = 'info') {
  if (typeof showToast === 'function') showToast(msg, type);
  else alert(msg);
}


const tbody = document.querySelector('.table-card table tbody');

function setMessageRow(msg) {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="text-center table-message py-4">${escapeHtml(msg)}</td></tr>`;
}

function buildRow(s) {
  const id = escapeHtml(s._id || s.id || '');
  const first = s.first_name || '';
  const middle = s.middle_name ? ` ${s.middle_name}` : '';
  const last = s.last_name ? ` ${s.last_name}` : '';
  const name = escapeHtml((first + middle + last).trim() || s.email || 'No name');
  const email = escapeHtml(s.email || '');
  const dept = escapeHtml(s.department || '');
  const joined = escapeHtml(formatDate(s.createdAt || s.created_at || ''));
  const isActive = s.isActive === true || s.isActive === 'true';
  const statusClass = isActive ? 'status-active' : 'status-suspended';
  const statusText = isActive ? 'Active' : 'Suspended';
  
  // Store the complete supervisor data as JSON string INCLUDING password
  const supervisorData = JSON.stringify({
    _id: s._id,
    first_name: s.first_name,
    middle_name: s.middle_name,
    last_name: s.last_name,
    email: s.email,
    phone: s.phone,
    department: s.department,
    staffId: s.staffId,
    isActive: s.isActive,
    password: s.password, // Make sure password is included
    createdAt: s.createdAt
  }).replace(/"/g, '&quot;');

  return `
    <tr class="supervisor-row" data-supervisor='${supervisorData}'>
      <td><input type="checkbox" data-id="${id}"></td>
      <td>
        <div class="name-block">
          <span class="avatar-placeholder">
            <i class="fa fa-user"></i>
          </span>
          <div class="name-meta">
            <div><span class="title">${name}</span></div>
            <div class="subtitle">${email}</div>
          </div>
        </div>
      </td>
      <td class="tr-role">${dept}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td class="date-joined">${joined}</td>
      <td class="actions">
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-edit" 
                  data-bs-toggle="modal"
                  data-bs-target="#editProfileModal"
                  data-supervisor='${supervisorData}'>
            <i class="fa fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-delete" 
                  data-action="delete" 
                  data-id="${id}">
            <i class="fa fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// Load supervisors function
// Load supervisors function
async function loadSupervisors() {
  if (!tbody) return;
  
  // Store current active tab state
  const currentActiveTab = document.querySelector('.tab-content.active');
  const currentActiveTabId = currentActiveTab ? currentActiveTab.id : null;

  setMessageRow('Loading supervisors...');

  const token = getToken();
  if (!token) {
    setMessageRow('No admin token found. Please login.');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/get-supervisors`, {
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

    const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (Array.isArray(data.supervisors) ? data.supervisors : []));
    
    if (!items.length) {
      setMessageRow('No supervisors found.');
      return;
    }

    // Store supervisors globally
    allSupervisors = items;
    
    // Render supervisors to table
    tbody.innerHTML = items.map(buildRow).join('');

    // Restore previous tab state if we were on a different tab
    if (currentActiveTabId && currentActiveTabId !== 'view-supervisors-tab') {
      const tabItems = document.querySelectorAll('.tab-item');
      const tabContents = document.querySelectorAll('.tab-content');
      
      tabItems.forEach(item => item.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Reactivate the previous tab
      const previousTabItem = document.querySelector(`.tab-item[data-tab="${currentActiveTabId.replace('-tab', '')}"]`);
      const previousTabContent = document.getElementById(currentActiveTabId);
      
      if (previousTabItem) previousTabItem.classList.add('active');
      if (previousTabContent) previousTabContent.classList.add('active');
    }

  } catch (err) {
    console.error('loadSupervisors error:', err);
    setMessageRow('Network error. Check console.');
  }
}



// When Edit Supervisor Modal is opened
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-edit")) {
    const button = e.target.closest(".btn-edit");
    const supervisor = JSON.parse(button.getAttribute("data-supervisor"));

    console.log("Supervisor data for editing:", supervisor); // Debug log

    // Fill form fields with supervisor data
    document.getElementById("firstName").value = supervisor.first_name || '';
    document.getElementById("middleName").value = supervisor.middle_name || '';
    document.getElementById("lastName").value = supervisor.last_name || '';
    document.getElementById("editEmail").value = supervisor.email || '';
    document.getElementById("editPhone").value = supervisor.phone || '';
    document.getElementById("staffId").value = supervisor.staffId || '';
    document.getElementById("editPassword").value = supervisor.password ||'';
    
    // Set department select - this is the key fix
    const departmentSelect = document.getElementById("editDepartment");
    if (departmentSelect) {
      departmentSelect.value = supervisor.department || 'nothing here';
      console.log("Setting department to:", supervisor.department); // Debug log
    }
    
    // Set account status
    const isActiveCheckbox = document.getElementById("isActive");
    if (isActiveCheckbox) {
      isActiveCheckbox.checked = supervisor.isActive === true || supervisor.isActive === 'true';
    }

    // Store supervisor ID for update
    const saveButton = document.getElementById("saveProfileChanges");
    if (saveButton) {
      saveButton.dataset.supervisorId = supervisor._id;
    }
  }
});



// When supervisor table row is clicked (for details view)
document.addEventListener("click", function (e) {
  const row = e.target.closest(".supervisor-row");
  
  // Only proceed if we clicked directly on the row (not on buttons or inputs)
  if (row && !e.target.closest('button') && !e.target.closest('input[type="checkbox"]')) {
    const supervisor = JSON.parse(row.getAttribute("data-supervisor"));
    openSupervisorDetails(supervisor);
  }
});

// Function to open supervisor details tab
function openSupervisorDetails(supervisor) {
  // Store the current active tab so we can return to it
  const previousActiveTab = document.querySelector('.tab-item.active');
  if (previousActiveTab) {
    previousActiveTab.dataset.previousActive = 'true';
  }
  
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Remove active class from all tabs and contents
  tabItems.forEach(item => item.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Keep the "View Supervisors" tab visually active
  const viewSupervisorsTab = document.querySelector('.tab-item[data-tab="view-supervisors"]');
  if (viewSupervisorsTab) {
    viewSupervisorsTab.classList.add('active');
  }
  
  // Activate the supervisor-details tab
  const detailsTab = document.getElementById('supervisor-details-tab');
  if (detailsTab) {
    detailsTab.classList.add('active');
  }
  
  // Populate the supervisor details
  populateSupervisorDetails(supervisor);
}

// Add back button functionality
function attachBackButton() {
  const backButton = document.getElementById('backToSupervisorsBtn');
  if (backButton) {
    backButton.addEventListener('click', function() {
      // Switch back to view supervisors tab
      const tabItems = document.querySelectorAll('.tab-item');
      const tabContents = document.querySelectorAll('.tab-content');
      
      tabItems.forEach(item => item.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activate view supervisors tab and content
      const viewSupervisorsTab = document.querySelector('.tab-item[data-tab="view-supervisors"]');
      const viewSupervisorsContent = document.getElementById('view-supervisors-tab');
      
      if (viewSupervisorsTab) viewSupervisorsTab.classList.add('active');
      if (viewSupervisorsContent) viewSupervisorsContent.classList.add('active');
    });
  }
}



// Function to populate supervisor details
function populateSupervisorDetails(supervisor) {
  // Format name
  const first = supervisor.first_name || '';
  const middle = supervisor.middle_name ? ` ${supervisor.middle_name}` : '';
  const last = supervisor.last_name ? ` ${supervisor.last_name}` : '';
  const fullName = (first + middle + last).trim() || 'No name';
  
  // Format status
  const isActive = supervisor.isActive === true || supervisor.isActive === 'true';
  const statusClass = isActive ? 'status-active' : 'status-suspended';
  const statusText = isActive ? 'Active' : 'Suspended';
  
  // Format date
  const joinedDate = formatDate(supervisor.createdAt || supervisor.created_at || '');
  
  // Update the supervisor details section
  document.querySelector('.profile-name').textContent = fullName;
  document.querySelector('.profile-staff-id').textContent = `Staff ID: ${supervisor.staffId || ''}`;
  
  // Update profile details
  const detailsGrid = document.querySelector('.details-grid');
  if (detailsGrid) {
    detailsGrid.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Email</span>
        <span class="detail-value">${escapeHtml(supervisor.email || '')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Phone</span>
        <span class="detail-value">${escapeHtml(supervisor.phone || '')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status</span>
        <span class="${statusClass}">${statusText}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Department</span>
        <span class="detail-value">${escapeHtml(supervisor.department || '')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Date Joined</span>
        <span class="detail-value">${joinedDate}</span>
      </div>
    `;
  }
  
  // Update the edit button in details to work with this supervisor
const editButton = document.querySelector('.btn-edit-profile');
if (editButton) {
  editButton.onclick = function() {
    // Trigger the edit modal for this supervisor
    const editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    
    // Populate edit form with ALL data including password
    document.getElementById("firstName").value = supervisor.first_name || '';
    document.getElementById("middleName").value = supervisor.middle_name || '';
    document.getElementById("lastName").value = supervisor.last_name || '';
    document.getElementById("editEmail").value = supervisor.email || '';
    document.getElementById("editPhone").value = supervisor.phone || '';
    document.getElementById("staffId").value = supervisor.staffId || '';
    document.getElementById("editPassword").value = supervisor.password || ''; // Include the password
    
    const departmentSelect = document.getElementById("editDepartment");
    if (departmentSelect) {
      departmentSelect.value = supervisor.department || '';
    }
    
    const isActiveCheckbox = document.getElementById("isActive");
    if (isActiveCheckbox) {
      isActiveCheckbox.checked = supervisor.isActive === true || supervisor.isActive === 'true';
    }

    const saveButton = document.getElementById("saveProfileChanges");
    if (saveButton) {
      saveButton.dataset.supervisorId = supervisor._id;
    }
    
    editModal.show();
  };
}
  
  // Update delete button
  const deleteButton = document.querySelector('.btn-delete-supervisor');
  if (deleteButton) {
    deleteButton.onclick = function() {
      if (confirm('Delete this supervisor? This cannot be undone.')) {
        deleteSupervisor(supervisor._id);
      }
    };
  }
  
  // Ensure the view supervisors tab stays active
  const viewSupervisorsTab = document.querySelector('.tab-item[data-tab="view-supervisors"]');
  const allTabItems = document.querySelectorAll('.tab-item');
  
  allTabItems.forEach(item => item.classList.remove('active'));
  if (viewSupervisorsTab) {
    viewSupervisorsTab.classList.add('active');
  }
}


// Fix modal close issue
function fixModalClose() {
  const editModal = document.getElementById('editProfileModal');
  if (editModal) {
    // Listen for modal hidden event
    editModal.addEventListener('hidden.bs.modal', function () {
      // Remove any lingering backdrop
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      // Reset body class
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
    
    // Also fix the close buttons
    const closeButtons = editModal.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modalInstance = bootstrap.Modal.getInstance(editModal);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    });
  }
}

/*
// When Edit Supervisor Modal is opened
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-edit")) {
    const button = e.target.closest(".btn-edit");
    const supervisor = JSON.parse(button.getAttribute("data-supervisor"));

    // Fill form fields with supervisor data
    document.getElementById("firstName").value = supervisor.first_name || '';
    document.getElementById("middleName").value = supervisor.middle_name || '';
    document.getElementById("lastName").value = supervisor.last_name || '';
    document.getElementById("email").value = supervisor.email || '';
    document.getElementById("phone").value = supervisor.phone || '';
    document.getElementById("staffId").value = supervisor.staffId || '';
    
    // Set department select
    const departmentSelect = document.getElementById("department");
    if (departmentSelect) {
      departmentSelect.value = supervisor.department || '';
    }
    
    // Set account status
    const isActiveCheckbox = document.getElementById("isActive");
    if (isActiveCheckbox) {
      isActiveCheckbox.checked = supervisor.isActive === true || supervisor.isActive === 'true';
    }

    // Store supervisor ID for update
    const saveButton = document.getElementById("saveProfileChanges");
    if (saveButton) {
      saveButton.dataset.supervisorId = supervisor._id;
    }
    
    // No need to manually open modal - Bootstrap handles it via data-bs-toggle and data-bs-target
  }
});
*/


// When Delete button is clicked
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-delete")) {
    const button = e.target.closest(".btn-delete");
    const supervisorId = button.getAttribute("data-id");
    
    if (confirm('Delete this supervisor? This cannot be undone.')) {
      deleteSupervisor(supervisorId);
    }
  }
});





// UPDATE SUPERVISOR
const saveProfileChanges = document.getElementById('saveProfileChanges');

saveProfileChanges.addEventListener('click', async function (e) {
  e.preventDefault();

  const supervisorId = saveProfileChanges.dataset.supervisorId;
  const firstName = document.getElementById('firstName').value.trim();
  const middleName = document.getElementById('middleName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const department = document.getElementById('editDepartment').value;
  const password = document.getElementById('editPassword').value;
  const isActive = document.getElementById('isActive').checked;

  const updateData = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    email: email,
    phone: phone,
    department: department,
    isActive: isActive
  };

  // Only include password if provided and not empty
  if (password && password.trim() !== '') {
    if (password.length < 6) {
      showToastSafe('Password must be at least 6 characters long', 'danger');
      return;
    }
    updateData.password = password;
  }
  // If password is empty, don't include it in the update data

  console.log(updateData);

  const token = getToken();
  if (!token) {
    showToastSafe('No admin token found. Please login again.', 'danger');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/update-supervisor/${supervisorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data && (data.message || data.error) ? (data.message || data.error) : `Update failed (${response.status})`;
      throw new Error(errorMsg);
    }

    // Success
    showToastSafe(data.message || 'Supervisor updated successfully', 'success');
    
    // Refresh supervisors list
    await loadSupervisors();
    
    // Check if we're on supervisor details tab and refresh it too
    const detailsTab = document.getElementById('supervisor-details-tab');
    if (detailsTab && detailsTab.classList.contains('active')) {
      // Create updated supervisor object from form data
      const updatedSupervisorData = {
        _id: supervisorId,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: email,
        phone: phone,
        department: department,
        staffId: document.getElementById('staffId').value,
        isActive: isActive,
        // Keep the original password (we don't want to store the new one for security)
        password: '********' // Just show placeholder
      };
      populateSupervisorDetails(updatedSupervisorData);
    }
    
    // Close modal
    const editModalEl = document.getElementById('editProfileModal');
    const modalInstance = bootstrap.Modal.getInstance(editModalEl);
    modalInstance.hide();

  } catch (error) {
    console.error("Error updating supervisor:", error);
    showToastSafe(error.message || "An error occurred while updating the supervisor.", 'danger');
  }
});



// Delete supervisor 
async function deleteSupervisor(id) {
  const token = getToken();
  if (!token) return showToastSafe('Missing admin token', 'danger');

  try {
    const res = await fetch(`${BASE_URL}/admin/delete-supervisor/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data && (data.message || data.error) ? (data.message || data.error) : `Delete failed (${res.status})`;
      return showToastSafe(msg, 'danger');
    }
    showToastSafe(data.message || 'Supervisor deleted', 'success');
    loadSupervisors();
  } catch (err) {
    console.error('deleteSupervisor error:', err);
    showToastSafe('Network error while deleting', 'danger');
  }
}

// clearInputs - resets form and visual states --------------------------------
function clearInputs() {
  const form = document.getElementById('addSupervisorForm');
  if (!form) return;
  form.reset();

  // reset borders
  form.querySelectorAll('input, select, textarea').forEach(f => f.style.borderColor = '#ddd');

  // focus first field
  const first = document.getElementById('first_name');
  if (first) first.focus();
}






// CREATE/ADD NEW SUPERVISOR
function attachFormHandler() {
  const form = document.getElementById('addSupervisorForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // validate required inputs (including department select)
    const required = form.querySelectorAll('input[required], select[required]');
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

    // collect values
    const first_name = document.getElementById('first_name').value.trim();
    const middle_name = document.getElementById('middle_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('comfirm-password').value;

    if (password.length < 8) return showToastSafe('Password must be at least 8 characters long', 'danger');
    if (password !== confirm_password) return showToastSafe('Passwords do not match', 'danger');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToastSafe('Please enter a valid email', 'danger');

    const payload = { first_name, middle_name, last_name, email, phone, department, password };

    const token = getToken();
    if (!token) return showToastSafe('No admin token found. Please login again.', 'danger');

    const submitBtn = document.getElementById('createSupervisorBtn');
    const origText = submitBtn ? submitBtn.textContent : 'Saving...';
    if (submitBtn) {
      submitBtn.setAttribute('disabled', '');
      submitBtn.textContent = 'Saving...';
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/create-supervisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data && (data.message || data.error) ? (data.message || data.error) : `Request failed (${res.status})`;
        throw new Error(msg);
      }

      // success
      showToastSafe(data.message || 'Supervisor created', 'success');
      clearInputs();
      loadSupervisors();
    } catch (err) {
      console.error('createSupervisor error:', err);
      showToastSafe(err.message || 'Error creating supervisor', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.textContent = origText || 'Add Supervisor';
      }
    }
  });
}

// Cancel button + confirm modal wiring ---------------------------------------
function attachCancelHandler() {
  const cancelBtn = document.getElementById('cancelBtn');
  const confirmModalEl = document.getElementById('confirmCancelModal');
  const confirmBtn = document.getElementById('confirmCancelBtn');

  let modal = null;
  if (confirmModalEl) modal = new bootstrap.Modal(confirmModalEl);

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => modal.show());
  }

  if (confirmBtn && modal) {
    confirmBtn.addEventListener('click', () => {
      clearInputs();
      modal.hide();
      showToastSafe('Action cancelled', 'info');
    });
  }
}

// Tabs
function attachTabs() {
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');

  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      tabItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const el = document.getElementById(`${tabId}-tab`);
      if (el) el.classList.add('active');
    });
  });
}


// Init on DOM ready 
document.addEventListener('DOMContentLoaded', function () {
  attachTabs();
  attachFormHandler();
  attachCancelHandler();
  attachBackButton(); // Add this
  fixModalClose();    // Add this
  
  // expose functions for external use
  window.clearInputs = clearInputs;
  window.loadSupervisors = loadSupervisors;

  // initial load
  loadSupervisors();
});