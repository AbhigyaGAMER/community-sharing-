// --- Global Variables ---
const API_BASE_URL = 'http://127.0.0.1:8080/api';
let AUTH_TOKEN = null;

// --- Utility Functions ---

/**
 * Handles the login process: fetches username/password and sets the AUTH_TOKEN.
 */
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');
    
    // CRITICAL: Basic Authentication requires encoding "username:password" in Base64
    const credentials = btoa(`${username}:${password}`);
    
    loginMessage.textContent = 'Attempting login...';

    // Test the credentials against the secured endpoint /api/resources
    fetch(`${API_BASE_URL}/resources`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    })
    .then(response => {
        if (response.ok) {
            // Successful connection: store token, show dashboard
            AUTH_TOKEN = credentials;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard-section').style.display = 'block';
            loginMessage.textContent = 'Login successful!';
            
            fetchResources();
        } else {
            // Authentication failed (e.g., 401 Unauthorized)
            console.error('Login failed, Status:', response.status); 
            throw new Error(`Authentication failed. Status: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('Login Error:', error);
        loginMessage.textContent = 'Login failed. Check credentials.';
    });
}


/**
 * Fetches resources from the secured backend API.
 */
function fetchResources() {
    const statusMessage = document.getElementById('status-message');
    const resourceList = document.getElementById('resource-list');
    
    if (!AUTH_TOKEN) {
        statusMessage.textContent = 'Please log in first.';
        return;
    }
    
    statusMessage.textContent = 'Fetching resources...';
    resourceList.innerHTML = ''; 

    fetch(`${API_BASE_URL}/resources`, {
        method: 'GET',
        headers: {
            // Use the stored Basic Auth token
            'Authorization': `Basic ${AUTH_TOKEN}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch resources. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(resources => {
        statusMessage.textContent = `Found ${resources.length} resources.`;
        renderResources(resources);
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        statusMessage.textContent = 'Error: Could not retrieve resources.';
    });
}

/**
 * Renders the list of resources to the dashboard.
 */
function renderResources(resources) {
    const listElement = document.getElementById('resource-list');
    listElement.innerHTML = ''; 

    resources.forEach(resource => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('resource-item');
        itemDiv.classList.add(resource.available ? 'available' : 'unavailable');
        
        itemDiv.innerHTML = `
            <strong>${resource.name} (${resource.type})</strong> 
            [${resource.available ? 'Available' : 'Unavailable'}]<br>
            <small>${resource.description}</small>
        `;
        listElement.appendChild(itemDiv);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dashboard-section').style.display = 'none';
});