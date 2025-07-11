//import { showToast } from './message.js';
import { showToast } from './message.js';
console.log('this is Auth');
const checkAuth = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken || authToken === null) {
        showToast("Token does not exist, redirecting...", "warning");
        setTimeout(() => {
            location.href = '../../auth/login.html';
        }, 3000);
    }
};

// Call function to check authentication
checkAuth();






