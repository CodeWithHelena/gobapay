
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
        usersName.textContent = "Hi " + user.firstName;
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

function disableLoginBTN(option) {
    loginButton.classList[option]("disableBtn");
    document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
}




/* ADD MONEY MODAL */
const addFundBtn = document.getElementById('addFund');

// Open and close modal
 document.getElementById('openModal').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('custom-modal-overlay').classList.add('active');
});
document.getElementById('openModal2').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('custom-modal-overlay').classList.add('active');
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('custom-modal-overlay').classList.remove('active');
    addFundBtn.innerHTML = "Copy Number";
});



addFundBtn.addEventListener('click', () =>{
     copyToClipboard()
     addFundBtn.innerHTML = "Copied";
})



function copyToClipboard() {
    const text = document.getElementById("modalAccountNumber").innerText;

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
 }

