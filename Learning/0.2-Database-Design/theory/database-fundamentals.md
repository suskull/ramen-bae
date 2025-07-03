# 📚 Database Theory Fundamentals

**Learning Time**: ⏱️ 45 minutes  
**Difficulty**: ⭐⭐⭐ (Core concepts)

---

## 🎯 What You'll Learn

- **Database Normalization** (1NF, 2NF, 3NF) with real examples
- **Primary and Foreign Keys** and why they matter
- **Entity Relationships** (One-to-One, One-to-Many, Many-to-Many)
- **Referential Integrity** and data consistency
- **Why proper design prevents problems** in real applications

---

## 🏗️ What is Database Design?

**Think of it like organizing a library:**
- **Bad design**: Throw all books in one giant pile
- **Good design**: Organize by genre, author, with a catalog system

**Database design** is creating a structure that:
- ✅ Eliminates data duplication
- ✅ Ensures data consistency
- ✅ Makes queries efficient
- ✅ Scales with your application

---

## 🔑 Keys: The Foundation of Relationships

### Primary Key
**Definition**: A unique identifier for each row in a table.

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- ← Primary Key: Unique for each user
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100)
);
```

**Rules:**
- ✅ **Unique**: No two rows can have the same primary key
- ✅ **Not NULL**: Must always have a value
- ✅ **Immutable**: Should never change once assigned

### Foreign Key
**Definition**: A field that links to the primary key of another table.

```sql
-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),  -- ← Foreign Key: Links to users table
    total_amount DECIMAL(10,2)
);
```

**Think of foreign keys like references:**
- JavaScript: `{ userId: 123, total: 25.99 }` 
- SQL: `user_id` column points to the `users` table

---

## 🔗 Entity Relationships

### 1. One-to-Many (Most Common)
**Example**: One user can have many orders, but each order belongs to one user.

```
USER (1) ────────── (Many) ORDERS
   |                        |
   └─ id: 1                └─ user_id: 1
      name: "John"            total: $25.99
                             
                            └─ user_id: 1  
                               total: $45.50
```

**In Tables:**
```sql
-- One user
users: { id: 1, name: "John" }

-- Many orders for that user
orders: { id: 1, user_id: 1, total: 25.99 }
orders: { id: 2, user_id: 1, total: 45.50 }
```

### 2. Many-to-Many (Requires Junction Table)
**Example**: Products can be in many orders, orders can have many products.

```
PRODUCTS ────── ORDER_ITEMS ────── ORDERS
    |               |                 |
 id: 1         product_id: 1      id: 1
 name: "Ramen"  order_id: 1      user_id: 1
                quantity: 2       total: $25.99
```

**Junction Table Pattern:**
```sql
-- Products table
products: { id: 1, name: "Tonkotsu Ramen", price: 12.99 }

-- Orders table  
orders: { id: 1, user_id: 1, total: 25.99 }

-- Junction table connects them
order_items: { 
    order_id: 1,      -- References orders table
    product_id: 1,    -- References products table
    quantity: 2,      -- Additional data about the relationship
    price_at_time: 12.99
}
```

### 3. One-to-One (Rare)
**Example**: User profile details that could be in the main users table.

```
USERS (1) ────────── (1) USER_PROFILES
   |                        |
   └─ id: 1                └─ user_id: 1
      email: "john@..."       bio: "I love ramen!"
```

---

## 📐 Database Normalization

**Goal**: Organize data to reduce redundancy and improve integrity.

### ❌ Unnormalized Data (The Problem)

```sql
-- BAD: Everything in one table
CREATE TABLE orders_bad (
    order_id INTEGER,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    product_name VARCHAR(255),
    product_price DECIMAL(10,2),
    quantity INTEGER
);

-- Sample data showing the problems:
INSERT INTO orders_bad VALUES 
(1, 'John Doe', 'john@example.com', '555-0101', 'Tonkotsu Ramen', 12.99, 2),
(1, 'John Doe', 'john@example.com', '555-0101', 'Miso Ramen', 11.99, 1),
(2, 'John Doe', 'john@example.com', '555-0101', 'Shoyu Ramen', 10.99, 1);
```

**Problems:**
1. **Data Duplication**: John's info repeated 3 times
2. **Update Anomaly**: If John changes email, must update 3 rows
3. **Storage Waste**: Same customer data stored multiple times
4. **Inconsistency Risk**: What if John's email differs across rows?

### ✅ 1st Normal Form (1NF): Atomic Values

**Rule**: Each cell contains only one value (no arrays or lists).

```sql
-- ❌ Violates 1NF: Multiple products in one cell
orders_bad: { id: 1, products: "Ramen, Noodles, Broth" }

-- ✅ Follows 1NF: One product per row
order_items: { order_id: 1, product_id: 1 }
order_items: { order_id: 1, product_id: 2 }
order_items: { order_id: 1, product_id: 3 }
```

### ✅ 2nd Normal Form (2NF): No Partial Dependencies

**Rule**: All non-key columns must depend on the ENTIRE primary key.

```sql
-- ❌ Violates 2NF: product_name depends only on product_id, not the full key
CREATE TABLE order_items_bad (
    order_id INTEGER,
    product_id INTEGER,
    product_name VARCHAR(255),  -- ← Depends only on product_id
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);

-- ✅ Follows 2NF: Move product info to separate table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price_at_time DECIMAL(10,2),  -- ← Depends on full key
    PRIMARY KEY (order_id, product_id)
);
```

### ✅ 3rd Normal Form (3NF): No Transitive Dependencies

**Rule**: Non-key columns should not depend on other non-key columns.

```sql
-- ❌ Violates 3NF: category_name depends on category_id, not product_id
CREATE TABLE products_bad (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category_id INTEGER,
    category_name VARCHAR(100)  -- ← Depends on category_id, not id
);

-- ✅ Follows 3NF: Separate categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category_id INTEGER REFERENCES categories(id)
);
```

---

## 🎯 Real-World Example: E-commerce Normalization

### Before: Unnormalized Mess
```sql
-- All data in one giant table
orders_nightmare (
    order_id, order_date, customer_name, customer_email, customer_address,
    product_name, product_category, product_price, quantity, 
    shipping_method, shipping_cost, payment_method
);
```

### After: Properly Normalized
```sql
-- Separate, related tables
users (id, email, first_name, last_name, address)
categories (id, name)
products (id, name, category_id, price)
orders (id, user_id, order_date, shipping_method, total_amount)
order_items (order_id, product_id, quantity, price_at_time)
```

**Benefits:**
- ✅ Customer info stored once
- ✅ Product changes affect all orders automatically
- ✅ Easy to add new products/customers
- ✅ No duplicate or inconsistent data

---

## 🔒 Referential Integrity

**Definition**: Foreign keys must always point to valid primary keys.

```sql
-- This will FAIL if user_id = 999 doesn't exist in users table
INSERT INTO orders (user_id, total_amount) VALUES (999, 25.99);
-- ERROR: violates foreign key constraint
```

**Database automatically prevents:**
- ❌ Orphaned records (orders without valid customers)
- ❌ Invalid references (products that don't exist)
- ❌ Accidentally deleting referenced data

---

## 🧠 JavaScript vs SQL: Mental Model

### JavaScript Approach (Frontend)
```javascript
// Separate arrays, manual relationships
const users = [
  { id: 1, name: "John", email: "john@example.com" }
];

const orders = [
  { id: 1, userId: 1, total: 25.99 },
  { id: 2, userId: 1, total: 45.50 }
];

// Manual joining
const userWithOrders = {
  ...users.find(u => u.id === 1),
  orders: orders.filter(o => o.userId === 1)
};
```

### SQL Approach (Database)
```sql
-- Automatic relationship handling
SELECT 
    u.name,
    u.email,
    o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.id = 1;
```

**Key Difference**: Database enforces relationships and joins automatically!

---

## 🎯 Design Principles Summary

### ✅ DO
- **Use primary keys** for every table
- **Normalize data** to eliminate duplication
- **Define relationships** with foreign keys
- **Think about queries** you'll need to write
- **Plan for scale** - will this work with 1M records?

### ❌ DON'T
- **Store arrays/lists** in single columns
- **Duplicate data** across tables
- **Create tables** without clear relationships
- **Ignore foreign key constraints**
- **Design without understanding** your data access patterns

---

## 🚀 Next Steps

Now that you understand the theory, let's see it in action! 

**Coming up:**
1. **Examine our e-commerce schema** and see normalization in practice
2. **Practice designing relationships** for different scenarios
3. **Write queries** that leverage these relationships
4. **Understand performance implications** of good design

Ready to see these concepts in our actual ramen shop database? Let's look at how we applied these principles in our schema design! 🍜

---

## 🤔 Quick Self-Check

**Can you answer these?**
1. Why can't you store multiple product IDs in one order field?
2. What's the difference between a primary and foreign key?
3. Why do we need a separate `order_items` table instead of putting products directly in `orders`?
4. How does normalization prevent data inconsistency?

If you can answer these, you're ready for the practical application! 🎯 