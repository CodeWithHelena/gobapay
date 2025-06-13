
const firstItem = document.getElementById('first-item');
const secondItem = document.getElementById('second-item');


// OPEN AND CLOSE MODAL
document.getElementById('openModal').addEventListener('click', function(e) {
    e.preventDefault();
    //alert('clicked')
    document.getElementById('custom-modal-overlay').classList.add('active');
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('custom-modal-overlay').classList.remove('active');
    firstItem.style.display = 'block';
    secondItem.style.display = 'none';
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




document.getElementById('payBtn').addEventListener('click', (e) =>{
    const firstItem = document.getElementById('first-item').style.display = 'none';
    const secondItem = document.getElementById('second-item').style.display = 'block';

    firstItem.style.display = 'none';
    secondItem.style.display = 'block';
    
    

    //alert('clicked')
})

