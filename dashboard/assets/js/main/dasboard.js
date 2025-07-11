
import { showToast } from '../message.js';


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
                //console.log("Session expired. Logging out...");
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
                    window.location.href = "../login.html";
                }, 3500);
                return;
            } 
                else {
                return;
            }
        }

        const user = data.data;
        //Add user name in dashboard 
        // const usersName = document.getElementById('username').textContent = user.firstName;
        // usersName.classList.remove('skeleton');

        const usersName = document.getElementById('username');
        const modalAccountName = document.getElementById('modalAccountName');
        const modalAccountNumber = document.getElementById('modalAccountNumber');
        const DetailsArr = [usersName, modalAccountName, modalAccountNumber];

        DetailsArr.forEach(detail => detail.classList.remove('skeleton'));
        usersName.textContent = user.firstName;
        modalAccountName.textContent = user.firstName;
        modalAccountNumber.textContent = user.beneficiaryAccountNumber;
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



/*
// UPDATE PASSWORD PIN
const BASE_URL = 'https://gobapay.onrender.com/api';
 const update_password = document.getElementById('update_password');

 update_password.addEventListener('click', async (e) => {
    e.preventDefault();

    const oldPass = document.getElementById('oldPass').value;
    const newPass = document.getElementById('newPass').value;
    const comfirmNewPass = document.getElementById('comfirmNewPass').value;


    if (!oldPass || !newPass || !comfirmNewPass ) {
        return showToast("Both fields must not be empty", "danger");
    }

    if (oldPass.length < 8 || newPass.length < 8 || comfirmNewPass.length < 8) {
        return showToast("Password cannot be less than 8 characters", "danger");
    }

    if(newPass !== comfirmNewPass){
        return showToast("Password does not match", "danger");
    }

    try {
        //disableLoginBTN('add');

        const response = await fetch(`${BASE_URL}/user/update-transaction-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPass, newPass, comfirmNewPass})
        });

        console.log('My response is:', response);

        //disableLoginBTN('remove');

        // Handle server errors properly
        if (!response.ok) {
            const errorData = await response.json(); // Get error response
            let errorMessage = errorData.message || 'An unknown error occurred.';

            if (response.status === 401) {
                errorMessage = errorData.message || "Invalid account number or password.";
            } else if (response.status === 429) {
                errorMessage = errorData.message || "Too many requests!";
            } else if (response.status >= 400 && response.status < 500) {
                errorMessage = `Client Error (${response.status}): ${errorMessage}`;
            }

            throw new Error(errorMessage);
        }

        const data = await response.json(); // Parse JSON response

        if (data.success) {
            showToast(`${data.message || 'Password updated successfully'}`, "success");
            
        } else {
            showToast(`${data.message || 'Failed to update'}`, "danger");
        }
    } catch (error) {
        //disableLoginBTN('remove');
        console.error('Error:', error.message);
        showToast(error.message, "danger");
    }
});

*/

function disableLoginBTN(option) {
    loginButton.classList[option]("disableBtn");
    document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
}







function copyToClipboard() {
    const text = document.getElementById("copyText").innerText;

    // Create a temporary input element
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);

    // Select and copy the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    // Remove the temporary input
    document.body.removeChild(tempInput);

    // Show confirmation (optional)
    document.getElementById("copiedMsg").style.display = "inline";
    setTimeout(() => {
      document.getElementById("copiedMsg").style.display = "none";
    }, 2000);
 }

