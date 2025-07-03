-- 🔗 Exercise 2: JOINs and Table Relationships
-- Master the art of connecting data across multiple tables
-- This is where SQL becomes truly powerful!

-- =============================================================================
-- UNDERSTANDING JOINS: The Bridge Between Tables
-- =============================================================================

-- 💡 Think of JOINs like this:
-- JavaScript: You have separate arrays and need to combine them
-- SQL: You have separate tables and need to connect them

-- Example in JavaScript (what you might do in frontend):
-- const users = [{id: 1, name: 'John'}, {id: 2, name: 'Jane'}];
-- const orders = [{id: 1, userId: 1, total: 25.99}, {id: 2, userId: 2, total: 45.96}];
-- 
-- // Combining in JavaScript:
-- const usersWithOrders = users.map(user => ({
--   ...user,
--   orders: orders.filter(order => order.userId === user.id)
-- }));

-- SQL equivalent: JOIN operations connect tables automatically!

-- =============================================================================
-- PART A: INNER JOIN - "Show me only matching records"
-- =============================================================================

-- Exercise 2.1: Basic INNER JOIN
-- Goal: Connect products with their categories
-- TODO: Show product names with their category names

-- SOLUTION:
-- SELECT p.name as product_name, c.name as category_name
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id;

-- Exercise 2.2: INNER JOIN with filtering
-- Goal: Show only instant ramen products with their category
-- TODO: Filter for products in the 'Instant Ramen' category

-- SOLUTION:
-- SELECT p.name as product_name, p.price, c.name as category_name
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- WHERE c.name = 'Instant Ramen';

-- Exercise 2.3: INNER JOIN with multiple conditions
-- Goal: Show active products under $10 with categories
-- TODO: Add conditions for is_active = true AND price < 10

-- SOLUTION:
-- SELECT p.name, p.price, c.name as category, p.stock_quantity
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- WHERE p.is_active = true AND p.price < 10.00
-- ORDER BY p.price;

-- =============================================================================
-- PART B: LEFT JOIN - "Show me everything from the left table"
-- =============================================================================

-- Exercise 2.4: LEFT JOIN to show all categories
-- Goal: Show all categories, even if they have no products
-- TODO: List all categories with their product count (including 0)

-- SOLUTION:
-- SELECT c.name as category_name, COUNT(p.id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id
-- GROUP BY c.id, c.name
-- ORDER BY product_count DESC;

-- Exercise 2.5: LEFT JOIN to find empty categories
-- Goal: Find categories that have no products
-- TODO: Show categories where product count is 0

-- SOLUTION:
-- SELECT c.name as empty_category
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id
-- WHERE p.id IS NULL;

-- Exercise 2.6: LEFT JOIN for user analysis
-- Goal: Show all users with their order count (including users with no orders)
-- TODO: List users with their total number of orders

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as user_name,
--   u.email,
--   COUNT(o.id) as order_count
-- FROM users u
-- LEFT JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.first_name, u.last_name, u.email
-- ORDER BY order_count DESC;

-- =============================================================================
-- PART C: MULTIPLE TABLE JOINS - "Connect 3+ tables"
-- =============================================================================

-- Exercise 2.7: Three-table JOIN
-- Goal: Show order details with user and product information
-- TODO: Display: user name, product name, quantity, price for all order items

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   p.name as product_name,
--   oi.quantity,
--   oi.price_at_time,
--   (oi.quantity * oi.price_at_time) as line_total
-- FROM order_items oi
-- INNER JOIN orders o ON oi.order_id = o.id
-- INNER JOIN users u ON o.user_id = u.id
-- INNER JOIN products p ON oi.product_id = p.id
-- ORDER BY o.created_at DESC;



-- Exercise 2.8: Four-table JOIN with categories
-- Goal: Complete order analysis with product categories
-- TODO: Add category information to the previous query

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   c.name as category,
--   p.name as product_name,
--   oi.quantity,
--   oi.price_at_time,
--   o.status as order_status,
--   o.created_at as order_date
-- FROM order_items oi
-- INNER JOIN orders o ON oi.order_id = o.id
-- INNER JOIN users u ON o.user_id = u.id
-- INNER JOIN products p ON oi.product_id = p.id
-- INNER JOIN categories c ON p.category_id = c.id
-- ORDER BY o.created_at DESC, c.name;


-- =============================================================================
-- PART D: AGGREGATION WITH JOINS - "Combine and calculate"
-- =============================================================================

-- Exercise 2.9: Sales by category
-- Goal: Calculate total sales revenue per category
-- TODO: Show category name and total revenue from all orders

-- SOLUTION:
-- SELECT 
--   c.name as category,
--   COUNT(oi.id) as items_sold,
--   SUM(oi.quantity * oi.price_at_time) as total_revenue
-- FROM categories c
-- INNER JOIN products p ON c.id = p.category_id
-- INNER JOIN order_items oi ON p.id = oi.product_id
-- GROUP BY c.id, c.name
-- ORDER BY total_revenue DESC;

-- Exercise 2.10: Customer spending analysis
-- Goal: Show top customers by total spending
-- TODO: List customers with their total order amounts

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   u.email,
--   COUNT(o.id) as total_orders,
--   SUM(o.total_amount) as total_spent,
--   AVG(o.total_amount) as avg_order_value
-- FROM users u
-- INNER JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.first_name, u.last_name, u.email
-- ORDER BY total_spent DESC;

-- Exercise 2.11: Product popularity analysis
-- Goal: Find most popular products by quantity sold
-- TODO: Show products with total quantity sold across all orders

-- SOLUTION:
-- SELECT 
--   p.name as product_name,
--   c.name as category,
--   SUM(oi.quantity) as total_quantity_sold,
--   COUNT(oi.id) as times_ordered,
--   p.price as current_price
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- INNER JOIN order_items oi ON p.id = oi.product_id
-- GROUP BY p.id, p.name, c.name, p.price
-- ORDER BY total_quantity_sold DESC;

-- =============================================================================
-- PART E: ADVANCED JOINS WITH SUBQUERIES
-- =============================================================================

-- Exercise 2.12: Products with reviews
-- Goal: Show products with their average rating and review count
-- TODO: Include products that have no reviews (show 0 rating)

-- SOLUTION:
-- SELECT 
--   p.name as product_name,
--   c.name as category,
--   COALESCE(AVG(r.rating), 0) as avg_rating,
--   COUNT(r.id) as review_count,
--   p.price
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- LEFT JOIN reviews r ON p.id = r.product_id
-- GROUP BY p.id, p.name, c.name, p.price
-- ORDER BY avg_rating DESC, review_count DESC;



-- Exercise 2.13: Users and their cart contents
-- Goal: Show current shopping carts with product details
-- TODO: Display user name, product name, quantity, and total cart value per user

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   p.name as product_name,
--   ci.quantity,
--   p.price,
--   (ci.quantity * p.price) as line_total
-- FROM cart_items ci
-- INNER JOIN users u ON ci.user_id = u.id
-- INNER JOIN products p ON ci.product_id = p.id
-- ORDER BY u.first_name, p.name;

-- Exercise 2.14: Cart totals per user
-- Goal: Calculate total cart value for each user
-- TODO: Show user name and their total cart value

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   COUNT(ci.id) as items_in_cart,
--   SUM(ci.quantity * p.price) as cart_total
-- FROM users u
-- INNER JOIN cart_items ci ON u.id = ci.user_id
-- INNER JOIN products p ON ci.product_id = p.id
-- GROUP BY u.id, u.first_name, u.last_name
-- ORDER BY cart_total DESC;

-- =============================================================================
-- PART F: REAL-WORLD E-COMMERCE QUERIES
-- =============================================================================

-- Exercise 2.15: Order history with details
-- Goal: Complete customer order history
-- TODO: Show customer name, order date, products ordered, and order total

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   o.id as order_id,
--   o.created_at as order_date,
--   o.status,
--   STRING_AGG(p.name || ' (x' || oi.quantity || ')', ', ') as products_ordered,
--   o.total_amount
-- FROM orders o
-- INNER JOIN users u ON o.user_id = u.id
-- INNER JOIN order_items oi ON o.id = oi.order_id
-- INNER JOIN products p ON oi.product_id = p.id
-- GROUP BY o.id, u.first_name, u.last_name, o.created_at, o.status, o.total_amount
-- ORDER BY o.created_at DESC;

-- Exercise 2.16: Product recommendations
-- Goal: Find products frequently bought together
-- TODO: Show products that appear in the same orders

-- SOLUTION:
-- SELECT 
--   p1.name as product_1,
--   p2.name as product_2,
--   COUNT(*) as times_bought_together
-- FROM order_items oi1
-- INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id < oi2.product_id
-- INNER JOIN products p1 ON oi1.product_id = p1.id
-- INNER JOIN products p2 ON oi2.product_id = p2.id
-- GROUP BY p1.id, p1.name, p2.id, p2.name
-- ORDER BY times_bought_together DESC
-- LIMIT 10;

-- =============================================================================
-- CHALLENGE EXERCISES
-- =============================================================================

-- Challenge 1: Monthly sales report
-- Create a monthly sales report showing:
-- - Month/Year
-- - Total orders
-- - Total revenue
-- - Best-selling product
-- - Top customer

-- Challenge 2: Inventory alert
-- Find products that are running low on stock:
-- - Products with stock < 20
-- - Include category and recent sales velocity
-- - Calculate days until stock runs out

-- Challenge 3: Customer segmentation
-- Segment customers based on their order behavior:
-- - VIP customers (>$100 total spent)
-- - Regular customers (1-3 orders)
-- - New customers (1 order only)
-- Show count and average order value for each segment

-- Challenge 4: Product performance dashboard
-- Create a comprehensive product analysis:
-- - Revenue per product
-- - Profit margin (if you add cost data)
-- - Customer satisfaction (average rating)
-- - Inventory turnover rate

-- =============================================================================
-- JAVASCRIPT VS SQL COMPARISON
-- =============================================================================

-- 💡 Understanding JOINs through JavaScript equivalents:

-- INNER JOIN (only matching records)
-- JavaScript: array1.filter(item1 => array2.some(item2 => item1.id === item2.foreignId))
-- SQL: SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.foreign_id

-- LEFT JOIN (all from left, matching from right)
-- JavaScript: array1.map(item1 => ({
--   ...item1,
--   related: array2.filter(item2 => item2.foreignId === item1.id)
-- }))
-- SQL: SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.foreign_id

-- GROUP BY with aggregation
-- JavaScript: array.reduce((acc, item) => {
--   const key = item.category;
--   acc[key] = (acc[key] || 0) + item.value;
--   return acc;
-- }, {})
-- SQL: SELECT category, SUM(value) FROM table GROUP BY category

-- =============================================================================
-- KEY CONCEPTS MASTERED
-- =============================================================================

-- ✅ INNER JOIN: Only matching records from both tables
-- ✅ LEFT JOIN: All records from left table, matching from right
-- ✅ Multiple table JOINs: Connecting 3+ tables in one query
-- ✅ Aggregation with JOINs: GROUP BY, COUNT, SUM with related data
-- ✅ Real-world queries: E-commerce reporting and analysis

-- 🎯 Next Level: Advanced queries, subqueries, and performance optimization
-- 🚀 You now understand how to work with related data - the core of database power! 