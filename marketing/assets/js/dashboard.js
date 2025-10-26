// Function to load marketer data for dashboard
async function loadDashboardData() {
  const token = getToken();
  if (!token) {
    showToastSafe('No token found. Please login.', 'danger');
    return;
  }
  console.log('dashboard Loaded')

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

    // Get marketer data from response
    const marketer = profileData.marketer || profileData;
    const message = profileData.message;
    
    // Update welcome message
    if (message && document.getElementById('welcomeMessage')) {
      document.getElementById('welcomeMessage').textContent = message;
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

    // Populate dashboard with both profile and commission data
    populateDashboard(marketer, commissionData);

  } catch (err) {
    console.error('loadDashboardData error:', err);
    showToastSafe('Network error while loading dashboard data', 'danger');
  }
}

// Function to populate dashboard elements
function populateDashboard(marketer, commissionData) {
  if (!marketer) return;

  console.log('Populating dashboard with marketer data:', marketer);
  console.log('Commission data:', commissionData);

  // Update user profile in header
  const fullName = (marketer.first_name + " " + marketer.last_name).trim();
  
  // Update user name in header
  const userFirstNameElement = document.getElementById('UserFirstName');
  const userDepartment = document.getElementById('department');
  
  if (userFirstNameElement) {
    userFirstNameElement.textContent = fullName || 'User';
  }
  
  if (userDepartment) {
    userDepartment.textContent = marketer.department || 'Staff';
  }

  // Update commission - simple extraction from commissionData
  const commissionElement = document.getElementById('myCommission');
  if (commissionElement) {
    const commissionAmount = commissionData.commission || '0.00';
    // Keep the ₦ sign in HTML and just append the amount
    commissionElement.textContent = `₦${commissionAmount}`;
  }
}

// Initialize on dashboard page
document.addEventListener('DOMContentLoaded', function () {
  // Only run on dashboard page (check if dashboard-specific elements exist)
  if (document.getElementById('UserFirstName') || document.getElementById('myCommission')) {
    loadDashboardData();
  }
});