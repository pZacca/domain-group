// Domain Tab Grouper - Popup Script

// UI Elements
const groupSubdomainsCheckbox = document.getElementById('groupSubdomains');
const autoGroupNewTabsCheckbox = document.getElementById('autoGroupNewTabs');
const domainListElement = document.getElementById('domainList');
const regroupButton = document.getElementById('regroupButton');
const saveButton = document.getElementById('saveButton');
const domainItemTemplate = document.getElementById('domainItemTemplate');

// Current settings and domain data
let settings = {};
let activeDomains = [];

// Initialize popup
async function initializePopup() {
  try {
    // Load current settings from background script
    const response = await sendMessage({ type: 'getSettings' });
    settings = response.settings;
    
    // Update UI with current settings
    groupSubdomainsCheckbox.checked = settings.groupSubdomains;
    autoGroupNewTabsCheckbox.checked = settings.autoGroupNewTabs;
    
    // Get active domains from current tabs
    await loadActiveDomains();
    
    // Populate domain list
    renderDomainList();
    
    // Set up event listeners
    regroupButton.addEventListener('click', handleRegroup);
    saveButton.addEventListener('click', handleSave);
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

// Load domains from current tabs
async function loadActiveDomains() {
  try {
    const tabs = await chrome.tabs.query({});
    const domains = new Set();
    
    for (const tab of tabs) {
      const domain = extractDomain(tab.url);
      if (domain) {
        domains.add(domain);
      }
    }
    
    activeDomains = Array.from(domains).sort();
  } catch (error) {
    console.error('Error loading active domains:', error);
    activeDomains = [];
  }
}

// Extract domain from URL based on current settings
function extractDomain(url) {
  try {
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
      return null;
    }
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // If we're not grouping subdomains, return the full hostname
    if (!settings.groupSubdomains) {
      return hostname;
    }
    
    // Extract the base domain (e.g., example.com from sub.example.com)
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    
    return hostname;
  } catch (error) {
    console.error('Error extracting domain:', error, url);
    return null;
  }
}

// Render the domain list in the UI
function renderDomainList() {
  // Clear the list
  domainListElement.innerHTML = '';
  
  if (activeDomains.length === 0) {
    const noDomainsElement = document.createElement('div');
    noDomainsElement.className = 'no-domains';
    noDomainsElement.textContent = 'No domains found. Open some tabs first.';
    domainListElement.appendChild(noDomainsElement);
    return;
  }
  
  // Add domains to the list
  for (const domain of activeDomains) {
    // Clone the template
    const domainItem = domainItemTemplate.content.cloneNode(true);
    
    // Set domain name
    const domainNameElement = domainItem.querySelector('.domain-name');
    domainNameElement.textContent = domain;
    
    // Set color select value
    const colorSelect = domainItem.querySelector('.color-select');
    const domainColor = settings.domainColors?.[domain] || getDefaultColorForDomain(domain);
    if (domainColor) {
      colorSelect.value = domainColor;
    }
    
    // Set custom name input value
    const customNameInput = domainItem.querySelector('.custom-name');
    customNameInput.value = settings.customDomainNames?.[domain] || '';
    customNameInput.dataset.domain = domain;
    
    // Add data attributes for identification
    colorSelect.dataset.domain = domain;
    
    domainListElement.appendChild(domainItem);
  }
}

// Get default color for a domain (similar to background.js logic)
function getDefaultColorForDomain(domain) {
  const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange', 'grey'];
  
  const hashCode = Array.from(domain).reduce(
    (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
  
  const colorIndex = Math.abs(hashCode) % colors.length;
  return colors[colorIndex];
}

// Handle Regroup button click
async function handleRegroup() {
  try {
    await sendMessage({ type: 'regroupTabs' });
    window.close();
  } catch (error) {
    console.error('Error regrouping tabs:', error);
  }
}

// Handle Save button click
async function handleSave() {
  try {
    // Collect settings from UI
    const newSettings = {
      groupSubdomains: groupSubdomainsCheckbox.checked,
      autoGroupNewTabs: autoGroupNewTabsCheckbox.checked,
      domainColors: {},
      customDomainNames: {}
    };
    
    // Collect domain colors
    const colorSelects = document.querySelectorAll('.color-select');
    for (const select of colorSelects) {
      const domain = select.dataset.domain;
      newSettings.domainColors[domain] = select.value;
    }
    
    // Collect custom domain names
    const customNameInputs = document.querySelectorAll('.custom-name');
    for (const input of customNameInputs) {
      const domain = input.dataset.domain;
      if (input.value.trim()) {
        newSettings.customDomainNames[domain] = input.value.trim();
      }
    }
    
    // Send settings to background script
    await sendMessage({ type: 'updateSettings', settings: newSettings });
    
    // Close popup
    window.close();
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Send a message to the background script
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Start the popup
document.addEventListener('DOMContentLoaded', initializePopup); 