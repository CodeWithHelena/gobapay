import { showToast } from './message.js'; 

const BASE_URL = 'https://gobapay.onrender.com/api';
const TOKEN_KEY = 'admin_tkn';
let currentSettings = {};
let currentSettingKey = '';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function formatCurrency(amount) {
  if (amount === 0) return '₦0.00';
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}

function showToastSafe(msg, type = 'info') {
  if (typeof showToast === 'function') showToast(msg, type);
  else alert(msg);
}

async function loadSettings() {
  const token = getToken();
  if (!token) {
    showToastSafe('No admin token found. Please login.', 'danger');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/get-all-settings`, {
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      }
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data && (data.message || data.error) ? (data.message || data.error) : `Request failed (${res.status})`;
      showToastSafe(msg, 'danger');
      return;
    }

    const settings = data.settings || data;
    populateSettings(settings);

  } catch (err) {
    console.error('loadSettings error:', err);
    showToastSafe('Network error while loading settings', 'danger');
  }
}

function populateSettings(settings) {
  if (!settings) return;
  currentSettings = settings;

  document.getElementById('accountMaintenanceFee').textContent = formatCurrency(settings.accountMaintenanceFee);
  document.getElementById('atmWithdrawalFee').textContent = formatCurrency(settings.atmWithdrawalFee);
  document.getElementById('cardIssuanceFee').textContent = formatCurrency(settings.cardIssuanceFee);
  document.getElementById('depositFee').textContent = formatCurrency(settings.depositFee);
  document.getElementById('withdrawalFee').textContent = formatCurrency(settings.withdrawalFee);
  document.getElementById('transferChargesOutsideBank').textContent = formatCurrency(settings.transferChargesOutsideBank);
  document.getElementById('transferChargesWithinBank').textContent = formatCurrency(settings.transferChargesWithinBank);
  document.getElementById('updatedAt').textContent = formatDate(settings.updatedAt);
}

// Event listeners
document.addEventListener("click", function (e) {
  // When update button is clicked
  if (e.target.closest('.update-setting-btn')) {
    const button = e.target.closest('.update-setting-btn');
    const settingKey = button.getAttribute('data-setting-key');
    
    if (settingKey && currentSettings[settingKey] !== undefined) {
      currentSettingKey = settingKey;
      
      // Set modal title and input value
      const settingLabels = {
        'accountMaintenanceFee': 'Account Maintenance Fee',
        'atmWithdrawalFee': 'ATM Withdrawal Fee', 
        'cardIssuanceFee': 'Card Issuance Fee',
        'depositFee': 'Deposit Fee',
        'withdrawalFee': 'Withdrawal Fee',
        'transferChargesOutsideBank': 'Transfer Charges Outside Bank',
        'transferChargesWithinBank': 'Transfer Charges Within Bank'
      };
      
      document.getElementById('editSettingsModalLabel').textContent = `Update ${settingLabels[settingKey]}`;
      document.getElementById('editSettingLabel').textContent = `${settingLabels[settingKey]} *`;
      document.getElementById('editSettingValue').value = currentSettings[settingKey];
    }
  }
  
  // When save button is clicked
  if (e.target.id === "saveSingleSetting" || e.target.closest("#saveSingleSetting")) {
    handleSaveSingleSetting();
  }
});

async function handleSaveSingleSetting() {
  if (!currentSettingKey) {
    showToastSafe('No setting selected', 'danger');
    return;
  }

  const newValue = parseFloat(document.getElementById('editSettingValue').value);
  if (isNaN(newValue)) {
    showToastSafe('Please enter a valid number', 'danger');
    return;
  }

  const saveButton = document.getElementById('saveSingleSetting');
  const originalText = saveButton.textContent;
  saveButton.disabled = true;
  saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const token = getToken();
    if (!token) {
      showToastSafe('No admin token found', 'danger');
      return;
    }

    const response = await fetch(`${BASE_URL}/admin/update-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        settingKey: currentSettingKey,
        value: newValue
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data && (data.message || data.error) ? (data.message || data.error) : `Update failed (${response.status})`;
      throw new Error(errorMsg);
    }

    showToastSafe(data.message || 'Setting updated successfully', 'success');
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('editSettingsModal'));
    if (modal) modal.hide();
    
    await loadSettings();
    
  } catch (error) {
    console.error('Update error:', error);
    showToastSafe(error.message || 'Error updating setting', 'danger');
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = originalText;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  loadSettings();
});

window.loadSettings = loadSettings;