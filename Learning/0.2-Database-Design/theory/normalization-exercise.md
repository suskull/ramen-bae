# 🧩 Normalization Practice Exercise

**Learning Time**: ⏱️ 20 minutes  
**Goal**: Apply normalization principles to fix a badly designed database

---

## 🎯 The Challenge: Fix This Mess!

You've been hired to fix a terrible database design for a small ramen restaurant. The previous developer put everything in one giant table. Your job is to normalize it properly.

### 📋 The Bad Database (Unnormalized)

```sql
-- 😱 This is the nightmare you inherited
CREATE TABLE restaurant_data (
    record_id SERIAL,
    order_date DATE,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    product_name VARCHAR(255),
    product_category VARCHAR(100),
    product_price DECIMAL(10,2),
    quantity INTEGER,
    line_total DECIMAL(10,2),
    order_total DECIMAL(10,2),
    server_name VARCHAR(100),
    table_number INTEGER
);
```

### 📊 Sample Data (The Problems)

```sql
INSERT INTO restaurant_data VALUES
(1, '2025-01-20', 'John Doe', 'john@email.com', '555-0101', 'Tonkotsu Ramen', 'Ramen', 12.99, 1, 12.99, 25.98, 'Alice', 5),
(2, '2025-01-20', 'John Doe', 'john@email.com', '555-0101', 'Gyoza', 'Appetizer', 6.99, 2, 13.98, 25.98, 'Alice', 5),
(3, '2025-01-20', 'Jane Smith', 'jane@email.com', '555-0102', 'Miso Ramen', 'Ramen', 11.99, 1, 11.99, 11.99, 'Bob', 3),
(4, '2025-01-21', 'John Doe', 'john@email.com', '555-0101', 'Shoyu Ramen', 'Ramen', 10.99, 1, 10.99, 10.99, 'Alice', 7);
```

---

## 🔍 Problems Analysis

**Can you spot these issues?**

1. **Data Duplication**: John's info repeated multiple times
2. **Update Anomalies**: If John changes his phone, how many rows to update?
3. **Insertion Anomalies**: Can't add a new product without an order
4. **Deletion Anomalies**: Delete John's orders = lose product info
5. **Storage Waste**: Same customer data stored repeatedly
6. **Inconsistency Risk**: What if John's email is different in row 4?

---

## 💡 Your Mission: Normalize This Database!

### Step 1: Identify Entities

**What are the main "things" in this system?**
- Customers
- Products  
- Orders
- Servers (staff)
- Tables (restaurant seating)

### Step 2: Design Normalized Tables

**Your turn!** Design the proper table structure. Consider:
- What should be the primary keys?
- What relationships exist between entities?
- How do you handle the many-to-many relationship between orders and products?

---

## ✅ Solution: Properly Normalized Schema

<details>
<summary>🔧 Click to see the solution (try it yourself first!)</summary>

### Normalized Tables

```sql
-- 1. Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20)
);

-- 2. Product categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 3. Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL
);

-- 4. Restaurant staff
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 5. Restaurant tables
CREATE TABLE restaurant_tables (
    number INTEGER PRIMARY KEY,
    capacity INTEGER
);

-- 6. Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    server_id INTEGER REFERENCES servers(id),
    table_number INTEGER REFERENCES restaurant_tables(number),
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL
);

-- 7. Order items (junction table)
CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
```

### Sample Data (Normalized)

```sql
-- Insert reference data
INSERT INTO categories (name) VALUES ('Ramen'), ('Appetizer');
INSERT INTO servers (name) VALUES ('Alice'), ('Bob');
INSERT INTO restaurant_tables (number, capacity) VALUES (3, 4), (5, 2), (7, 6);

-- Insert customers (no duplication!)
INSERT INTO customers (name, email, phone) VALUES 
('John Doe', 'john@email.com', '555-0101'),
('Jane Smith', 'jane@email.com', '555-0102');

-- Insert products
INSERT INTO products (name, category_id, price) VALUES 
('Tonkotsu Ramen', 1, 12.99),
('Miso Ramen', 1, 11.99),
('Shoyu Ramen', 1, 10.99),
('Gyoza', 2, 6.99);

-- Insert orders
INSERT INTO orders (customer_id, server_id, table_number, order_date, total_amount) VALUES 
(1, 1, 5, '2025-01-20', 25.98),  -- John's first order
(2, 2, 3, '2025-01-20', 11.99),  -- Jane's order
(1, 1, 7, '2025-01-21', 10.99);  -- John's second order

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES 
(1, 1, 1, 12.99),  -- John ordered 1 Tonkotsu Ramen
(1, 4, 2, 6.99),   -- John ordered 2 Gyoza
(2, 2, 1, 11.99),  -- Jane ordered 1 Miso Ramen
(3, 3, 1, 10.99);  -- John ordered 1 Shoyu Ramen
```

</details>

---

## 🎯 Benefits of Normalization

### Before (Unnormalized)
- **4 rows** for 3 orders
- **Repeated customer data** in every row
- **Update nightmare** if customer changes info
- **Wasted storage** space

### After (Normalized)
- **2 customers**, **4 products**, **3 orders**, **4 order items**
- **Customer data stored once**
- **Easy updates** - change John's phone in one place
- **Referential integrity** - can't create invalid orders

---

## 🧪 Test Your Understanding

Try writing these queries on the normalized data:

```sql
-- 1. Get all orders for John Doe
SELECT 
    o.id,
    o.order_date,
    o.total_amount
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE c.name = 'John Doe';

-- 2. Get detailed order information (customer, items, server)
SELECT 
    c.name as customer,
    p.name as product,
    oi.quantity,
    s.name as server,
    o.order_date
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN servers s ON o.server_id = s.id;

-- 3. Calculate total sales by product category
SELECT 
    cat.name as category,
    SUM(oi.quantity * oi.price_at_time) as total_sales
FROM categories cat
JOIN products p ON cat.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
GROUP BY cat.id, cat.name;
```

---

## 🚀 Key Takeaways

1. **Normalization eliminates redundancy** and prevents data problems
2. **Foreign keys enforce relationships** and maintain data integrity
3. **Junction tables handle many-to-many** relationships elegantly
4. **Proper design makes queries more powerful** and maintenance easier

**You've just turned a data nightmare into a clean, efficient database!** 🎉

Ready to see how these principles apply to our ramen shop e-commerce database? 🍜

---

## 🤔 Bonus Challenge

**Design a database for a movie streaming service** with:
- Users who can have multiple subscription plans
- Movies that belong to multiple genres
- User ratings and reviews
- Watch history with timestamps

How would you normalize this? What tables would you create? 🎬 