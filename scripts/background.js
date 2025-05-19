// Domain Tab Grouper - Background Service Worker

// Default settings
const DEFAULT_SETTINGS = {
  groupSubdomains: true,
  autoGroupNewTabs: true,
  domainColors: {},
  customDomainNames: {}
};

// Cache for domain to group mapping
let domainGroupMap = {};
// Cache for current settings
let settings = DEFAULT_SETTINGS;

// Initialize extension
async function initialize() {
  console.log('Domain Tab Grouper: Initializing...');
  
  // Load settings
  await loadSettings();
  
  // Set up event listeners
  chrome.tabs.onCreated.addListener(handleTabCreated);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);
  
  // Group existing tabs
  await groupExistingTabs();
  
  console.log('Domain Tab Grouper: Initialization complete');
}

// Load user settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    settings = result.settings || DEFAULT_SETTINGS;
    console.log('Settings loaded:', settings);
  } catch (error) {
    console.error('Error loading settings:', error);
    settings = DEFAULT_SETTINGS;
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    await chrome.storage.sync.set({ settings });
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Extract domain from URL
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

// Generate a color for a domain
function getColorForDomain(domain) {
  if (settings.domainColors[domain]) {
    return settings.domainColors[domain];
  }
  
  // Default colors if not specified
  const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange', 'grey'];
  
  // Generate a consistent color based on domain string
  const hashCode = Array.from(domain).reduce(
    (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
  
  const colorIndex = Math.abs(hashCode) % colors.length;
  return colors[colorIndex];
}

// Get group name for domain
function getGroupNameForDomain(domain) {
  // Use custom name if available
  if (settings.customDomainNames[domain]) {
    return settings.customDomainNames[domain];
  }
  
  // Remove TLD (last segment) from domain name
  const parts = domain.split('.');
  if (parts.length > 1) {
    parts.pop(); // Remove the last segment (TLD)
    return parts.join('.');
  }
  return domain;
}

// Handle newly created tabs
async function handleTabCreated(tab) {
  if (!settings.autoGroupNewTabs || !tab.url) {
    return;
  }
  
  await groupTab(tab);
}

// Handle tab URL updates
async function handleTabUpdated(tabId, changeInfo, tab) {
  // Only proceed if the URL has changed
  if (!changeInfo.url) {
    return;
  }
  
  await groupTab(tab);
}

// Group a single tab based on its domain
async function groupTab(tab) {
  try {
    const domain = extractDomain(tab.url);
    
    // Skip if no valid domain or special pages
    if (!domain) {
      return;
    }
    
    const { id: tabId, groupId } = tab;
    
    // Find or create group for this domain
    let targetGroupId = domainGroupMap[domain];
    
    if (!targetGroupId) {
      // Create a new group for this domain
      targetGroupId = await chrome.tabs.group({ tabIds: [tabId] });
      
      // Set group properties
      await chrome.tabGroups.update(targetGroupId, {
        title: getGroupNameForDomain(domain),
        color: getColorForDomain(domain)
      });
      
      // Store mapping
      domainGroupMap[domain] = targetGroupId;
    } else if (groupId !== targetGroupId) {
      // Add tab to existing group
      await chrome.tabs.group({ tabIds: [tabId], groupId: targetGroupId });
    }
  } catch (error) {
    console.error('Error grouping tab:', error, tab);
  }
}

// Group all existing tabs
async function groupExistingTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    
    // Group tabs by domain
    const tabsByDomain = {};
    
    for (const tab of tabs) {
      const domain = extractDomain(tab.url);
      if (domain) {
        if (!tabsByDomain[domain]) {
          tabsByDomain[domain] = [];
        }
        tabsByDomain[domain].push(tab.id);
      }
    }
    
    // Create groups for each domain
    for (const [domain, tabIds] of Object.entries(tabsByDomain)) {
      if (tabIds.length > 0) {
        const groupId = await chrome.tabs.group({ tabIds });
        
        await chrome.tabGroups.update(groupId, {
          title: getGroupNameForDomain(domain),
          color: getColorForDomain(domain)
        });
        
        domainGroupMap[domain] = groupId;
      }
    }
  } catch (error) {
    console.error('Error grouping existing tabs:', error);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSettings') {
    sendResponse({ settings });
  } else if (message.type === 'updateSettings') {
    settings = { ...settings, ...message.settings };
    saveSettings();
    
    // Clear domain-group mappings to rebuild groups
    domainGroupMap = {};
    
    // Regroup existing tabs with new settings
    groupExistingTabs();
    
    sendResponse({ success: true });
  } else if (message.type === 'regroupTabs') {
    domainGroupMap = {};
    groupExistingTabs();
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Start the extension
initialize(); 