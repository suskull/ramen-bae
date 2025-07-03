-- 🚀 Exercise 3.9: Query Performance Analysis
-- Compare JOIN vs EXISTS vs IN performance with EXPLAIN ANALYZE

-- First, let's verify our data
\echo '=== DATA VERIFICATION ==='
SELECT 'Users count:' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'Orders count:', COUNT(*) FROM orders
UNION ALL
SELECT 'Users with orders:', COUNT(DISTINCT user_id) FROM orders;

\echo ''
\echo '=== EXERCISE 3.9: PERFORMANCE COMPARISON ==='
\echo 'Goal: Find users who have placed orders using different approaches'
\echo ''

-- Approach 1: JOIN with DISTINCT
\echo '--- APPROACH 1: JOIN with DISTINCT ---'
EXPLAIN ANALYZE 
SELECT DISTINCT u.first_name, u.last_name
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

\echo ''

-- Approach 2: EXISTS subquery
\echo '--- APPROACH 2: EXISTS subquery ---'
EXPLAIN ANALYZE
SELECT u.first_name, u.last_name
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

\echo ''

-- Approach 3: IN subquery
\echo '--- APPROACH 3: IN subquery ---'
EXPLAIN ANALYZE
SELECT u.first_name, u.last_name
FROM users u
WHERE u.id IN (SELECT user_id FROM orders);

\echo ''
\echo '=== RESULT COMPARISON ==='
\echo 'Let\'s verify all three approaches return the same results:'

\echo ''
\echo '--- Results from JOIN with DISTINCT ---'
SELECT DISTINCT u.first_name, u.last_name
FROM users u
INNER JOIN orders o ON u.id = o.user_id
ORDER BY u.first_name, u.last_name;

\echo ''
\echo '--- Results from EXISTS ---'
SELECT u.first_name, u.last_name
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
ORDER BY u.first_name, u.last_name;

\echo ''
\echo '--- Results from IN ---'
SELECT u.first_name, u.last_name
FROM users u
WHERE u.id IN (SELECT user_id FROM orders)
ORDER BY u.first_name, u.last_name;

\echo ''
\echo '=== PERFORMANCE INSIGHTS ==='
\echo 'Key metrics to compare:'
\echo '1. Execution Time (total time)'
\echo '2. Planning Time'
\echo '3. Number of rows processed'
\echo '4. Node types used (Hash Join, Nested Loop, etc.)'
\echo '5. Cost estimates'
\echo ''
\echo 'Performance Analysis Complete! 🎯' 