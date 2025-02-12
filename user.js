// user.js - Handles User-Side API Requests

document.addEventListener('DOMContentLoaded', () => {
    loadBooksForUsers();
    setupReviewForm();
    setupUserAuthentication();
    setupUserRegistration();
    setupProfileUpdate();
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

// Load Books for Users
async function loadBooksForUsers() {
    try {
        const books = await callAPI('/api/books');
        const bookList = document.querySelector('.book-list');
        if (!bookList) return;

        bookList.innerHTML = books.map(book => `
            <div class="book-item">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <button class="download-btn" data-id="${book.id}">Download</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Handle Book Download
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('download-btn')) {
        const bookId = e.target.dataset.id;
        window.location.href = `/api/books/${bookId}/download`;
    }
});

// Handle Review Submission
function setupReviewForm() {
    const form = document.querySelector('.review-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const success = await callAPI('/api/reviews', 'POST', Object.fromEntries(formData));
            if (success) {
                alert('Review submitted successfully!');
                form.reset();
            } else {
                alert('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    });
}

// Handle User Authentication
function setupUserAuthentication() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            
            try {
                const user = await callAPI('/api/login', 'POST', Object.fromEntries(formData));
                if (user) {
                    alert('Login successful!');
                    window.location.href = '/user-dashboard.html';
                } else {
                    alert('Invalid credentials');
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        });
    }
}

// Handle User Registration
function setupUserRegistration() {
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            
            try {
                const success = await callAPI('/api/register', 'POST', Object.fromEntries(formData));
                if (success) {
                    alert('Registration successful! Please log in.');
                    window.location.href = '/login.html';
                } else {
                    alert('Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
            }
        });
    }
}

// Handle Profile Update
function setupProfileUpdate() {
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            
            try {
                const success = await callAPI('/api/users/me', 'PATCH', Object.fromEntries(formData));
                if (success) {
                    alert('Profile updated successfully!');
                } else {
                    alert('Failed to update profile');
                }
            } catch (error) {
                console.error('Profile update error:', error);
            }
        });
    }
}
