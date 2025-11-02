import { showToast } from './message.js'; 

const BASE_URL = 'https://gobapay.onrender.com/api';
const TOKEN_KEY = 'admin_tkn';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
  console.log('token gotten')
}

function showToastSafe(msg, type = 'info') {
  if (typeof showToast === 'function') showToast(msg, type);
  else alert(msg);
}

// Make utilities globally available
window.BASE_URL = BASE_URL;
window.TOKEN_KEY = TOKEN_KEY;
window.getToken = getToken;
window.showToastSafe = showToastSafe;