document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});

// Fetch and Display Users
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// Render Users in the Table
function renderUsers(users) {
    const usersTable = document.querySelector(".users-table tbody");
    usersTable.innerHTML = ""; // Clear existing data

    users.forEach(user => {
        const row = document.createElement("tr");
        row.dataset.id = user.id;

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status ${user.active ? 'active' : 'inactive'}">${user.active ? 'Active' : 'Inactive'}</span></td>
            <td class="actions">
                <button class="status-toggle" data-id="${user.id}" data-active="${user.active}">${user.active ? 'Deactivate' : 'Activate'}</button>
                <button class="delete-user" data-id="${user.id}">Delete</button>
            </td>
        `;

        usersTable.appendChild(row);
    });

    attachEventListeners();
}

// Handle Status Toggle
async function toggleUserStatus(userId, isActive) {
    try {
        const response = await fetch(`/api/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ active: !isActive })
        });

        if (!response.ok) throw new Error("Failed to update status");

        loadUsers(); // Reload the user list
    } catch (error) {
        console.error("Error updating user status:", error);
    }
}

//  Handle User Deletion
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) throw new Error("Failed to delete user");

        loadUsers(); // Reload the list after deletion
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Attach Event Listeners to Buttons
function attachEventListeners() {
    document.querySelectorAll(".status-toggle").forEach(button => {
        button.addEventListener("click", (e) => {
            const userId = e.target.dataset.id;
            const isActive = e.target.dataset.active === "true";
            toggleUserStatus(userId, isActive);
        });
    });

    document.querySelectorAll(".delete-user").forEach(button => {
        button.addEventListener("click", (e) => {
            const userId = e.target.dataset.id;
            deleteUser(userId);
        });
    });
}

//  Helper: Get Auth Token
function getAuthToken() {
    return localStorage.getItem('authToken');
}
