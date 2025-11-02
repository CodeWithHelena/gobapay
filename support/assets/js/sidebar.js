const sideBarContainer = document.getElementById('sidebar_container');
sideBarContainer.innerHTML += `
    <aside class="sidebar">
        <button class="close-sidebar"><i class="fas fa-xmark"></i></button>
        <div class="brand-logo"><img src="assets/img/brand-logo.jpg" alt=""></div>
        <ul class="sidebar-menu">
            <li><a href="dashboard.html" class="sidebar-link"><iconify-icon icon="mdi:view-dashboard-outline" class="iconify"></iconify-icon><span>Overview</span></a></li>
            
            <li>
                <div class="dropdown">
                    <button type="button" class="dropdown-button dropdown-toggle"><iconify-icon icon="mdi:account-group" class="iconify"></iconify-icon><span>Customer</span></button>
                    <div class="dropdown-container">
                        <a href="customer.html" class="sidebar-tab-link" data-tab="add-customer"><iconify-icon icon="mdi:account-plus" class="iconify"></iconify-icon> Add Customer</a>
                        <a href="customer.html" class="sidebar-tab-link" data-tab="view-customers"><iconify-icon icon="mdi:account-eye" class="iconify"></iconify-icon> View Customer</a>
                        <a href="customer.html" class="sidebar-tab-link" data-tab="history"><iconify-icon icon="mdi:history" class="iconify"></iconify-icon> Customer History</a>
                    </div>
                </div>
            </li>
            <li>
                <div class="dropdown">
                    <button type="button" class="dropdown-button dropdown-toggle"><iconify-icon icon="mdi:cog" class="iconify"></iconify-icon><span>Account Limit</span></button>
                    <div class="dropdown-container">                                
                        <a href="account-limit.html"><iconify-icon icon="mdi:account-circle" class="iconify"></iconify-icon>View Tiers</a>
                        <a href="account-limit.html" class="sidebar-theme-option">
                            <iconify-icon icon="solar:moon-bold" class="iconify"></iconify-icon> 
                            Update Tier
                        </a>
                    </div>
                </div>
            </li>
            <li>
                <div class="dropdown">
                    <button type="button" class="dropdown-button dropdown-toggle"><iconify-icon icon="mdi:cog" class="iconify"></iconify-icon><span>Settings</span></button>
                    <div class="dropdown-container">                                
                        <a href="settings.html"><iconify-icon icon="mdi:account-circle" class="iconify"></iconify-icon>Profile</a>
                        <a href="#" class="sidebar-theme-option">
                            <iconify-icon icon="solar:moon-bold" class="iconify"></iconify-icon> 
                            Theme
                        </a>
                    </div>
                </div>
            </li>
            <li class="sm-logout"><a href="#" class="sidebar-link" id="logoutBTN"><iconify-icon icon="mdi:logout" class="iconify"></iconify-icon><span>Logout</span></a></li>
        </ul>
    </aside>
`;

const sidebar = sideBarContainer.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

// Store the target tab in localStorage when sidebar link is clicked
document.addEventListener('click', function(e) {
    if (e.target.closest('.sidebar-tab-link')) {
        const link = e.target.closest('.sidebar-tab-link');
        const targetTab = link.getAttribute('data-tab');
        
        // Store the target tab in localStorage
        localStorage.setItem('targetTab', targetTab);
        
        // If we're already on customer.html, trigger the tab switch
        if (window.location.pathname.includes('customer.html')) {
            e.preventDefault();
            switchToTab(targetTab);
        }
        // Otherwise, let the normal navigation happen (the tab will be activated on page load)
    }
});

// Function to switch to a specific tab
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

// Initialize tab activation when customer.html loads
if (window.location.pathname.includes('customer.html')) {
    document.addEventListener('DOMContentLoaded', activateStoredTab);
}

// Existing sidebar functionality
document.querySelectorAll('.dropdown-button').forEach(button => {
    button.addEventListener('click', function () {
        const dropdownContainer = this.nextElementSibling;
        this.classList.toggle('active');
        dropdownContainer.classList.toggle('open');
    });
});

document.querySelector('.toggle-btn').addEventListener('click', function () {
    if (window.innerWidth <= 576) {
        sideBarContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
});

sideBarContainer.querySelector('.close-sidebar').addEventListener('click', function () {
    sideBarContainer.classList.remove('active');
    document.body.style.overflow = 'auto';
});

sideBarContainer.querySelector('.overlay').addEventListener('click', function () {
    sideBarContainer.classList.remove('active');
    document.body.style.overflow = 'auto';
});

const manageInitialViewState = () => {
    if (window.innerWidth > 576 && window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    } else if (window.innerWidth > 768) {
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    }
};

manageInitialViewState();
window.addEventListener('resize', manageInitialViewState);