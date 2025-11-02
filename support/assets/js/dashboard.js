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

    // Update welcome message
    if (message && document.getElementById('welcomeMessage')) {
      document.getElementById('welcomeMessage').textContent = message;
    }

  } catch (err) {
    console.error('loadDashboardData error:', err);
    showToastSafe('Network error while loading dashboard data', 'danger');
  }
}

// Function to remove skeleton classes from specific elements
function removeSkeletonClasses() {
  // Remove skeletons from header elements
  const headerSkeletons = document.querySelectorAll('.header .skeleton');
  headerSkeletons.forEach(element => {
    element.classList.remove('skeleton', 'skeleton-text');
  });
  
  // Remove skeletons from stats cards
  const statSkeletons = document.querySelectorAll('.stats-grid .skeleton');
  statSkeletons.forEach(element => {
    element.classList.remove('skeleton', 'skeleton-text');
  });
}

// Function to populate dashboard elements
function populateDashboard(marketer, commissionData) {
  if (!marketer) return;

  console.log('Populating dashboard with marketer data:', marketer);

  // Remove skeleton classes first
  removeSkeletonClasses();

  // Update user profile in header
  const firstName = marketer.first_name || '';
  const lastName = marketer.last_name || '';
  const fullName = (firstName + " " + lastName).trim();
  
  // Generate avatar initials
  const avatarInitials = generateAvatarInitials(firstName, lastName);
  
  // Update user name in header
  const userFirstNameElement = document.getElementById('UserFirstName');
  const userDepartment = document.getElementById('department');
  const avatarElement = document.querySelector('.avatar');
  const welcomeMessageElement = document.getElementById('welcomeMessage');
  
  if (userFirstNameElement) {
    userFirstNameElement.textContent = fullName || 'User';
  }
  
  if (userDepartment) {
    userDepartment.textContent = marketer.department || 'Staff';
  }

  // Update avatar with initials
  if (avatarElement) {
    avatarElement.textContent = avatarInitials;
  }

  // Update welcome message
  if (welcomeMessageElement && firstName) {
    welcomeMessageElement.textContent = `Welcome back, ${firstName}!`;
  }

  // Update commission
  const commissionElement = document.getElementById('myCommission');
  if (commissionElement) {
    const commissionAmount = commissionData.commission || '0.00';
    commissionElement.textContent = `₦${commissionAmount}`;
  }

  // Update other stat cards if they have skeletons
  const statCards = document.querySelectorAll('.stat-value');
  statCards.forEach(card => {
    if (card.textContent === '' || card.classList.contains('skeleton')) {
      // Add some sample data or keep them as is
      // You can update these with real data if available
    }
  });
}

// Function to generate avatar initials
function generateAvatarInitials(firstName, lastName) {
  // Get first letter of first name (uppercase)
  const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
  
  // Get first letter of last name (uppercase)
  const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
  
  // If both initials exist, return both (e.g., "JD" for John Doe)
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  // If only first name exists, return first two letters
  if (firstInitial && !lastInitial) {
    return firstName.length > 1 ? firstName.substring(0, 2).toUpperCase() : firstInitial;
  }
  
  // If only last name exists, return first two letters
  if (!firstInitial && lastInitial) {
    return lastName.length > 1 ? lastName.substring(0, 2).toUpperCase() : lastInitial;
  }
  
  // Fallback if no name data
  return 'U';
}

// Initialize on dashboard page
document.addEventListener('DOMContentLoaded', function () {
  // Only run on dashboard page (check if dashboard-specific elements exist)
  if (document.getElementById('UserFirstName') || document.getElementById('myCommission')) {
    loadDashboardData();
  }
});