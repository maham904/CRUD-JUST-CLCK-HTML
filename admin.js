// admin.js - Centralized API Calls

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadUsers();
    loadBooks();
    setupBookForm();
    setupUserManagement();
});

// Centralized API Call Function
async function callAPI(url, method = 'GET', data = null) {
    const options = { method };
    
    if (data) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        return response.ok ? response.json() : Promise.reject('API Error');
    } catch (error) {
        console.error('API Call Failed:', error);
    }
}

// Load Dashboard Data from API
async function loadDashboardData() {
    try {
        const data = await callAPI('/api/dashboard');
        document.querySelector('.dashboard-cards .card:nth-child(1) p').textContent = data.totalBooks;
        document.querySelector('.dashboard-cards .card:nth-child(2) p').textContent = data.totalUsers;
        document.querySelector('.dashboard-cards .card:nth-child(3) p').textContent = data.pendingReviews;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load Books from API
async function loadBooks() {
    try {
        const books = await callAPI('/api/books');
        const bookTable = document.querySelector('.books-table tbody');
        if (!bookTable) return;
        
        bookTable.innerHTML = books.map(book => `
            <tr data-id="${book.id}">
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>
                    <button class="edit-book-btn">Edit</button>
                    <button class="delete-book-btn">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Handle Book Form Submission
function setupBookForm() {
    const form = document.querySelector('.add-book form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const success = await callAPI('/api/books', 'POST', Object.fromEntries(formData));
            if (success) {
                alert('Book added successfully!');
                form.reset();
                loadBooks();
            } else {
                alert('Failed to add book');
            }
        } catch (error) {
            console.error('Error adding book:', error);
        }
    });
}

// Load Users from API
async function loadUsers() {
    try {
        const users = await callAPI('/api/users');
        const userTable = document.querySelector('.users-table tbody');
        if (!userTable) return;

        userTable.innerHTML = users.map(user => `
            <tr data-id="${user.id}">
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="status ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>
                    <a href="#" class="delete-btn">Delete</a>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Handle User and Book Deletion
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-book-btn')) {
        e.preventDefault();
        const row = e.target.closest('tr');
        const bookId = row.dataset.id;

        if (confirm('Are you sure you want to delete this book?')) {
            try {
                const success = await callAPI(`/api/books/${bookId}`, 'DELETE');
                if (success) {
                    row.remove();
                    alert('Book deleted successfully!');
                } else {
                    alert('Failed to delete book');
                }
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }
    }
    
    if (e.target.classList.contains('delete-btn')) {
        e.preventDefault();
        const row = e.target.closest('tr');
        const userId = row.dataset.id;
        
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const success = await callAPI(`/api/users/${userId}`, 'DELETE');
                if (success) {
                    row.remove();
                    alert('User deleted successfully!');
                } else {
                    alert('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    }
});
