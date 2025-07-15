import { showToast } from '../message.js';

const token = localStorage.getItem('authToken');
const BASE_URL = 'https://gobapay.onrender.com/api';

const urlParams = new URLSearchParams(window.location.search);
const reference = urlParams.get('reference');

if (reference) {
    fetch(`${BASE_URL}/transaction?reference=${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log('Transaction details:', data);

        // Only log receipt if success is true
        if (data.succes === true || data.success === true) {
            console.log('Receipt:', data.receipt);

            document.getElementById('receiptAmount').textContent = `₦${data.receipt.amount}`;            
            document.getElementById('receiptSenderName').textContent = data.receipt.sender.name;
            document.getElementById('receiptSenderAccount').textContent = data.receipt.sender.accountNumber;
            document.getElementById('receiptSenderBank').textContent = 'Gobapay';
            document.getElementById('receiptRecieverName').textContent = data.receipt.receiver.name;
            document.getElementById('receiptRecieverAccount').textContent = data.receipt.receiver.accountNumber;
            document.getElementById('receiptRecieverBank').textContent = 'Gobapay';
            document.getElementById('receiptTransactionDate').textContent = formatDate(data.receipt.date);
            document.getElementById('receiptTransactionRef').textContent = data.receipt.reference;
            document.getElementById('receiptDescription').textContent = data.receipt.description;

            //Remove Skeleton Loading
           document.querySelectorAll('.skeleton').forEach(el => el.classList.remove('skeleton'));

        } else {
            console.warn("Transaction not successful.");
        }

        // TODO: Continue updating the page with data
    })
    .catch(err => {
        console.error("Error fetching receipt:", err);
    });
} else {
    showToast("No reference found in the URL", "danger");
}


//FORMAT THE DATE
function formatDate (receiptDate){
    const rawDate = new Date(receiptDate);
    const formattedDate = rawDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',      // "July"
        day: 'numeric',     // "8"
        hour: '2-digit',    // "16"
        minute: '2-digit',
        second: '2-digit',
        hour12: false       // 24-hour format
    });

    return formattedDate
}
