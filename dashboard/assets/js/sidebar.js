import { showToast } from './message.js';

const sideBar = document.getElementById('sidebar_container');

sideBar.innerHTML = `
     <aside class="sidebar">
        <div class="brand-logo"><img src="assets/img/brand-logo2.jpg" alt=""></div>
          <ul class="sidebar-menu">
            <li>
              <a href="index.html" class="sidebar-link">
                <span class="iconify" data-icon="mdi:view-dashboard-outline"></span>
                <span>Overview</span>
              </a>
            </li>
            <li>
              <a href="transfer.html" class="sidebar-link">
                <span class="iconify" data-icon="fluent:money-hand-20-filled"></span>
                <span>Transactions</span>
              </a>
            </li>
            <li class="lg-account">
              <div class="dropdown sm-dropdown">
                  <button type="button" class="dropdown-button dropdown-toggle"> 
                      <span class="iconify" data-icon="mdi:account-circle"></span>
                      <span>Account</span>
                  </button>
                  <div class="dropdown-container">
                      <a href="profile.html">
                        <span class="iconify" data-icon="mdi:account"></span> Profile
                      </a>
                      <a href="account-limit.html">
                        <span class="iconify" data-icon="mdi:cash"></span> Account Limits
                      </a>
                      <a href="support.html">
                        <span class="iconify" data-icon="mdi:headset"></span> Customer Service
                      </a>
                      <a href="terms-and-condition.html">
                        <span class="iconify" data-icon="mdi:book"></span> Terms and Condition
                      </a>
                      <a href="privacy-policy.html">
                        <span class="iconify" data-icon="mdi:shield-check"></span> 
                        Privacy and Policy
                      </a>
                  </div>
              </div>
            </li>
            <li class="lg-account">
              <div class="dropdown sm-dropdown">
                  <button type="button" class="dropdown-button dropdown-toggle"> 
                    <span class="iconify" data-icon="mdi:cog"></span>
                    <span>Settings</span>
                  </button>
                  <div class="dropdown-container">
                      <a href="update-transaction-pin.html">
                        <span class="iconify" data-icon="mdi:account"></span> Update Payment Pin
                      </a>
                      <a href="update-password.html">
                        <span class="iconify" data-icon="mdi:cash"></span>Update Password
                      </a>
                  </div>
              </div>
            </li>
            <li class="sm-account sm-logout">
              <a href="account.html" class="sidebar-link">
                <span class="iconify" data-icon="mdi:account-circle"></span>
                <span>Account</span>
              </a>
            </li>
            <li class="settings" id="logoutBTN">
              <a href="" class="sidebar-link">
                <span class="iconify" data-icon="mdi:logout" data-inline="false"></span>
                <span>Logout</span>
              </a>
            </li>
        </ul>
    </aside>
`

//Handles Navdropdowns
var dropdown = document.getElementsByClassName("dropdown-button");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}


//Logout Button
const authToken = localStorage.getItem('authToken');
const logoutBtn = document.getElementById('logoutBTN');

logoutBtn.addEventListener('click', (e)=> {
  e.preventDefault();
  localStorage.removeItem(authToken);
  showToast("loging Out...", "warning");
          setTimeout(() => {
              location.href = '../../auth/login.html';
  }, 3000);
})