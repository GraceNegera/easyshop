// script.js - Updated with local product data, improved UI feedback, and working login simulation

// Global state
let products = [
    {
        id: 1,
        name: "Vintage Camera",
        price: 120.00,
        image_url: "https://placehold.co/400x300/e74c3c/ffffff?text=Vintage+Camera",
        description: "A classic vintage camera with a manual lens. Perfect for photography enthusiasts.",
        isFeatured: true
    },
    {
        id: 2,
        name: "Leather Journal",
        price: 25.50,
        image_url: "https://placehold.co/400x300/3498db/ffffff?text=Leather+Journal",
        description: "Handcrafted leather journal with high-quality, acid-free paper. Ideal for writing and sketching.",
        isFeatured: false
    },
    {
        id: 3,
        name: "Espresso Machine",
        price: 350.00,
        image_url: "https://placehold.co/400x300/2ecc71/ffffff?text=Espresso+Machine",
        description: "Professional-grade espresso machine for the perfect morning brew. Features a milk frother.",
        isFeatured: true
    },
    {
        id: 4,
        name: "Bluetooth Speaker",
        price: 75.00,
        image_url: "https://placehold.co/400x300/f39c12/ffffff?text=Bluetooth+Speaker",
        description: "Portable and powerful Bluetooth speaker with long battery life and crystal-clear sound.",
        isFeatured: false
    },
    {
        id: 5,
        name: "Handmade Ceramic Mug",
        price: 18.00,
        image_url: "https://placehold.co/400x300/9b59b6/ffffff?text=Ceramic+Mug",
        description: "Unique handmade ceramic mug, perfect for your favorite hot beverage. Dishwasher safe.",
        isFeatured: false
    },
    {
        id: 6,
        name: "Wool Scarf",
        price: 45.00,
        image_url: "https://placehold.co/400x300/e67e22/ffffff?text=Wool+Scarf",
        description: "Soft and warm wool scarf, a perfect accessory for the colder months. Available in various colors.",
        isFeatured: true
    },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// DOMContentLoaded event listener to initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    updateCartCount();
    updateAuthNav();

    const currentPage = getCurrentPage();

    // Load products on home or products page
    if (currentPage === 'index.html' || currentPage === 'products.html') {
        loadProducts();
    }

    // Load product detail if on detail page
    if (currentPage === 'product-detail.html') {
        loadProductDetail();
    }

    // Display cart contents
    if (currentPage === 'cart.html') {
        displayCart();
    }

    // Show checkout summary
    if (currentPage === 'checkout.html') {
        displayCheckout();
    }

    // Setup login form
    if (currentPage === 'login.html') {
        setupLogin();
    }

    // Setup register form
    if (currentPage === 'register.html') {
        setupRegister();
    }

    // Handle checkout form submission
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', handleCheckout);
    }

    // === THEME TOGGLE ===
    const themeToggle = document.getElementById('theme-toggle');
    const isDark = localStorage.getItem('theme') === 'dark';

    if (isDark) {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isNowDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
        themeToggle.textContent = isNowDark ? '☀️' : '🌙';
    });

    // === MOBILE MENU ===
    const menuToggle = document.createElement('button');
    menuToggle.textContent = '☰';
    menuToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #555;
    `;

    const nav = document.querySelector('header nav');
    if (nav && menuToggle) {
        nav.insertBefore(menuToggle, nav.firstElementChild);

        const navMenu = document.getElementById('nav-menu') || nav.querySelector('ul');

        function updateMenu() {
            if (window.innerWidth <= 768) {
                menuToggle.style.display = 'block';
            } else {
                menuToggle.style.display = 'none';
                navMenu.style.display = 'flex';
            }
        }

        updateMenu();
        window.addEventListener('resize', updateMenu);

        menuToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});

/**
 * Helper function to get the current page filename.
 * @returns {string} The filename of the current page.
 */
function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

/**
 * Updates the cart item count in the navigation bar.
 */
function updateCartCount() {
    const elements = document.querySelectorAll('.cart-count');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.forEach(el => el.textContent = count);
}

/**
 * Loads products from the hardcoded data and displays them.
 */
function loadProducts() {
    const productsListElement = document.getElementById('products-list');
    const featuredProductsElement = document.getElementById('featured-products');

    // Display all products if on the products page
    if (productsListElement) {
        productsListElement.innerHTML = '';
        products.forEach(product => {
            productsListElement.appendChild(createProductCard(product));
        });
    }

    // Display featured products on the home page
    if (featuredProductsElement) {
        const featuredProducts = products.filter(product => product.isFeatured);
        featuredProductsElement.innerHTML = '';
        featuredProducts.forEach(product => {
            featuredProductsElement.appendChild(createProductCard(product));
        });
    }
}

/**
 * Loads and displays details for a single product.
 */
function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    const productDetailElement = document.getElementById('product-detail');

    if (!productId || !productDetailElement) return;

    const product = products.find(p => p.id === productId);

    if (!product) {
        productDetailElement.innerHTML = '<p class="text-center text-gray-500">Product not found.</p>';
        return;
    }

    productDetailElement.innerHTML = `
        <div class="product-image">
            <img src="${product.image_url}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image+Not+Found';">
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p>${product.description}</p>
            <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, 1)">Add to Cart</button>
        </div>
    `;
}

/**
 * Creates an HTML element for a product card.
 * @param {Object} product - The product object.
 * @returns {HTMLElement} The created product card element.
 */
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=Image+Not+Found';">
        <h3>${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <div class="product-actions">
            <a href="product-detail.html?id=${product.id}" class="btn btn-secondary">View Details</a>
            <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, 1)">Add to Cart</button>
        </div>
    `;
    return productCard;
}

/**
 * Adds a product to the cart.
 * @param {number} id - The product ID.
 * @param {string} name - The product name.
 * @param {number} price - The product price.
 * @param {number} quantity - The quantity to add.
 */
function addToCart(id, name, price, quantity = 1) {
    const item = cart.find(p => p.id === id);
    if (item) {
        item.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showMessage(`${quantity} x ${name} added to cart.`, 'success');
}

/**
 * Displays the items in the shopping cart.
 */
function displayCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (!cartItemsElement || !cartTotalElement) return;

    cartItemsElement.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p class="text-center text-gray-500">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                <button onclick="removeFromCart(${item.id})" class="btn-remove">Remove</button>
            `;
            cartItemsElement.appendChild(itemElement);
            total += item.price * item.quantity;
        });
    }

    cartTotalElement.innerHTML = `Total: $${total.toFixed(2)}`;
}

/**
 * Removes a product from the cart.
 * @param {number} id - The product ID to remove.
 */
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
    showMessage('Item removed from cart.', 'info');
}

/**
 * Displays the order summary on the checkout page.
 */
function displayCheckout() {
    const checkoutItemsElement = document.getElementById('checkout-items');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const checkoutButton = document.getElementById('checkout-btn');

    if (!checkoutItemsElement || !checkoutTotalElement) return;

    checkoutItemsElement.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        checkoutItemsElement.innerHTML = '<p class="text-center text-gray-500">Your cart is empty. Please add items to proceed.</p>';
        if (checkoutButton) checkoutButton.style.display = 'none';
        return;
    } else {
        if (checkoutButton) checkoutButton.style.display = 'block';
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        checkoutItemsElement.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    checkoutTotalElement.innerHTML = `Order Total: $${total.toFixed(2)}`;
}

/**
 * Handles the checkout form submission.
 * @param {Event} e - The form submission event.
 */
async function handleCheckout(e) {
    e.preventDefault();

    if (cart.length === 0) {
        showMessage('Your cart is empty. Please add items to proceed.', 'error');
        return;
    }

    // ✅ Now allows login simulation to work
    if (!currentUser) {
        showMessage('You must be logged in to complete your order.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Simulate successful order
    showMessage('Order placed successfully! Thank you for your purchase.', 'success');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Updates the authentication links in the navigation bar.
 */
function updateAuthNav() {
    const authNav = document.getElementById('auth-nav');
    if (!authNav) return;

    authNav.innerHTML = '';

    if (currentUser) {
        const logoutLi = document.createElement('li');
        const logoutA = document.createElement('a');
        logoutA.href = "#";
        logoutA.textContent = "Logout";
        logoutA.addEventListener('click', logout);
        logoutLi.appendChild(logoutA);
        authNav.appendChild(logoutLi);
    } else {
        const loginLi = document.createElement('li');
        const loginA = document.createElement('a');
        loginA.href = "login.html";
        loginA.textContent = "Login";
        loginLi.appendChild(loginA);
        authNav.appendChild(loginLi);

        const registerLi = document.createElement('li');
        const registerA = document.createElement('a');
        registerA.href = "register.html";
        registerA.textContent = "Register";
        registerLi.appendChild(registerA);
        authNav.appendChild(registerLi);
    }
}

/**
 * Sets up the login form functionality.
 */
function setupLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.email.value;
        const password = this.password.value;

        // ✅ Validation
        if (!email || !password) {
            showMessage('Please enter both email and password.', 'error');
            return;
        }

        // ✅ Simulate successful login
        currentUser = {
            id: 1,
            email: email,
            fullname: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            token: 'fake-jwt-token-' + Date.now()
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthNav();
        showMessage('Login successful!', 'success');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

/**
 * Sets up the registration form functionality.
 */
function setupRegister() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const fullname = this.fullname.value;
        const email = this.email.value;
        const password = this.password.value;
        const confirm = this['confirm-password'].value;

        if (password !== confirm) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        if (!fullname || !email || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        // ✅ Simulate registration success
        showMessage('Registration successful! You can now log in.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

/**
 * Logs out the current user.
 */
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthNav();
    showMessage('You have been logged out.', 'info');
    if (getCurrentPage() === 'checkout.html') {
        setTimeout(() => window.location.href = 'index.html', 500);
    }
}

// --- Message Box Functionality (New) ---
const messageContainer = document.createElement('div');
messageContainer.id = 'message-container';
document.body.appendChild(messageContainer);

/**
 * Displays a message to the user.
 * @param {string} message - The message text.
 * @param {string} type - The message type ('success', 'error', 'info').
 */
function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.innerHTML = `
        <p>${message}</p>
        <button class="close-btn">&times;</button>
    `;
    messageContainer.appendChild(messageBox);

    messageBox.querySelector('.close-btn').addEventListener('click', () => {
        messageBox.remove();
    });

    setTimeout(() => {
        messageBox.remove();
    }, 5000); // Auto-hide after 5 seconds
}

async function handleCheckout(e) {
    e.preventDefault();

    if (cart.length === 0) {
        showMessage('Your cart is empty. Please add items to proceed.', 'error');
        return;
    }

    if (!currentUser) {
        showMessage('You must be logged in to complete your order.', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const shippingInfo = {
        fullname: this.fullname.value,
        address: this.address.value,
        city: this.city.value,
        state: this.state.value,
        zip: this.zip.value,
    };

    const cartItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
    }));

    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`  // ✅ Send JWT
            },
            body: JSON.stringify({ cartItems, shippingInfo })
        });

        const data = await res.json();

        if (res.ok) {
            showMessage('Order placed successfully!', 'success');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            showMessage(data.message || 'Checkout failed.', 'error');
        }
    } catch (err) {
        console.error('Checkout error:', err);
        showMessage('Network error. Check connection or server status.', 'error');
    }
}

/**
 * Sets up the login form functionality.
 */
function setupLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.email.value.trim();
        const password = this.password.value;

        // Validate input
        if (!email || !password) {
            showMessage('Please enter both email and password.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // ✅ Login successful
                currentUser = {
                    id: data.user.id,
                    fullname: data.user.fullname,
                    email: data.user.email,
                    token: data.token  // Save JWT token
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateAuthNav();
                showMessage('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // ❌ Login failed
                showMessage(data.message || 'Invalid email or password.', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            showMessage('Could not connect to server. Is Node.js running?', 'error');
        }
    });
}