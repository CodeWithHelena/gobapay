//import { showToast } from './message.js';


const checkAuth = () => {
    const authToken = localStorage.getItem('authToken');
   // console.log("This is the token:", authToken); // Debugging log

    if (!authToken) {
        console.log('Token does not exist, redirecting...');
        window.location.href = "../landing/login.html";
        /*
        showToast('Session Expired. Login to continue', 'warning');
    
        // Redirect after the toast disappears (3.5 seconds to ensure smooth transition)
        setTimeout(() => {
            window.location.href = "../landing/login.html";
        }, 3500);
        */
    }
};

// Call function to check authentication
//checkAuth();






