import { showToast } from '../../../../dashboard/assets/js/message.js'
//import { showToast } from '../../../dashboard/'
//showToast('Session Expired. Login to continue', 'warning');
// LOGIN VALIDATION 

 //document.getElementById('loginForm').addEventListener('submit', logUserIn);
//const errorDiv = document.getElementById('error-message')
const BASE_URL = 'https://gobapay.onrender.com/api';
 const loginButton = document.getElementById('loginBTN');

 loginButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const beneficiaryAccountNumber = document.getElementById('beneficiaryAccountNumber').value.trim();
    const password = document.getElementById('password').value;

//     console.log("The type of password is " + typeof(beneficiaryAccountNumber));

    if (!beneficiaryAccountNumber || !password) {
        return showToast("Both fields must not be empty", "danger");
    }

    if (isNaN(Number(beneficiaryAccountNumber))) {
        return showToast("Account Number must be a number", "danger");
    }

    if (beneficiaryAccountNumber.length !== 10) {
        return showToast("Account Number must be 10 digits", "danger");
    }

    try {
        disableLoginBTN('add');

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ beneficiaryAccountNumber, password })
        });

        console.log('My response is:', response);

        disableLoginBTN('remove');

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
        console.log('Data streamed from response:', data);

        if (data.success) {
            localStorage.setItem('authToken', data.token);
            showToast(`${data.message || 'Login Successful. Redirecting...'}`, "success");
            location.href = '../../../dashboard/';
        } else {
            showToast(`${data.message || 'Login failed.'}`, "danger");
        }
    } catch (error) {
        disableLoginBTN('remove');
        console.error('Error:', error.message);
        showToast(error.message, "danger");
    }
});

function disableLoginBTN(option) {
    loginButton.classList[option]("disableBtn");
    document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
}