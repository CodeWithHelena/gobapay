    import { showToast } from '../message.js';
    //import { showToast } from '../../../../auth/login.html';

    const token = localStorage.getItem('authToken');
    const BASE_URL = 'https://gobapay.onrender.com/api';
    const openModal = document.getElementById('openModal');

    const amountInput = document.getElementById('amount');
    const amounTop = document.getElementById('amounTop')
    
    const firstItem = document.getElementById('first-item');
    const secondItem = document.getElementById('second-item');
    const thirdItem = document.getElementById('thirdItem');
    const displayMessage = document.getElementById('displayMessage');
    const displayMessageDiv = document.querySelector('.display-message');
    const sucsessAmount = document.getElementById('sucsessAmount');
    const sucsessName = document.getElementById('sucsessName');

    document.getElementById('closeDisplayMessage').addEventListener('click', ()=> {
        displayMessageDiv.style.display = 'none';
    })
    
    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('custom-modal-overlay').classList.remove('active');

        secondItem.style.display = "none";
        thirdItem.style.display = "none"
        firstItem.style.display = "block";
    });



    // TRANSACTION PIN INPUTS/BUTTONS
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

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

  
    function formattedAmount(amounts) {
        const rawValue = String(amounts).replace(/,/g, ''); // Clean commas if any
        const amountInt = parseFloat(rawValue);

        if (!isNaN(amountInt)) {
            const formatted = amountInt.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return `₦${formatted}`;
        } else {
            console.log(rawValue + " is not a valid number");
            return null;
        }
    }



    //GET TRANSACTION DEATAILS
    openModal.addEventListener('click', async (e) => {
        e.preventDefault();

        const beneficiaryAccountNumber = document.getElementById('accountNumber').value;
        const beneficiaryBank = document.getElementById('beneficiaryBank').value;
        const amount = amountInput.value;
        const description = document.getElementById('description').value;
        const payBtn = document.getElementById('payBtn');

        // VALIDATIONS
        if (!beneficiaryAccountNumber || !amount) {
            return showToast('All Fields Must be Filled', 'danger');
        }

       

        function transactionDetails(dataName) {
            document.getElementById('custom-modal-overlay').classList.add('active');

            amounTop.innerHTML = formattedAmount(amount)
            document.getElementById('sendAmount').innerHTML = formattedAmount(amount)
            
            const bankName = document.getElementById('bankName').innerHTML = beneficiaryBank;
            const AccountNumber = document.getElementById('beneficiaryAccountNumber').innerHTML = beneficiaryAccountNumber;
            const accountName = document.getElementById('accountName').innerHTML = dataName;
            const transactionFee = document.getElementById('transactionFee');

        };

        try {
            disableLoginBTN('add');

            const response = await fetch(
                `${BASE_URL}/user/get-recepient-fullname`,
                {
                    method: 'POST', // POST
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ beneficiaryAccountNumber }),
                }
            );

            console.log(beneficiaryAccountNumber)


            disableLoginBTN('remove');

            if (!response.ok) {
                let errorMessage = 'Failed to get transaction details';

                try {
                    const errData = await response.json();
                    errorMessage = errData.message || errorMessage;
                } catch (jsonErr) {
                    console.warn('Response body is not valid JSON or is empty.');
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('accNumber', beneficiaryAccountNumber);
                localStorage.setItem('accName', data.data);
                transactionDetails(data.data);

                payBtn.addEventListener("click", () =>{                    
                    firstItem.style.display = "none";
                    secondItem.style.display = "block";
                })
            } else {
                showToast(data.error || 'Failed to get transaction details', 'danger');
                alert('test');
            }

        } catch (error) {
            console.error('Error changing:', error.message);
            //console.log(error.message);
            if(error.message === "Invalid token"){
                console.log("log out");
                setTimeout(() => {
                    window.location.href = "../../../../auth/login.html";
                }, 3500);

                localStorage.removeItem('authToken');
            }
            //showToast(error.message || 'There was an error', 'danger');
            displayMessageDiv.style.display = "block";
            displayMessage.innerHTML = error.message;
        }
    });

    function disableLoginBTN(option) {
        openModal.classList[option]('disableBtn');
        document.querySelector('.fa-spin')?.classList[option]('fa-spinner');
    }


   







    //PROCESS PAYMENT
        sendMoniBTN.addEventListener('click', async (e) => {
            e.preventDefault(); 
            
            const beneficiaryAccountNumber = localStorage.getItem('accNumber');
            //const amount = document.getElementById('amount').value;
            const amount = parseInt(document.getElementById('amount').value, 10);
            const description = document.getElementById('description').value;
            const transactionPin = Array.from(document.querySelectorAll('.otp-input')).map(input => input.value.trim()).join('');
            

            console.log(transactionPin);
            console.log(amount)
            console.log(amount - 10)

            try {
                disableLoginBTN('add');

                const response = await fetch(
                    `${BASE_URL}/user/transfer`,
                    {
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({beneficiaryAccountNumber, amount, transactionPin, description }),
                    }
                );



                disableLoginBTN('remove');

                if (!response.ok) {
                    //document.getElementById('custom-modal-overlay').classList.remove('active');
                    let errorMessage = 'Failed to get transaction details';

                    try {
                        const errData = await response.json();
                        errorMessage = errData.message || errorMessage;
                    } catch (jsonErr) {
                        console.warn('Response body is not valid JSON or is empty.');
                    }

                    throw new Error(errorMessage);
                }

                const data = await response.json();
                console.log(data)

                let transactionReference = "";

                if (data.success === "true") {

                    //showToast(data.message || 'Transfer Successful', 'success');
                    
                } else {
                    
                    //document.getElementById('custom-modal-overlay').classList.remove('active');
                    //showToast(data.error || 'Transfer failed', 'danger');
                    
                      transactionReference = data.reference; // Store reference
                      console.log(transactionReference)
                      const receiverName = data.receiverName;
                      const amountFormatted = formattedAmount(data.amount);

                      document.getElementById('sucsessAmount').textContent = amountFormatted;
                      document.getElementById('sucsessName').textContent = receiverName;

                      secondItem.style.display = "none";
                      thirdItem.style.display = "block";

                      // Attach the event listener here
                      const viewReceiptBtn = document.getElementById('viewReceiptBtn');
                      if (viewReceiptBtn) {
                        viewReceiptBtn.addEventListener('click', () => {
                            const encodedRef = encodeURIComponent(transactionReference);
                            window.location.href = `receipt.html?reference=${encodedRef}`;
                        });
                      }
                }

            } catch (error) {
                //console.error('Error changing:', error.message);
                showToast(error.message || 'There was an error', 'danger');
                // displayMessageDiv.style.display = "block";
                // displayMessage.innerHTML = error.message;
            }
        }); 
