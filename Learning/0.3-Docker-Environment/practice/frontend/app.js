const API_BASE = '/api';

async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        document.getElementById('health-status').innerHTML = 
            `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('health-status').innerHTML = 
            `<span style="color: red;">Error: ${error.message}</span>`;
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = users.map(user => 
            `<div class="user">
                <strong>${user.name}</strong> - ${user.email}
                <small>(ID: ${user.id})</small>
            </div>`
        ).join('');
    } catch (error) {
        document.getElementById('users-list').innerHTML = 
            `<span style="color: red;">Error: ${error.message}</span>`;
    }
}

async function addUser(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            loadUsers(); // Refresh the list
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function testCache() {
    try {
        const response = await fetch(`${API_BASE}/cache-test`);
        const data = await response.json();
        document.getElementById('cache-result').innerHTML = 
            `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('cache-result').innerHTML = 
            `<span style="color: red;">Error: ${error.message}</span>`;
    }
}

// Load users on page load
window.onload = () => {
    loadUsers();
    checkHealth();
};

