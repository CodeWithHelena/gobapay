import { showToast } from '../../../dashboard/assets/js/message.js';

//showToast('Session Expired. Login to continue', 'warning');
// LOGIN VALIDATION 



// document.getElementById('loginForm').addEventListener('submit', logUserIn);
//const errorDiv = document.getElementById('error-message')
const BASE_URL = 'https://gobapay.onrender.com/api';
// const loginButton = document.getElementById('loginBTN');

// loginButton.addEventListener('click', async (e) => {
//     e.preventDefault();

//     const beneficiaryAccountNumber = document.getElementById('beneficiaryAccountNumber').value.trim();
//     const password = document.getElementById('password').value;

//     console.log("The type of password is " + typeof(beneficiaryAccountNumber));

//     if (!beneficiaryAccountNumber || !password) {
//         return showToast("Both fields must not be empty", "danger");
//     }

//     if (isNaN(Number(beneficiaryAccountNumber))) {
//         return showToast("Account Number must be a number", "danger");
//     }

//     if (beneficiaryAccountNumber.length !== 10) {
//         return showToast("Account Number must be 10 digits", "danger");
//     }

//     try {
//         disableLoginBTN('add');

//         const response = await fetch(`${BASE_URL}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ beneficiaryAccountNumber, password })
//         });

//         console.log('My response is:', response);

//         disableLoginBTN('remove');

//         // Handle server errors properly
//         if (!response.ok) {
//             const errorData = await response.json(); // Get error response
//             let errorMessage = errorData.message || 'An unknown error occurred.';

//             if (response.status === 401) {
//                 errorMessage = errorData.message || "Invalid account number or password.";
//             } else if (response.status === 429) {
//                 errorMessage = errorData.message || "Too many requests!";
//             } else if (response.status >= 400 && response.status < 500) {
//                 errorMessage = `Client Error (${response.status}): ${errorMessage}`;
//             }

//             throw new Error(errorMessage);
//         }

//         const data = await response.json(); // Parse JSON response
//         console.log('Data streamed from response:', data);

//         if (data.success) {
//             localStorage.setItem('authToken', data.token);
//             showToast(`${data.message || 'Login Successful. Redirecting...'}`, "success");
//             location.href = '../dashboard/index.html';
//         } else {
//             showToast(`${data.message || 'Login failed.'}`, "danger");
//         }
//     } catch (error) {
//         disableLoginBTN('remove');
//         console.error('Error:', error.message);
//         showToast(error.message, "danger");
//     }
// });

// function disableLoginBTN(option) {
//     loginButton.classList[option]("disableBtn");
//     document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
// }




// REGISTER VALIDATION
const registerBtn = document.getElementById('registerBtn');
registerBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    

    const first_name = document.getElementById('first_name').value.trim();
    const middle_name = document.getElementById('middle_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const country = document.getElementById('country').value;
    const address = document.getElementById('address').value.trim();
    const bvn = document.getElementById('bvn').value.trim();
    const businessName = document.getElementById('businessName').value.trim();
    const password = document.getElementById('password').value;
    const repeat_password = document.getElementById('repeat_password').value;


    let gender = "";
    if (document.getElementById('male').checked) gender = "male";
    if (document.getElementById('female').checked) gender = "female";

    // VALIDATIONS
    if (!first_name || !phone || !email || !gender || !country || !address || !bvn || !businessName || !password || !repeat_password ) {
        //errorMessage.textContent = "Please select a gender.";
        return showToast("All fields are required", "danger");
    }

    if (password.length < 6 ) {
        //errorMessage.textContent = "Password must be at least 6 characters long, include a number and a special character.";
       return showToast("Password must be at least 6 characters long", "danger");
       
    }

    if (password !== repeat_password) {
        //errorMessage.textContent = "Passwords do not match.";
        showToast("Passwords do not match.", "danger")
        return;
    }

    if (!/^\d{11}$/.test(bvn)) {
        //errorMessage.textContent = "BVN must be exactly 10 digits.";
        showToast("BVN must be exactly 10 digits.", "danger")
        return;
    }

    const userData = {
        first_name,
        middle_name,
        last_name,
        phone,
        email,
        gender,
        country,
        address,
        bvn,
        businessName,
        password
    };

    try {
        const response = await fetch('https://gobapay.onrender.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if(!response.ok){
            const errorData = response.json()
            throw new Error(errorData.message)
        }
        
        const data = await response.json();

        if (data.success) {
            showToast(`${data.message || "Opening Account Successful"}`, "success")
        } else {
            showToast(`${data.message || "Error creating account"}`, "danger")
        }
    } catch (error) {
        console.error('Error:', error.message);
        showToast(`${error.message || "There was an error"}`, "danger")
    }
})


