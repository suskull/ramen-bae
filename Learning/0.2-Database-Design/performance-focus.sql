-- 🎯 Exercise 3.9: Focused Performance Analysis
-- Compare JOIN vs EXISTS vs IN performance with EXPLAIN ANALYZE

\echo '=== EXERCISE 3.9: PERFORMANCE COMPARISON ==='
\echo 'Dataset: 1,005 users, 2,005 orders, 728 users with orders'
\echo ''

-- Approach 1: JOIN with DISTINCT
\echo '--- APPROACH 1: JOIN with DISTINCT ---'
EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT TEXT) 
SELECT DISTINCT u.first_name, u.last_name
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

\echo ''

-- Approach 2: EXISTS subquery  
\echo '--- APPROACH 2: EXISTS subquery ---'
EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT TEXT)
SELECT u.first_name, u.last_name
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

\echo ''

-- Approach 3: IN subquery
\echo '--- APPROACH 3: IN subquery ---'
EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT TEXT)
SELECT u.first_name, u.last_name
FROM users u
WHERE u.id IN (SELECT user_id FROM orders);

\echo ''
\echo '=== PERFORMANCE SUMMARY ==='

-- Run each approach multiple times to get average timing
\echo '--- Timing Comparison (5 runs each) ---'

\timing on

-- JOIN approach (5 runs)
SELECT DISTINCT u.first_name, u.last_name FROM users u INNER JOIN orders o ON u.id = o.user_id;
SELECT DISTINCT u.first_name, u.last_name FROM users u INNER JOIN orders o ON u.id = o.user_id;
SELECT DISTINCT u.first_name, u.last_name FROM users u INNER JOIN orders o ON u.id = o.user_id;
SELECT DISTINCT u.first_name, u.last_name FROM users u INNER JOIN orders o ON u.id = o.user_id;
SELECT DISTINCT u.first_name, u.last_name FROM users u INNER JOIN orders o ON u.id = o.user_id;

\echo '--- EXISTS approach ---'
SELECT u.first_name, u.last_name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
SELECT u.first_name, u.last_name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
SELECT u.first_name, u.last_name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
SELECT u.first_name, u.last_name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
SELECT u.first_name, u.last_name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

\echo '--- IN approach ---'
SELECT u.first_name, u.last_name FROM users u WHERE u.id IN (SELECT user_id FROM orders);
SELECT u.first_name, u.last_name FROM users u WHERE u.id IN (SELECT user_id FROM orders);
SELECT u.first_name, u.last_name FROM users u WHERE u.id IN (SELECT user_id FROM orders);
SELECT u.first_name, u.last_name FROM users u WHERE u.id IN (SELECT user_id FROM orders);
SELECT u.first_name, u.last_name FROM users u WHERE u.id IN (SELECT user_id FROM orders);

\timing off

\echo ''
\echo '=== KEY PERFORMANCE INSIGHTS ==='
\echo '🎯 Analysis Complete!' 