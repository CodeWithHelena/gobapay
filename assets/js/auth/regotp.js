import { showToast } from '../../../../dashboard/assets/js/message.js'
// OPT CONTAINER INPUTS
const inputs = document.querySelectorAll(".otp-input");
        
        inputs.forEach((input, index) => {
            input.addEventListener("input", (e) => {
                if (e.inputType === "insertFromPaste" || e.data?.length > 1) {
                    const pastedData = e.data.trim().split("");
                    inputs.forEach((inp, i) => inp.value = pastedData[i] || "");
                    inputs[Math.min(pastedData.length, inputs.length) - 1]?.focus();
                } else {
                    if (input.value && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                }
            });

            input.addEventListener("paste", (e) => {
                e.preventDefault();
                const pastedData = (e.clipboardData.getData("text").trim()).split("");
                inputs.forEach((inp, i) => inp.value = pastedData[i] || "");
                inputs[Math.min(pastedData.length, inputs.length) - 1]?.focus();
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && !input.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });




// VALIDATE OPT VALUE
const verifyOtpBtn = document.getElementById('verifyOtpBtn');

verifyOtpBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    //localStorage.setItem('userAccountNumber', data.beneficiaryAccountNumber);

    const otp = Array.from(document.querySelectorAll('.otp-input'))
                     .map(input => input.value.trim())
                     .join('');
    
    const userAccountNumber = localStorage.getItem('userAccountNumber');

    if (!otp || otp.length !== 6) {
        return showToast("Please enter the 6-digit OTP", "danger");
    }

    if (!userAccountNumber) {
        return showToast("No account number found. Please register again.", "danger");
    }

    try {
        disableLoginBTN('add');
        const response = await fetch(`https://gobapay.onrender.com/api/auth/verifyotp/${userAccountNumber}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp })
        });

        const data = await response.json();

        disableLoginBTN('remove');

        if (!response.ok) {
            console.log(data);
            throw new Error(data.message || "OTP verification failed");
        }

        if (data.success) {
            showToast(`${data.message || "OTP Verified Successfully"}`, "success");
            console.log('otp verified')
            setTimeout(() => {
                location.href = '../../../dashboard/';
            }, 3000);
        } else {
            showToast(`${data.message || "OTP Verification Failed"}`, "danger");
        }
    } catch (error) {
        //disableLoginBTN('remove');
        console.error('Error:', error.message);
        showToast(`${error.message || "There was an error"}`, "danger");
    }
});

function disableLoginBTN(option) {
    verifyOtpBtn.classList[option]("disableBtn");
    document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
    
}


//VALIDATE RESET PASSWORD OTP





//OTP COUNTDOWN FOR RESEND OTP
function startOtpCountdown() {
    const counterSpan = document.querySelector(".otp-counter");
    const resendText = document.querySelector(".resend-otp");
    let timeLeft = 20; // 3 minutes in seconds

    const countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        // Format and show countdown
        counterSpan.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        timeLeft--;

        // When countdown is done
        if (timeLeft < 0) {
            clearInterval(countdown);
            counterSpan.textContent = "Resend";
            // You can add click functionality here if needed
        }

        if(counterSpan.textContent === "Resend"){
            counterSpan.style.color = 'green'
        }
    }, 1000);
}
startOtpCountdown()








/*

const verifyOtpBtn = document.getElementById('verifyOtpBtn');

verifyOtpBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const otp = document.getElementById('otp').value.trim();
    const userAccountNumber = localStorage.getItem('userAccountNumber');

    if (!otp) {
        return showToast("Please enter the OTP", "danger");
    }

    if (!userAccountNumber) {
        return showToast("No account number found. Please register again.", "danger");
    }

    try {
        const response = await fetch(`https://gobapay.onrender.com/api/auth/verifyotp/${userAccountNumber}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp })
        });

        const data = await response.json();

        if (!response.ok) {
            console.log(data);
            throw new Error(data.message || "OTP verification failed");
        }

        if (data.success) {
            showToast(`${data.message || "OTP Verified Successfully"}`, "success");
            // Redirect or take next action
            location.href = "../login/index.html";
        } else {
            showToast(`${data.message || "OTP Verification Failed"}`, "danger");
        }
    } catch (error) {
        console.error('Error:', error.message);
        showToast(`${error.message || "There was an error"}`, "danger");
    }
});
*/