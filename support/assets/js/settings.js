// Function to load marketer profile data for settings page
async function loadMarketerProfile() {
  const token = getToken();
  if (!token) {
    showToastSafe('No token found. Please login.', 'danger');
    return;
  }

  try {
    // Fetch marketer profile data
    const profileRes = await fetch(`${BASE_URL}/staff/marketing`, {
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      }
    });

    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      const msg = profileData && (profileData.message || profileData.error) ? (profileData.message || profileData.error) : `Request failed (${profileRes.status})`;
      showToastSafe(msg, 'danger');
      return;
    }

    // Fetch commission data
    const commissionRes = await fetch(`${BASE_URL}/staff/my-commissions`, {
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      }
    });

    const commissionData = await commissionRes.json();

    if (!commissionRes.ok) {
      const msg = commissionData && (commissionData.message || commissionData.error) ? (commissionData.message || commissionData.error) : `Commission request failed (${commissionRes.status})`;
      console.warn(msg);
    }

    // Get marketer data from response
    const marketer = profileData.marketer || profileData;
    
    // Populate settings page with both profile and commission data
    populateMarketerProfile(marketer, commissionData);

  } catch (err) {
    console.error('loadMarketerProfile error:', err);
    showToastSafe('Network error while loading profile', 'danger');
  }
}


// Function to remove skeleton and populate data
function populateMarketerProfile(marketer, commissionData) {
  if (!marketer) return;

  console.log('Populating marketer profile:', marketer);

  // Remove skeleton classes from all elements in profile container
  const profileContainer = document.querySelector('.table-card');
  const skeletonElements = profileContainer.querySelectorAll('.skeleton');
  
  skeletonElements.forEach(element => {
    element.classList.remove('skeleton', 'skeleton-text', 'skeleton-circle');
  });

  // Format full name
  const first = marketer.first_name || '';
  const middle = marketer.middle_name ? ` ${marketer.middle_name}` : '';
  const last = marketer.last_name ? ` ${marketer.last_name}` : '';
  const fullName = (first + middle + last).trim() || 'No name';

  // Update profile header
  document.getElementById('fullName').textContent = fullName;
  document.getElementById('staffId').textContent = marketer.staffId || 'N/A';
  
  // Update commission in the balance section
  const commissionElement = document.getElementById('marketerCommission');
  if (commissionElement) {
    const commissionAmount = commissionData.commission || '0.00';
    commissionElement.textContent = `₦${commissionAmount}`;
  }
  
  // Update personal information
  document.getElementById('firstName').textContent = marketer.first_name || '';
  document.getElementById('middleName').textContent = marketer.middle_name || '';
  document.getElementById('lastName').textContent = marketer.last_name || '';
  document.getElementById('gender').textContent = marketer.gender || 'Not specified';
  
  // Update contact details
  document.getElementById('email').textContent = marketer.email || '';
  document.getElementById('phone').textContent = marketer.phone || '';
  
  // Update work information
  document.getElementById('department').textContent = marketer.department || '';
  
  // Update status
  const isActive = marketer.isActive === true || marketer.isActive === 'true';
  const statusClass = isActive ? 'status-active' : 'status-suspended';
  const statusText = isActive ? 'Active' : 'Inactive';
  
  const statusElement = document.getElementById('status');
  statusElement.className = `detail-value ${statusClass}`;
  statusElement.textContent = statusText;
}

// Your existing loadMarketerProfile function remains the same
// It will automatically show skeletons because they're in the HTML by default

// Initialize on settings page
document.addEventListener('DOMContentLoaded', function () {
  // Only run on settings page (check if settings-specific elements exist)
  if (document.getElementById('fullName')) {
    loadMarketerProfile();
  }
});