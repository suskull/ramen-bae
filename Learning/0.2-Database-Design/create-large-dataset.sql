-- 📊 Create Larger Dataset for Performance Testing
-- Generate realistic amounts of data to see performance differences

\echo '=== CREATING LARGER DATASET FOR PERFORMANCE TESTING ==='

-- Insert 1000 additional users
INSERT INTO users (email, password_hash, first_name, last_name, phone)
SELECT 
    'user' || i || '@example.com' as email,
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj' as password_hash,
    'User' as first_name,
    'Number' || i as last_name,
    '555-' || LPAD(i::text, 4, '0') as phone
FROM generate_series(6, 1005) as i;

-- Insert 2000 additional orders
-- Not all users will have orders (realistic scenario)
INSERT INTO orders (user_id, total_amount, status, shipping_address, billing_address)
SELECT 
    (random() * 800 + 1)::int as user_id,  -- Random user from 1-800 (some users won't have orders)
    (random() * 100 + 10)::decimal(10,2) as total_amount,
    CASE (random() * 4)::int
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'processing'
        WHEN 2 THEN 'shipped'
        ELSE 'delivered'
    END as status,
    'Test Address ' || i as shipping_address,
    'Test Address ' || i as billing_address
FROM generate_series(1, 2000) as i;

-- Insert order items for the new orders
INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
SELECT 
    o.id as order_id,
    (random() * 20 + 1)::int as product_id,  -- Random product from 1-20
    (random() * 3 + 1)::int as quantity,
    (random() * 20 + 5)::decimal(10,2) as price_at_time
FROM orders o
WHERE o.id > 5  -- Only for new orders
AND random() < 0.8;  -- 80% chance each order has an item

\echo '=== DATASET STATISTICS ==='
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Orders:', COUNT(*) FROM orders  
UNION ALL
SELECT 'Order Items:', COUNT(*) FROM order_items
UNION ALL
SELECT 'Users with orders:', COUNT(DISTINCT user_id) FROM orders
UNION ALL
SELECT 'Users without orders:', COUNT(*) FROM users WHERE id NOT IN (SELECT DISTINCT user_id FROM orders);

\echo '=== LARGE DATASET READY FOR PERFORMANCE TESTING! ===' 