import { showToast } from '../../../../dashboard/assets/js/message.js';

const email = localStorage.getItem('resetpaswordEmail');
  

console.log(email);

const resetPassword = document.getElementById('reset_password');

    resetPassword.addEventListener('click', async (e) => {
            e.preventDefault();

            //console.log('button clicked')
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;


            if(!newPassword || !confirmPassword){
                return showToast("Both Fields Cannot be empty", "danger");
            }

            if(newPassword && confirmPassword < 8){
                return showToast("Password Cannot be Less than 8 characters", "danger");
            }

            if(newPassword !== confirmPassword){
                return showToast("Password does not Match", "danger");
            }

            if(!email){

                //location.href = "forgot-password.html";
                return showToast("Please enter email to recieve otp", "danger");
                
            }

            


            try {
                disableLoginBTN('add');
                const response = await fetch(`https://gobapay.onrender.com/api/auth/new-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, newPassword })
                });

                const data = await response.json();

                disableLoginBTN('remove');

                if (!response.ok) {
                    console.log(data);
                    throw new Error(data.message || "Failed to change password");
                }

                if (data.success) {
                    showToast(`${data.message || "Password Update Successfully"}`, "success");
                    //location.href = "reset-password-otp.html";
                    localStorage.removeItem('resetpaswordEmail');
                    console.log('password update successfully ')
                } else {
                    showToast(`${data.message || "Failed to update password"}`, "danger");
                }
            } catch (error) {
                //disableLoginBTN('remove');
                console.error('Error changing:', error.message);
                showToast(`${error.message || "There was an error"}`, "danger");
            }
        })



        function disableLoginBTN(option) {
            resetPassword.classList[option]("disableBtn");
            document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
            
        }