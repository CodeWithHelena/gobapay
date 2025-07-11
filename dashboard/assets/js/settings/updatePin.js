import { showToast } from './assets/js/message.js';
        //console.log('show message')
        const token = localStorage.getItem('authToken');

        const BASE_URL = 'https://gobapay.onrender.com/api';
        const savePassword = document.getElementById('savePassword');
        
        savePassword.addEventListener('click', async (e) => {
            e.preventDefault();

            //console.log('button clicked')
            
            const oldPass = document.getElementById('oldPass').value;
            const newPass = document.getElementById('newPass').value;
            const comfirmNewPass = document.getElementById('comfirmNewPass').value;


            if(!oldPass || !newPass || !comfirmNewPass){
                return showToast("All Fields Must be Filled", "danger");
            }

            if(oldPass.length < 6 || newPass.length < 6 || comfirmNewPass.length < 6){
                return showToast("Password Cannot be Less than 6 characters", "danger");
            }

            if(newPass !== comfirmNewPass){
                return showToast("Password does not Match", "danger");
            }
         

            try {
                disableLoginBTN('add');
                const response = await fetch('https://gobapay.onrender.com/api/user/change-password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                     },
                    body: JSON.stringify({oldPass, newPass})
                });

                const data = await response.json();

                disableLoginBTN('remove');

                if (!response.ok) {
                    //console.log("this is success " + data.message);
                    throw new Error(data.message || "Failed to change password");

                    if(data.message === "Invalid token"){
                        if(data.error === "jwt expired"){
                            showToast('Session Expired. Login to continue', 'warning');
                            localStorage.removeItem('authToken');
                            setTimeout(() => {
                                window.location.href = "../landing/login.html";
                            }, 3500);
                        }else{
                           showToast('Invalid Session Id.', 'danger');
                           localStorage.removeItem('authToken');
                            setTimeout(() => {
                                window.location.href = "../landing/login.html";
                            }, 3500);                           
                        }
                    }
                }

                if (data.success) {
                    showToast(`${data.message || "Password Update Successfully"}`, "success");
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
            savePassword.classList[option]("disableBtn");
            document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
            
        }