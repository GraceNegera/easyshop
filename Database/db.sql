-- ------ shopeasy.sql ----------
CREATE DATABASE IF NOT EXISTS shopeasy;
USE shopeasy;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'shipped', 'cancelled') DEFAULT 'pending',
    shipping_address JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO products (name, description, price, is_featured, image_url) VALUES
('Vintage Camera', 'A classic vintage camera with modern features.', 349.99, TRUE, 'https://placehold.co/400x400/81c784/ffffff?text=Vintage+Camera'),
('Leather Backpack', 'A durable and stylish leather backpack.', 89.50, TRUE, 'https://placehold.co/400x400/64b5f6/ffffff?text=Leather+Backpack'),
('Bluetooth Speaker', 'Portable waterproof bluetooth speaker.', 45.00, FALSE, 'https://placehold.co/400x400/ffb74d/ffffff?text=Bluetooth+Speaker'),
('Smartwatch Pro', 'Advanced smartwatch with health tracking.', 199.99, FALSE, 'https://placehold.co/400x400/e57373/ffffff?text=Smartwatch+Pro');


INSERT INTO products (name, description, price, is_featured, image_url) VALUES
('Vintage Camera', 'A classic vintage camera with modern features.', 349.99, TRUE, 'https://placehold.co/400x400/81c784/ffffff?text=Vintage+Camera'),
('Leather Backpack', 'A durable and stylish leather backpack.', 89.50, TRUE, 'https://placehold.co/400x400/64b5f6/ffffff?text=Leather+Backpack'),
('Bluetooth Speaker', 'Portable waterproof bluetooth speaker.', 45.00, FALSE, 'https://placehold.co/400x400/ffb74d/ffffff?text=Bluetooth+Speaker'),
('Smartwatch Pro', 'Advanced smartwatch with health tracking.', 199.99, FALSE, 'https://placehold.co/400x400/e57373/ffffff?text=Smartwatch+Pro');