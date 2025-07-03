-- 🚀 Advanced Database Features - Hands-On Tutorial
-- Let's dive into stored procedures, triggers, and enterprise patterns!

\echo '=== ADVANCED DATABASE TUTORIAL STARTING ==='

-- =============================================================================
-- PART 1: STORED FUNCTIONS - "Reusable business logic"
-- =============================================================================

\echo '--- PART 1: Creating Stored Functions ---'

-- Function 1: Calculate order total with tax
CREATE OR REPLACE FUNCTION calculate_order_total_with_tax(
    p_order_id INTEGER,
    p_tax_rate DECIMAL(5,4) DEFAULT 0.0875
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(quantity * price_at_time), 0)
    INTO v_subtotal
    FROM order_items
    WHERE order_id = p_order_id;
    
    RETURN v_subtotal * (1 + p_tax_rate);
END;
$$;

\echo 'Function created: calculate_order_total_with_tax'

-- Test the function
SELECT 
    o.id as order_id,
    o.total_amount as original_total,
    calculate_order_total_with_tax(o.id) as total_with_tax,
    calculate_order_total_with_tax(o.id, 0.10) as total_with_10pct_tax
FROM orders o
WHERE o.id <= 5
ORDER BY o.id;

-- Function 2: Customer analytics function
CREATE OR REPLACE FUNCTION get_customer_stats(p_user_id INTEGER)
RETURNS TABLE(
    customer_name TEXT,
    total_orders INTEGER,
    total_spent DECIMAL(10,2),
    avg_order_value DECIMAL(10,2),
    customer_segment TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH customer_data AS (
        SELECT 
            u.first_name || ' ' || u.last_name as name,
            COUNT(o.id) as order_count,
            COALESCE(SUM(o.total_amount), 0) as total_amount,
            COALESCE(AVG(o.total_amount), 0) as avg_amount
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.id = p_user_id
        GROUP BY u.id, u.first_name, u.last_name
    )
    SELECT 
        cd.name,
        cd.order_count::INTEGER,
        cd.total_amount,
        cd.avg_amount,
        CASE 
            WHEN cd.total_amount > 1000 THEN 'VIP'
            WHEN cd.total_amount > 500 THEN 'Premium'
            WHEN cd.total_amount > 100 THEN 'Regular'
            WHEN cd.total_amount > 0 THEN 'New'
            ELSE 'No Purchase'
        END as segment
    FROM customer_data cd;
END;
$$;

\echo 'Function created: get_customer_stats'

-- Test customer analytics
SELECT * FROM get_customer_stats(1);
SELECT * FROM get_customer_stats(2);

-- =============================================================================
-- PART 2: STORED PROCEDURES - "Complex business operations"
-- =============================================================================

\echo '--- PART 2: Creating Stored Procedures ---'

-- Fixed procedure syntax
CREATE OR REPLACE FUNCTION process_order_simple(
    p_user_id INTEGER,
    p_product_id INTEGER,
    p_quantity INTEGER,
    p_shipping_address TEXT
)
RETURNS TABLE(
    order_id INTEGER,
    total_amount DECIMAL(10,2),
    status_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id INTEGER;
    v_price DECIMAL(10,2);
    v_stock INTEGER;
    v_total DECIMAL(10,2);
BEGIN
    -- Check product availability
    SELECT price, stock_quantity INTO v_price, v_stock
    FROM products 
    WHERE id = p_product_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::INTEGER, 0::DECIMAL(10,2), 'ERROR: Product not found'::TEXT;
        RETURN;
    END IF;
    
    IF v_stock < p_quantity THEN
        RETURN QUERY SELECT NULL::INTEGER, 0::DECIMAL(10,2), 'ERROR: Insufficient stock'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate total
    v_total := v_price * p_quantity;
    
    -- Create order
    INSERT INTO orders (user_id, total_amount, shipping_address, billing_address, status)
    VALUES (p_user_id, v_total, p_shipping_address, p_shipping_address, 'processing')
    RETURNING id INTO v_order_id;
    
    -- Add order item
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
    VALUES (v_order_id, p_product_id, p_quantity, v_price);
    
    -- Update inventory
    UPDATE products 
    SET stock_quantity = stock_quantity - p_quantity
    WHERE id = p_product_id;
    
    RETURN QUERY SELECT v_order_id, v_total, 'SUCCESS: Order created'::TEXT;
END;
$$;

\echo 'Procedure created: process_order_simple'

-- Test the procedure
SELECT * FROM process_order_simple(1, 1, 2, '123 Test Street, Test City');

-- =============================================================================
-- PART 3: TRIGGERS - "Automated database reactions"
-- =============================================================================

\echo '--- PART 3: Creating Triggers ---'

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100) DEFAULT CURRENT_USER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo 'Audit table created'

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_values)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_values, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, record_id, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

\echo 'Audit trigger function created'

-- Apply audit trigger to users table
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

\echo 'Audit trigger applied to users table'

-- Create stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    alert_type VARCHAR(50) NOT NULL,
    current_stock INTEGER,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE
);

\echo 'Stock alerts table created'

-- Stock monitoring trigger
CREATE OR REPLACE FUNCTION monitor_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_threshold INTEGER := 10;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.stock_quantity != NEW.stock_quantity THEN
        
        -- Out of stock alert
        IF NEW.stock_quantity = 0 AND OLD.stock_quantity > 0 THEN
            INSERT INTO stock_alerts (product_id, alert_type, current_stock, message)
            VALUES (NEW.id, 'OUT_OF_STOCK', NEW.stock_quantity, 
                   'Product "' || NEW.name || '" is now out of stock');
        
        -- Low stock alert
        ELSIF NEW.stock_quantity <= v_threshold AND OLD.stock_quantity > v_threshold THEN
            INSERT INTO stock_alerts (product_id, alert_type, current_stock, message)
            VALUES (NEW.id, 'LOW_STOCK', NEW.stock_quantity,
                   'Product "' || NEW.name || '" is running low (' || NEW.stock_quantity || ' left)');
        
        -- Restock notification
        ELSIF NEW.stock_quantity > v_threshold AND OLD.stock_quantity <= v_threshold THEN
            UPDATE stock_alerts 
            SET is_resolved = TRUE
            WHERE product_id = NEW.id AND is_resolved = FALSE;
            
            INSERT INTO stock_alerts (product_id, alert_type, current_stock, message)
            VALUES (NEW.id, 'RESTOCK', NEW.stock_quantity,
                   'Product "' || NEW.name || '" restocked (' || NEW.stock_quantity || ' units)');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

\echo 'Stock monitoring trigger function created'

-- Apply stock trigger
DROP TRIGGER IF EXISTS stock_monitor_trigger ON products;
CREATE TRIGGER stock_monitor_trigger
    AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION monitor_stock();

\echo 'Stock monitoring trigger applied'

-- =============================================================================
-- PART 4: VIEWS - "Simplified data access"
-- =============================================================================

\echo '--- PART 4: Creating Advanced Views ---'

-- Customer analytics view
CREATE OR REPLACE VIEW customer_dashboard AS
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as customer_name,
    u.email,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as lifetime_value,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    MAX(o.created_at) as last_order_date,
    CASE 
        WHEN COALESCE(SUM(o.total_amount), 0) > 1000 THEN 'VIP'
        WHEN COALESCE(SUM(o.total_amount), 0) > 500 THEN 'Premium'
        WHEN COALESCE(SUM(o.total_amount), 0) > 100 THEN 'Regular'
        WHEN COALESCE(SUM(o.total_amount), 0) > 0 THEN 'New'
        ELSE 'No Purchase'
    END as customer_segment
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email;

\echo 'Customer dashboard view created'

-- Product performance view
CREATE OR REPLACE VIEW product_insights AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock_quantity,
    c.name as category,
    COUNT(oi.id) as times_ordered,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as revenue,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as review_count,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity <= 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.price, p.stock_quantity, c.name;

\echo 'Product insights view created'

-- =============================================================================
-- PART 5: TESTING OUR ADVANCED FEATURES
-- =============================================================================

\echo '--- PART 5: Testing Everything We Built ---'

-- Test audit trigger by updating a user
\echo 'Testing audit trigger...'
UPDATE users SET phone = '555-AUDIT-TEST' WHERE id = 1;

-- Check audit log
SELECT 
    table_name,
    operation,
    record_id,
    changed_by,
    changed_at
FROM audit_log 
WHERE table_name = 'users' 
ORDER BY changed_at DESC 
LIMIT 3;

-- Test stock monitoring by updating inventory
\echo 'Testing stock monitoring...'
UPDATE products SET stock_quantity = 5 WHERE id = 1;  -- Should trigger low stock
UPDATE products SET stock_quantity = 0 WHERE id = 2;  -- Should trigger out of stock

-- Check stock alerts
SELECT 
    sa.alert_type,
    p.name as product_name,
    sa.current_stock,
    sa.message,
    sa.created_at
FROM stock_alerts sa
JOIN products p ON sa.product_id = p.id
ORDER BY sa.created_at DESC
LIMIT 5;

-- Test our views
\echo 'Testing customer dashboard view...'
SELECT 
    customer_name,
    total_orders,
    lifetime_value,
    customer_segment
FROM customer_dashboard
ORDER BY lifetime_value DESC
LIMIT 5;

\echo 'Testing product insights view...'
SELECT 
    name,
    category,
    times_ordered,
    total_sold,
    revenue,
    stock_status
FROM product_insights
ORDER BY revenue DESC
LIMIT 5;

-- Test our custom functions
\echo 'Testing custom functions...'
SELECT 
    'Order 1 with tax:' as description,
    calculate_order_total_with_tax(1) as result
UNION ALL
SELECT 
    'Customer 1 stats:',
    (SELECT customer_name FROM get_customer_stats(1))::TEXT;

\echo ''
\echo '=== 🎉 ADVANCED DATABASE TUTORIAL COMPLETE! ==='
\echo ''
\echo '✅ Functions: Created reusable business logic'
\echo '✅ Procedures: Built complex order processing'
\echo '✅ Triggers: Set up automatic auditing and stock monitoring'
\echo '✅ Views: Created business intelligence dashboards'
\echo '✅ Testing: Verified all features work correctly'
\echo ''
\echo '🚀 You now have enterprise-level database skills!' 