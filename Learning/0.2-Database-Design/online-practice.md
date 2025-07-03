# 🌐 Online SQL Practice Guide

Since Docker isn't available, let's use online SQL tools to practice with our e-commerce schema!

## 🚀 **Quick Start: DB Fiddle (Recommended)**

### Step 1: Open DB Fiddle
Go to **[https://www.db-fiddle.com/](https://www.db-fiddle.com/)**

### Step 2: Select PostgreSQL
- Choose **PostgreSQL** from the database dropdown
- Select the latest version available

### Step 3: Set Up Schema
Copy and paste our schema from `schemas/schema.sql` into the left panel (Schema SQL).

### Step 4: Add Sample Data  
Copy and paste our sample data from `schemas/sample-data.sql` into the same left panel, after the schema.

### Step 5: Practice Queries
Use the right panel (Query SQL) to practice exercises from `exercises/01-basic-queries.sql`.

---

## 🏗️ **Complete Setup Instructions**

### **Copy This Complete Setup** (All-in-One)

```sql
-- =============================================================================
-- COMPLETE E-COMMERCE LEARNING SCHEMA + DATA
-- Copy this entire block into DB Fiddle Schema SQL panel
-- =============================================================================

-- Drop tables if they exist (for clean reset)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS TABLE
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS TABLE
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER_ITEMS TABLE  
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, product_id)
);

-- CART_ITEMS TABLE
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- REVIEWS TABLE
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- SAMPLE DATA

-- Users
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('john.doe@example.com', '$2b$12$dummy', 'John', 'Doe', '555-0101'),
('jane.smith@example.com', '$2b$12$dummy', 'Jane', 'Smith', '555-0102'),
('alice.johnson@example.com', '$2b$12$dummy', 'Alice', 'Johnson', '555-0103'),
('bob.wilson@example.com', '$2b$12$dummy', 'Bob', 'Wilson', '555-0104'),
('carol.davis@example.com', '$2b$12$dummy', 'Carol', 'Davis', '555-0105');

-- Categories
INSERT INTO categories (name, description, slug) VALUES
('Instant Ramen', 'Quick and delicious instant ramen noodles', 'instant-ramen'),
('Fresh Ramen', 'Premium fresh ramen with authentic broth', 'fresh-ramen'),
('Toppings', 'Delicious toppings to enhance your ramen', 'toppings'),
('Beverages', 'Drinks that pair perfectly with ramen', 'beverages'),
('Snacks', 'Japanese snacks and sides', 'snacks');

-- Products (Sample)
INSERT INTO products (name, description, price, stock_quantity, sku, category_id, image_url, is_active) VALUES
('Shoyu Instant Ramen', 'Classic soy sauce based instant ramen', 3.99, 100, 'IR-SHOYU-001', 1, '/images/shoyu-instant.jpg', true),
('Miso Instant Ramen', 'Hearty miso-based instant ramen', 4.49, 85, 'IR-MISO-001', 1, '/images/miso-instant.jpg', true),
('Premium Shoyu Ramen', 'Authentic shoyu ramen with handmade noodles', 14.99, 25, 'FR-SHOYU-001', 2, '/images/fresh-shoyu.jpg', true),
('Chashu Pork Slices', 'Tender braised pork belly slices', 5.99, 50, 'TOP-CHAS-001', 3, '/images/chashu.jpg', true),
('Japanese Green Tea', 'Premium sencha green tea', 2.99, 120, 'BEV-TEA-001', 4, '/images/green-tea.jpg', true),
('Gyoza (6pc)', 'Pan-fried pork and vegetable dumplings', 7.99, 40, 'SNK-GYOZA-006', 5, '/images/gyoza.jpg', true);

-- Orders
INSERT INTO orders (user_id, total_amount, status, shipping_address, billing_address) VALUES
(1, 23.97, 'delivered', '123 Main St, Anytown, ST 12345', '123 Main St, Anytown, ST 12345'),
(2, 45.96, 'shipped', '456 Oak Ave, Springfield, ST 67890', '456 Oak Ave, Springfield, ST 67890');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES
(1, 1, 2, 3.99),
(1, 4, 1, 5.99),
(2, 3, 1, 14.99),
(2, 5, 2, 2.99);

-- Reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(1, 1, 5, 'Amazing flavor! Just like the ramen shops in Japan.'),
(2, 3, 5, 'Absolutely incredible! The handmade noodles make all the difference.'),
(1, 4, 5, 'Perfect chashu! Tender, flavorful, and exactly what ramen needs.');
```

---

## 🏋️ **Practice Exercises to Try**

### **Start with These Simple Queries:**

```sql
-- 1. See all our data
SELECT * FROM users;
SELECT * FROM categories;  
SELECT * FROM products;

-- 2. Filter and sort
SELECT name, price FROM products WHERE price < 10 ORDER BY price;

-- 3. Count products by category
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;

-- 4. User order history
SELECT u.first_name, u.last_name, o.total_amount, o.status
FROM users u
JOIN orders o ON u.id = o.user_id
ORDER BY o.created_at DESC;

-- 5. Products with reviews
SELECT p.name, r.rating, r.comment
FROM products p
JOIN reviews r ON p.id = r.product_id
ORDER BY r.rating DESC;
```

---

## 🔧 **Alternative Online Tools**

### **Option 2: SQLiteOnline**
- Go to [https://sqliteonline.com/](https://sqliteonline.com/)
- Click "PostgreSQL" tab
- Paste our schema and data
- Practice queries

### **Option 3: W3Schools SQL Tryit**
- Go to [https://www.w3schools.com/sql/trysql.asp](https://www.w3schools.com/sql/trysql.asp)
- Basic SQL practice with pre-loaded data
- Good for learning concepts before using our schema

### **Option 4: SQLBolt (Interactive Tutorial)**
- Go to [https://sqlbolt.com/](https://sqlbolt.com/)
- Step-by-step interactive SQL lessons
- Great for understanding concepts

---

## 📚 **Learning Path**

### **Beginner (Start Here)**
1. **Set up DB Fiddle** with our schema
2. **Try basic SELECT queries** 
3. **Practice filtering with WHERE**
4. **Learn sorting with ORDER BY**

### **Intermediate**
1. **Master JOINs** (connect tables)
2. **Use GROUP BY** for aggregation
3. **Practice subqueries**
4. **Understand indexes and performance**

### **Advanced**
1. **Complex multi-table queries**
2. **Window functions**
3. **Common Table Expressions (CTEs)**
4. **Query optimization**

---

## 🎯 **Today's Goals**

- [ ] Set up DB Fiddle with our e-commerce schema
- [ ] Run 10 basic SELECT queries successfully
- [ ] Understand the relationship between tables
- [ ] Compare SQL operations to JavaScript equivalents
- [ ] Feel confident with basic CRUD operations

---

## 🚀 **Ready to Practice?**

1. **Open [DB Fiddle](https://www.db-fiddle.com/)**
2. **Copy our complete schema** (from above)
3. **Try the practice exercises**
4. **Experiment with your own queries**

The hands-on practice will make everything click! Once you're comfortable with basic queries, we'll move on to **JOINs and relationships** - the real power of databases! 🗄️ 