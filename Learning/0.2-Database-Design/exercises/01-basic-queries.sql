-- 🏋️ Exercise 1: Basic SQL Queries
-- Learn fundamental SELECT, INSERT, UPDATE, DELETE operations
-- Start here after running schema.sql and sample-data.sql

-- =============================================================================
-- PART A: SELECT QUERIES (Reading Data)
-- =============================================================================

-- Exercise 1.1: Simple SELECT
-- Goal: Get familiar with basic data retrieval
-- TODO: Write a query to select all users

-- SOLUTION:
-- SELECT * FROM users;

-- Exercise 1.2: Specific Columns
-- Goal: Learn to select only needed columns (better performance)
-- TODO: Select only first_name, last_name, and email from users

-- SOLUTION:
-- SELECT first_name, last_name, email FROM users;

-- Exercise 1.3: WHERE Clause
-- Goal: Filter data based on conditions
-- TODO: Find all products with price less than $5

-- SOLUTION:
-- SELECT name, price FROM products WHERE price < 5.00;

-- Exercise 1.4: Multiple Conditions
-- Goal: Combine conditions with AND/OR
-- TODO: Find products that are active AND have stock_quantity > 50

-- SOLUTION:
-- SELECT name, stock_quantity, is_active 
-- FROM products 
-- WHERE is_active = true AND stock_quantity > 50;

-- Exercise 1.5: Pattern Matching
-- Goal: Use LIKE for text searches
-- TODO: Find all products with 'Ramen' in the name

-- SOLUTION:
-- SELECT name, description FROM products WHERE name LIKE '%Ramen%';

-- Exercise 1.6: Ordering Results
-- Goal: Sort data for better readability
-- TODO: Get all products ordered by price (highest first)

-- SOLUTION:
-- SELECT name, price FROM products ORDER BY price DESC;

-- Exercise 1.7: Limiting Results
-- Goal: Get only a specific number of results
-- TODO: Get the 5 most expensive products

-- SOLUTION:
-- SELECT name, price FROM products ORDER BY price DESC LIMIT 5;

-- =============================================================================
-- PART B: INSERT QUERIES (Creating Data)
-- =============================================================================

-- Exercise 1.8: Simple INSERT
-- Goal: Add new data to tables
-- TODO: Add a new category for 'Desserts'

-- SOLUTION:
-- INSERT INTO categories (name, description, slug) 
-- VALUES ('Desserts', 'Sweet treats to end your meal', 'desserts');

-- Exercise 1.9: INSERT with SELECT
-- Goal: Copy data between tables or generate data
-- TODO: Add yourself as a new user

-- SOLUTION:
-- INSERT INTO users (email, password_hash, first_name, last_name, phone)
-- VALUES ('your.email@example.com', '$2b$12$dummy.hash', 'Your', 'Name', '555-0000');

-- =============================================================================
-- PART C: UPDATE QUERIES (Modifying Data)
-- =============================================================================

-- Exercise 1.10: Simple UPDATE
-- Goal: Modify existing data
-- TODO: Update the stock quantity of 'Shoyu Instant Ramen' to 150

-- SOLUTION:
-- UPDATE products 
-- SET stock_quantity = 150 
-- WHERE name = 'Shoyu Instant Ramen';

-- Exercise 1.11: UPDATE with Conditions
-- Goal: Update multiple records based on criteria
-- TODO: Increase all instant ramen prices by 10% (multiply by 1.1)

-- SOLUTION:
-- UPDATE products 
-- SET price = price * 1.1 
-- WHERE category_id = (SELECT id FROM categories WHERE name = 'Instant Ramen');

-- Exercise 1.12: UPDATE with JOIN (Advanced)
-- Goal: Update based on related table data
-- TODO: Mark all products in the 'Snacks' category as inactive

-- SOLUTION:
-- UPDATE products 
-- SET is_active = false 
-- WHERE category_id = (SELECT id FROM categories WHERE name = 'Snacks');

-- =============================================================================
-- PART D: DELETE QUERIES (Removing Data)
-- =============================================================================

-- Exercise 1.13: Simple DELETE
-- Goal: Remove specific records
-- TODO: Delete any reviews with rating = 1 (if any exist)

-- SOLUTION:
-- DELETE FROM reviews WHERE rating = 1;

-- Exercise 1.14: DELETE with JOIN
-- Goal: Delete based on related table conditions
-- TODO: Delete all cart items for products that are inactive

-- SOLUTION:
-- DELETE FROM cart_items 
-- WHERE product_id IN (SELECT id FROM products WHERE is_active = false);

-- =============================================================================
-- PART E: AGGREGATION FUNCTIONS
-- =============================================================================

-- Exercise 1.15: COUNT
-- Goal: Count records
-- TODO: How many products do we have in total?

-- SOLUTION:
-- SELECT COUNT(*) as total_products FROM products;

-- Exercise 1.16: COUNT with conditions
-- Goal: Count with filters
-- TODO: How many products are currently active?

-- SOLUTION:
-- SELECT COUNT(*) as active_products FROM products WHERE is_active = true;

-- Exercise 1.17: SUM
-- Goal: Calculate totals
-- TODO: What's the total value of all products in stock? (price * stock_quantity)

-- SOLUTION:
-- SELECT SUM(price * stock_quantity) as total_inventory_value FROM products;

-- Exercise 1.18: AVG
-- Goal: Calculate averages
-- TODO: What's the average price of all products?

-- SOLUTION:
-- SELECT AVG(price) as average_price FROM products;

-- Exercise 1.19: MIN and MAX
-- Goal: Find extreme values
-- TODO: What are the cheapest and most expensive products?

-- SOLUTION:
-- SELECT MIN(price) as cheapest, MAX(price) as most_expensive FROM products;

-- Exercise 1.20: GROUP BY
-- Goal: Aggregate data by categories
-- TODO: Count how many products are in each category

-- SOLUTION:
-- SELECT c.name as category, COUNT(p.id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id
-- GROUP BY c.id, c.name
-- ORDER BY product_count DESC;

-- =============================================================================
-- CHALLENGE EXERCISES
-- =============================================================================

-- Challenge 1: Complex Filtering
-- Find all users who have placed orders totaling more than $30
-- Hint: You'll need to use GROUP BY and HAVING

-- Challenge 2: Text Search
-- Find all products that contain either 'miso' or 'shoyu' in their name or description
-- Hint: Use ILIKE for case-insensitive search

-- Challenge 3: Date Ranges
-- Find all orders placed in the last 30 days
-- Hint: Use CURRENT_DATE and interval arithmetic

-- Challenge 4: Top Products
-- Find the top 3 products by average rating
-- Hint: JOIN with reviews table and use LIMIT

-- =============================================================================
-- COMPARISON TO JAVASCRIPT
-- =============================================================================

-- 💡 SQL vs JavaScript Equivalents:

-- SQL: SELECT name FROM products WHERE price < 5;
-- JS:  products.filter(p => p.price < 5).map(p => p.name)

-- SQL: SELECT COUNT(*) FROM products;
-- JS:  products.length

-- SQL: SELECT AVG(price) FROM products;
-- JS:  products.reduce((sum, p) => sum + p.price, 0) / products.length

-- SQL: SELECT * FROM products ORDER BY price DESC;
-- JS:  products.sort((a, b) => b.price - a.price)

-- SQL: SELECT * FROM products LIMIT 5;
-- JS:  products.slice(0, 5)

-- =============================================================================
-- READY FOR NEXT LEVEL?
-- =============================================================================

-- ✅ If you completed these exercises, you're ready for:
-- - 02-joins-relations.sql (Learn to connect tables)
-- - Complex multi-table queries
-- - Understanding foreign key relationships

-- 🎯 Key Concepts Mastered:
-- - Basic CRUD operations (Create, Read, Update, Delete)
-- - Data filtering with WHERE
-- - Sorting and limiting results
-- - Aggregation functions (COUNT, SUM, AVG, etc.)
-- - Grouping data for analysis

-- 🚀 This foundation will make your API endpoints much more powerful! 