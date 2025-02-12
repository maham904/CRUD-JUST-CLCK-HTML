// Refactored and Combined JavaScript Code (Admin & User)

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) redirectToLogin();
    initializeApp();
});

function initializeApp() {
    loadDashboardData();
    loadUsers();
    loadBooks();
    setupForms();
    setupAdminControls();
    setupSearchFunction();
}

// Centralized API Call with Authentication & CSRF Protection
async function callAPI(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: getHeaders()
    };
    
    if (data) options.body = JSON.stringify(data);
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        handleError(error);
    }
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        'X-CSRF-Token': getCsrfToken()
    };
}

// Authentication Functions
function isAuthenticated() { return !!localStorage.getItem('authToken'); }
function getAuthToken() { return localStorage.getItem('authToken'); }
function getCsrfToken() { return document.querySelector('meta[name="csrf-token"]').content; }
function redirectToLogin() { window.location.href = '/login.html'; }

// Secure User and Book Management
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        e.preventDefault();
        const entityId = e.target.closest('tr').dataset.id;
        const entityType = e.target.dataset.type; // "user" or "book"
        if (!confirmDeletion(entityType)) return;

        try {
            const success = await callAPI(`/api/${entityType}s/${entityId}`, 'DELETE');
            if (success) removeTableRow(e.target);
        } catch (error) {
            alert(`Failed to delete ${entityType}`);
        }
    }
});

function confirmDeletion(entityType) { return confirm(`Are you sure you want to delete this ${entityType}?`); }
function removeTableRow(element) { element.closest('tr').remove(); alert('Deletion successful!'); }

// Input Validation for Forms
function validateForm(data) {
    return Object.values(data).every(value => {
        if (!value) {
            alert('All fields must be filled');
            return false;
        }
        return true;
    });
}

// Secure Login & Signup Handling
document.querySelectorAll('.auth-form')?.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        if (!validateForm(formData)) return;

        const endpoint = form.classList.contains('signup-form') ? '/api/signup' : '/api/login';
        try {
            const response = await callAPI(endpoint, 'POST', formData);
            if (response.token) handleSuccessfulLogin(response.token);
            else alert('Authentication failed');
        } catch (error) {
            alert('Authentication error');
        }
    });
});

function handleSuccessfulLogin(token) {
    localStorage.setItem('authToken', token);
    window.location.href = '/dashboard.html';
}

// Admin-Specific Functions
function setupAdminControls() {
    document.querySelector('.add-book-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        if (!validateForm(formData)) return;
        
        try {
            const response = await callAPI('/api/books', 'POST', formData);
            if (response.success) {
                alert('Book added successfully');
                location.reload();
            }
        } catch (error) {
            alert('Failed to add book');
        }
    });
}

// Search Functionality for Books
function setupSearchFunction() {
    const searchInput = document.querySelector('#search-books');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll('.book-item').forEach(book => {
            const title = book.querySelector('.book-title').textContent.toLowerCase();
            book.style.display = title.includes(query) ? '' : 'none';
        });
    });
}
