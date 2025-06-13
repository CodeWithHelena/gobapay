import { showToast } from '../../../../dashboard/assets/js/message.js'
// REGISTER VALIDATION

/*
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

*/



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
        return showToast("All fields are required", "danger");
    }

    if (password.length < 8 ) {
        return showToast("Password must be at least 6 characters long", "danger");
    }

    if (password !== repeat_password) {
        showToast("Passwords do not match.", "danger");
        return;
    }

    if (!/^\d{11}$/.test(bvn)) {
        showToast("BVN must be exactly 11 digits.", "danger");
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

        const data = await response.json();

        if (!response.ok) {
            console.log(data)
            throw new Error(Array.isArray(data.errors)
            ? data.errors.join(', ')
            : data.message || "Registration failed");
            
        }

        if (data.success) {
            console.log(data.beneficiaryAccountNumber)
            localStorage.setItem('userAccountNumber', data.beneficiaryAccountNumber);
            showToast(`${data.message || "Opening Account Successful"}`, "success");
        } else {
            const errorMsg = Array.isArray(data.errors)
            ? data.errors.join(', ')
            : data.message || "Error creating account";
        showToast(errorMsg, "danger");
        }
    } catch (error) {
        console.error('Error:', error.message);
        showToast(`${error.message || "There was an error"}`, "danger");
    }
});

