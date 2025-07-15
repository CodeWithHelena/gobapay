
import { showToast } from './message.js';

/*
// RENDER USER DASHBOARD
const fetchUserDashboard = async () => {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch('https://gobapay.onrender.com/api/user/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Profile Data:', data); // Debugging log

        // ✅ Check if "success" is false
        if (!data.success) {
            if (data.error === "jwt expired") {
                console.log("Session expired. Logging out...");
                showToast('Session Expired. Login to continue', 'warning');
                localStorage.removeItem('authToken');
                setTimeout(() => {
                    window.location.href = "../landing/login.html";
                }, 3500);
                return;
            }else if(data.error === "invalid token"){
                showToast('Invalid Session Id.', 'danger')
                localStorage.removeItem('authToken');
                setTimeout(() => {
                    window.location.href = "../landing/login.html";
                }, 3500);
                return;
            } 
                else {
                return;
            }
        }

        const user = data.data;

        document.getElementById('username').textContent = user.firstName;
        const userBalance =  user.balance;

        // User account balance
        const toggleButton = document.getElementById("toggleButton");
        const knob = document.querySelector(".knob");
        const balanceText = document.getElementById("balanceText");

        let isToggled = false;

        toggleButton.addEventListener("click", function () {
        isToggled = !isToggled;
        
        // Change toggle background color
        toggleButton.style.background = isToggled ? "#9EDD05" : "#ccc";
        
        // Move the knob
        knob.style.transform = isToggled ? "translateX(26px)" : "translateX(0)";
        
        // Show or hide balance
        balanceText.textContent = isToggled ? `${userBalance}` : "*****";
        });
        //document.getElementById('fullNameValue').textContent = user.fullName;


    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};

// Call function to fetch user profile on page load
fetchUserDashboard();
*/





// RENDER USER PROFILE
const fetchUserProfile = async () => {
    const authToken = localStorage.getItem('authToken');
    
    // if (!authToken) {
    //     console.log('Token does not exist, redirecting...');
    //     window.location.href = "../landing/login.html"; // Redirect if not logged in
    //     return;
    // }

    try {
        const response = await fetch('https://gobapay.onrender.com/api/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Profile Data:', data); // Debugging log

        // ✅ Check if "success" is false
        if (!data.success) {
            if (data.error === "jwt expired") {
                console.log("Session expired. Logging out...");
                showToast('Session Expired. Login to continue', 'warning');
                localStorage.removeItem('authToken');
                setTimeout(() => {
                    window.location.href = "../login.html";
                }, 3500);
                return;
            }else if(data.error === "invalid token"){
                console.log("invalid token. Logging out...");
                showToast('Invalid Session Id.', 'danger')
                localStorage.removeItem('authToken');
                setTimeout(() => {
                    window.location.href = "../../auth/login.html";
                }, 3500);
                return;
            } 
                else {
                console.log("Error Message:", data.message); // Log message if available
                return;
            }
        }

        // ✅ Update HTML elements with user profile data

        const user = data.data;

        document.getElementById('accountNumValue').textContent = user.beneficiaryAccountNumber;
        document.getElementById('tierValue').textContent = user.tier.level > 0 ? `Tier ${user.tier.level}` : " ";
        document.getElementById('fullNameValue').textContent = user.fullName || "Loading..";
        document.getElementById('phoneNumValue').textContent = user.phone;
        document.getElementById('genderValue').textContent = user.gender;
        document.getElementById('dobValue').textContent = user.dob;
        document.getElementById('emailValue').textContent = user.gender || "nothing";
        
        document.getElementById('addressValue').textContent = user.gender || "nothing";

       

    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        
    }
};

// Call function to fetch user profile on page load
fetchUserProfile();



