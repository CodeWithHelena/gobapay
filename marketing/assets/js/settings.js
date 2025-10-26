// Function to load marketer profile data for settings page
async function loadMarketerProfile() {
  const token = getToken();
  if (!token) {
    showToastSafe('No token found. Please login.', 'danger');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/staff/marketing`, {
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

    // Get marketer data from response
    const marketer = data.marketer || data;
    populateMarketerProfile(marketer);

  } catch (err) {
    console.error('loadMarketerProfile error:', err);
    showToastSafe('Network error while loading profile', 'danger');
  }
}

// Function to populate marketer profile in settings page
function populateMarketerProfile(marketer) {
  if (!marketer) return;

  console.log('Populating marketer profile:', marketer);

  // Format full name
  const first = marketer.first_name || '';
  const middle = marketer.middle_name ? ` ${marketer.middle_name}` : '';
  const last = marketer.last_name ? ` ${marketer.last_name}` : '';
  const fullName = (first + middle + last).trim() || 'No name';

  // Update profile header
  document.getElementById('fullName').textContent = fullName;
  document.getElementById('staffId').textContent = marketer.staffId || 'N/A';
  
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

// Initialize on settings page
document.addEventListener('DOMContentLoaded', function () {
  // Only run on settings page (check if settings-specific elements exist)
  if (document.getElementById('fullName')) {
    loadMarketerProfile();
  }
});