// server.js (my backend)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load env't var from .env file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3434;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// middle ware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder(based on my project)
app.use(express.static(path.join(__dirname, 'public')));

// db connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// middleware to protectroutes with jwt
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); //-->  (if there isn't any token)

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// test DB connection in startup
(async () => {
    try {
        await db.query('SELECT 1');
        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please check your .env file and ensure MySQL is running.');
    }
})();


// Get my all product
app.get('/api/products', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM products');
        res.json(results);
    } catch (err) {
        console.error('Database error fetching products:', err);
        ///// Fall back with mock data if my db fails
        const mockProducts = [
            { id: 1, name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones with long battery life.', price: 99.99, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Headphones', is_featured: true },
            { id: 2, name: 'Smartwatch', description: 'Fitness tracker with heart rate monitor and GPS.', price: 199.50, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Smartwatch', is_featured: true },
            { id: 3, name: 'Portable Speaker', description: 'Waterproof Bluetooth speaker with powerful bass.', price: 49.99, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Speaker', is_featured: false },
            { id: 4, name: 'Ergonomic Chair', description: 'Adjustable office chair for maximum comfort.', price: 250.00, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Chair', is_featured: false },
            { id: 5, name: 'Mechanical Keyboard', description: 'RGB backlit keyboard with tactile switches.', price: 120.00, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Keyboard', is_featured: false },
        ];
        res.status(500).json(mockProducts);
    }
});

// Get products featured  for my home page
app.get('/api/products/featured', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM products WHERE is_featured = true');
        res.json(results);
    } catch (err) {
        console.error('Database error fetching featured products:', err);
        // Fall back with mock data for featured products
        const mockProducts = [
            { id: 1, name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones with long battery life.', price: 99.99, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Headphones', is_featured: true },
            { id: 2, name: 'Smartwatch', description: 'Fitness tracker with heart rate monitor and GPS.', price: 199.50, image_url: 'https://placehold.co/400x300/e2e8f0/718096?text=Smartwatch', is_featured: true }
        ];
        res.status(500).json(mockProducts);
    }
});

/////// Get product by it;s ID//////
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error('Database error fetching product by ID:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

///////////// Register new user //////
app.post('/api/register', async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)',
            [fullname, email, password_hash]
        );
        res.json({ userId: result.insertId, message: 'Registration successful' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'Email already exists' });
        } else {
            console.error('Registration error:', err);
            res.status(500).json({ message: 'Registration failed' });
        }
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', user: { id: user.id, fullname: user.fullname, email: user.email }, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

////////////// Checkout process (with protected route)////////
app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { cartItems, shippingInfo } = req.body;
    const userId = req.user.userId;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingAddress = JSON.stringify(shippingInfo);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)',
            [userId, total, shippingAddress]
        );
        const orderId = orderResult.insertId;

        const itemQueries = cartItems.map(item =>
            connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price]
            )
        );

        await Promise.all(itemQueries);

        await connection.commit();
        res.json({ message: 'Order placed successfully!', orderId });

    } catch (err) {
        await connection.rollback();
        console.error('Checkout error:', err);
        res.status(500).json({ message: 'Checkout failed' });
    } finally {
        connection.release();
    }
});

//////// SPA Fall back: Serve index.html for all undefined routes ////
app.get(/^(?!.*\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//the end///