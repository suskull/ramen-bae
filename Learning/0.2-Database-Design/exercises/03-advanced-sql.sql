-- 🚀 Exercise 3: Advanced SQL - Subqueries, Window Functions & Performance
-- Master the advanced techniques that separate SQL beginners from experts
-- These concepts unlock powerful analytics and optimization capabilities

-- =============================================================================
-- PART A: ADVANCED SUBQUERIES - "Queries within queries"
-- =============================================================================

-- 💡 Subqueries are like nested functions in programming
-- They allow you to break complex problems into smaller, manageable pieces

-- =============================================================================
-- A1: SCALAR SUBQUERIES - "Return a single value"
-- =============================================================================

-- Exercise 3.1: Products above average price
-- Goal: Find products that cost more than the average price
-- TODO: Use a subquery to calculate the average price

-- SOLUTION:
-- SELECT name, price, 
--   (SELECT AVG(price) FROM products) as avg_price,
--   price - (SELECT AVG(price) FROM products) as price_difference
-- FROM products 
-- WHERE price > (SELECT AVG(price) FROM products)
-- ORDER BY price DESC;


-- Exercise 3.2: Customer above average spending
-- Goal: Find customers who spent more than the average customer
-- TODO: Compare each customer's total spending to the overall average

-- SOLUTION:
-- SELECT 
--   u.first_name || ' ' || u.last_name as customer_name,
--   SUM(o.total_amount) as total_spent,
--   (SELECT AVG(customer_total) FROM (
--     SELECT SUM(total_amount) as customer_total 
--     FROM orders 
--     GROUP BY user_id
--   ) as avg_calc) as avg_customer_spending
-- FROM users u
-- INNER JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.first_name, u.last_name
-- HAVING SUM(o.total_amount) > (
--   SELECT AVG(customer_total) FROM (
--     SELECT SUM(total_amount) as customer_total 
--     FROM orders 
--     GROUP BY user_id
--   ) as avg_calc
-- )
-- ORDER BY total_spent DESC;


-- =============================================================================
-- A2: CORRELATED SUBQUERIES - "Inner query references outer query"
-- =============================================================================

-- Exercise 3.3: Most expensive product per category
-- Goal: Find the highest-priced product in each category
-- TODO: Use a correlated subquery to compare with category maximum

-- SOLUTION:
-- SELECT 
--   c.name as category,
--   p.name as most_expensive_product,
--   p.price
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- WHERE p.price = (
--   SELECT MAX(p2.price) 
--   FROM products p2 
--   WHERE p2.category_id = p.category_id  -- Correlated: references outer query
-- )
-- ORDER BY p.price DESC;


-- Exercise 3.4: Products never ordered
-- Goal: Find products that have never been purchased
-- TODO: Use NOT EXISTS to find orphaned products

-- SOLUTION:
-- SELECT p.name, p.price, c.name as category
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
-- )
-- ORDER BY p.price DESC;

-- =============================================================================
-- PART B: WINDOW FUNCTIONS - "Analytics without GROUP BY"
-- =============================================================================

-- 💡 Window functions are like GROUP BY but they don't collapse rows
-- Perfect for rankings, running totals, and comparative analytics

-- Exercise 3.5: Product rankings by price within category
-- Goal: Rank products from most to least expensive within each category
-- TODO: Use ROW_NUMBER() window function

-- SOLUTION:
-- SELECT 
--   c.name as category,
--   p.name as product_name,
--   p.price,
--   ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY p.price DESC) as price_rank,
--   RANK() OVER (PARTITION BY c.id ORDER BY p.price DESC) as price_rank_with_ties
-- FROM products p
-- INNER JOIN categories c ON p.category_id = c.id
-- ORDER BY c.name, price_rank;


-- Exercise 3.6: Running sales total by date
-- Goal: Show daily sales with a running total
-- TODO: Calculate cumulative revenue over time

-- SOLUTION:
-- SELECT 
--   DATE(o.created_at) as order_date,
--   COUNT(o.id) as daily_orders,
--   SUM(o.total_amount) as daily_revenue,
--   SUM(COUNT(o.id)) OVER (ORDER BY DATE(o.created_at)) as cumulative_orders,
--   SUM(SUM(o.total_amount)) OVER (ORDER BY DATE(o.created_at)) as cumulative_revenue
-- FROM orders o
-- GROUP BY DATE(o.created_at)
-- ORDER BY order_date;

-- =============================================================================
-- PART C: COMMON TABLE EXPRESSIONS (CTEs) - "Named subqueries"
-- =============================================================================

-- 💡 CTEs make complex queries readable and maintainable
-- Think of them as temporary named result sets

-- Exercise 3.7: Complex customer analysis with CTEs
-- Goal: Multi-step customer analysis using CTEs
-- TODO: Break down complex logic into readable steps

-- SOLUTION:
-- WITH customer_stats AS (
--   SELECT 
--     u.id,
--     u.first_name || ' ' || u.last_name as customer_name,
--     COUNT(o.id) as total_orders,
--     SUM(o.total_amount) as total_spent,
--     AVG(o.total_amount) as avg_order_value
--   FROM users u
--   LEFT JOIN orders o ON u.id = o.user_id
--   GROUP BY u.id, u.first_name, u.last_name
-- ),
-- customer_segments AS (
--   SELECT *,
--     CASE 
--       WHEN total_spent > 1000 THEN 'VIP'
--       WHEN total_spent > 500 THEN 'Premium'
--       WHEN total_spent > 100 THEN 'Regular'
--       WHEN total_spent > 0 THEN 'New'
--       ELSE 'No Purchase'
--     END as customer_segment
--   FROM customer_stats
-- )
-- SELECT 
--   customer_segment,
--   COUNT(*) as customer_count,
--   AVG(total_spent) as avg_total_spent,
--   AVG(avg_order_value) as avg_order_value
-- FROM customer_segments
-- GROUP BY customer_segment
-- ORDER BY avg_total_spent DESC;

-- =============================================================================
-- PERFORMANCE EXERCISES
-- =============================================================================

-- Exercise 3.8: Query optimization
-- Goal: Rewrite inefficient queries for better performance

-- ❌ SLOW: Multiple subqueries
-- SELECT p.name,
--   (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as times_ordered,
--   (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating
-- FROM products p;

-- ✅ FAST: Single query with JOINs
-- SELECT 
--   p.name,
--   COUNT(oi.id) as times_ordered,
--   AVG(r.rating) as avg_rating
-- FROM products p
-- LEFT JOIN order_items oi ON p.id = oi.product_id
-- LEFT JOIN reviews r ON p.id = r.product_id
-- GROUP BY p.id, p.name;

-- =============================================================================
-- START HERE: Try these exercises in order!
-- =============================================================================

-- =============================================================================
-- PART D: PERFORMANCE OPTIMIZATION - "Making queries fast"
-- =============================================================================

-- 💡 Understanding query performance is crucial for production applications

-- =============================================================================
-- D1: QUERY EXECUTION PLANS - "See how the database thinks"
-- =============================================================================

-- Exercise 3.9: Analyze query performance
-- Goal: Understand how different query approaches perform
-- TODO: Compare JOIN vs EXISTS vs IN performance

-- Check execution plan (PostgreSQL):
-- EXPLAIN ANALYZE 
-- SELECT DISTINCT u.first_name, u.last_name
-- FROM users u
-- INNER JOIN orders o ON u.id = o.user_id;

-- EXPLAIN ANALYZE
-- SELECT u.first_name, u.last_name
-- FROM users u
-- WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- EXPLAIN ANALYZE
-- SELECT u.first_name, u.last_name
-- FROM users u
-- WHERE u.id IN (SELECT user_id FROM orders);

-- =============================================================================
-- D2: INDEX OPTIMIZATION - "Speed up data access"
-- =============================================================================

-- Exercise 3.10: Create performance indexes
-- Goal: Add indexes to improve common query patterns
-- TODO: Identify and create useful indexes

-- SOLUTION (Examples):
-- CREATE INDEX idx_products_category_id ON products(category_id);
-- CREATE INDEX idx_products_price ON products(price);
-- CREATE INDEX idx_orders_user_id ON orders(user_id);
-- CREATE INDEX idx_orders_created_at ON orders(created_at);
-- CREATE INDEX idx_order_items_order_id ON order_items(order_id);
-- CREATE INDEX idx_order_items_product_id ON order_items(product_id);
-- CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- Composite indexes for common query patterns:
-- CREATE INDEX idx_products_active_price ON products(is_active, price);
-- CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- =============================================================================
-- D3: QUERY OPTIMIZATION TECHNIQUES
-- =============================================================================

-- Exercise 3.11: Optimize slow queries
-- Goal: Rewrite inefficient queries for better performance

-- ❌ SLOW: Multiple subqueries
-- SELECT p.name,
--   (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as times_ordered,
--   (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
--   (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.product_id = p.id) as total_quantity_sold
-- FROM products p;

-- ✅ FAST: Single query with JOINs
-- SELECT 
--   p.name,
--   COUNT(oi.id) as times_ordered,
--   AVG(r.rating) as avg_rating,
--   SUM(oi.quantity) as total_quantity_sold
-- FROM products p
-- LEFT JOIN order_items oi ON p.id = oi.product_id
-- LEFT JOIN reviews r ON p.id = r.product_id
-- GROUP BY p.id, p.name;

-- =============================================================================
-- CHALLENGE EXERCISES - "Real-world complex scenarios"
-- =============================================================================

-- Challenge 1: Customer Cohort Analysis
-- Create a monthly cohort analysis showing:
-- - Customer acquisition by month
-- - Retention rates by cohort
-- - Revenue per cohort over time

-- Challenge 2: Product Recommendation Engine
-- Build a recommendation system that finds:
-- - Products frequently bought together
-- - Similar customers based on purchase history
-- - Trending products by category

-- Challenge 3: Inventory Forecasting
-- Create an inventory management system that calculates:
-- - Sales velocity per product
-- - Seasonal trends
-- - Reorder points and quantities
-- - Days until stockout

-- Challenge 4: Advanced Analytics Dashboard
-- Build a comprehensive analytics query that shows:
-- - Revenue trends with year-over-year comparison
-- - Customer lifetime value calculations
-- - Product performance metrics
-- - Geographic sales analysis

-- =============================================================================
-- PERFORMANCE MONITORING QUERIES
-- =============================================================================

-- Monitor query performance (PostgreSQL):
-- SELECT query, calls, total_time, mean_time
-- FROM pg_stat_statements
-- ORDER BY total_time DESC
-- LIMIT 10;

-- Check table sizes:
-- SELECT 
--   tablename,
--   pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- =============================================================================
-- KEY CONCEPTS MASTERED
-- =============================================================================

-- ✅ Scalar Subqueries: Single value calculations
-- ✅ Correlated Subqueries: Inner query references outer query
-- ✅ EXISTS/NOT EXISTS: Efficient existence checking
-- ✅ Window Functions: Analytics without grouping
-- ✅ CTEs: Readable complex query structure
-- ✅ Performance Analysis: EXPLAIN ANALYZE
-- ✅ Index Optimization: Strategic index placement
-- ✅ Query Optimization: Efficient query patterns

-- 🎯 Next Level: Advanced database design, stored procedures, and triggers
-- 🚀 You now have the SQL skills to handle enterprise-level data analytics!

-- =============================================================================
-- JAVASCRIPT VS SQL COMPARISON (Advanced)
-- =============================================================================

-- Window Functions vs JavaScript:
-- SQL: ROW_NUMBER() OVER (PARTITION BY category ORDER BY price)
-- JS: array.map((item, index) => ({...item, rank: index + 1}))

-- CTEs vs JavaScript:
-- SQL: WITH temp AS (SELECT...) SELECT * FROM temp
-- JS: const temp = array.filter(...); const result = temp.map(...);

-- Correlated Subqueries vs JavaScript:
-- SQL: WHERE price = (SELECT MAX(price) FROM products p2 WHERE p2.category = p.category)
-- JS: array.filter(item => item.price === Math.max(...array.filter(i => i.category === item.category).map(i => i.price))) 