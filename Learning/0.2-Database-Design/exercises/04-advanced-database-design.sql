-- 🚀 Exercise 4: Advanced Database Design - Stored Procedures, Triggers & Enterprise Patterns
-- Master the advanced concepts used in production database systems
-- These skills separate database users from database architects

-- =============================================================================
-- PART A: STORED PROCEDURES & FUNCTIONS - "Database-side business logic"
-- =============================================================================

-- 💡 Stored procedures encapsulate complex business logic in the database
-- Benefits: Performance, security, consistency, reusability

-- =============================================================================
-- A1: BASIC FUNCTIONS - "Reusable calculations"
-- =============================================================================

-- Exercise 4.1: Create a function to calculate order total with tax
-- Goal: Encapsulate tax calculation logic
-- TODO: Create a function that takes order_id and tax_rate, returns total with tax

-- SOLUTION:
CREATE OR REPLACE FUNCTION calculate_order_total_with_tax(
    p_order_id INTEGER,
    p_tax_rate DECIMAL(5,4) DEFAULT 0.0875  -- Default 8.75% tax
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_total_with_tax DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(quantity * price_at_time), 0)
    INTO v_subtotal
    FROM order_items
    WHERE order_id = p_order_id;
    
    -- Calculate total with tax
    v_total_with_tax := v_subtotal * (1 + p_tax_rate);
    
    RETURN v_total_with_tax;
END;
$$;

-- Test the function
-- SELECT calculate_order_total_with_tax(1) as total_with_tax;
-- SELECT calculate_order_total_with_tax(1, 0.10) as total_with_10pct_tax;


-- Exercise 4.2: Customer lifetime value calculation
-- Goal: Create a function to calculate customer's total spending
-- TODO: Build a comprehensive customer analytics function

-- SOLUTION:
CREATE OR REPLACE FUNCTION get_customer_lifetime_value(p_user_id INTEGER)
RETURNS TABLE(
    customer_name TEXT,
    total_orders INTEGER,
    total_spent DECIMAL(10,2),
    avg_order_value DECIMAL(10,2),
    first_order_date TIMESTAMP,
    last_order_date TIMESTAMP,
    customer_segment TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH customer_stats AS (
        SELECT 
            u.first_name || ' ' || u.last_name as name,
            COUNT(o.id) as order_count,
            COALESCE(SUM(o.total_amount), 0) as total_amount,
            COALESCE(AVG(o.total_amount), 0) as avg_amount,
            MIN(o.created_at) as first_order,
            MAX(o.created_at) as last_order
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.id = p_user_id
        GROUP BY u.id, u.first_name, u.last_name
    )
    SELECT 
        cs.name,
        cs.order_count::INTEGER,
        cs.total_amount,
        cs.avg_amount,
        cs.first_order,
        cs.last_order,
        CASE 
            WHEN cs.total_amount > 1000 THEN 'VIP'
            WHEN cs.total_amount > 500 THEN 'Premium'
            WHEN cs.total_amount > 100 THEN 'Regular'
            WHEN cs.total_amount > 0 THEN 'New'
            ELSE 'No Purchase'
        END as segment
    FROM customer_stats cs;
END;
$$;

-- Test the function
-- SELECT * FROM get_customer_lifetime_value(1);

-- =============================================================================
-- A2: STORED PROCEDURES - "Complex business operations"
-- =============================================================================

-- Exercise 4.3: Order processing procedure
-- Goal: Create a comprehensive order processing workflow
-- TODO: Handle inventory, pricing, and order creation atomically

-- SOLUTION:
CREATE OR REPLACE PROCEDURE process_new_order(
    p_user_id INTEGER,
    p_items JSONB,  -- [{"product_id": 1, "quantity": 2}, ...]
    p_shipping_address TEXT,
    OUT p_order_id INTEGER,
    OUT p_total_amount DECIMAL(10,2),
    OUT p_status TEXT,
    p_billing_address TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item JSONB;
    v_product_id INTEGER;
    v_quantity INTEGER;
    v_price DECIMAL(10,2);
    v_stock_available INTEGER;
    v_order_total DECIMAL(10,2) := 0;
BEGIN
    -- Set default billing address
    IF p_billing_address IS NULL THEN
        p_billing_address := p_shipping_address;
    END IF;
    
    -- Start transaction (implicit in procedure)
    -- Validate all items first
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::INTEGER;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        -- Check product exists and is active
        SELECT price, stock_quantity 
        INTO v_price, v_stock_available
        FROM products 
        WHERE id = v_product_id AND is_active = true;
        
        IF NOT FOUND THEN
            p_status := 'ERROR: Product ' || v_product_id || ' not found or inactive';
            RETURN;
        END IF;
        
        -- Check sufficient stock
        IF v_stock_available < v_quantity THEN
            p_status := 'ERROR: Insufficient stock for product ' || v_product_id;
            RETURN;
        END IF;
        
        v_order_total := v_order_total + (v_price * v_quantity);
    END LOOP;
    
    -- Create the order
    INSERT INTO orders (user_id, total_amount, shipping_address, billing_address, status)
    VALUES (p_user_id, v_order_total, p_shipping_address, p_billing_address, 'processing')
    RETURNING id INTO p_order_id;
    
    -- Add order items and update inventory
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::INTEGER;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        -- Get current price
        SELECT price INTO v_price FROM products WHERE id = v_product_id;
        
        -- Add order item
        INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
        VALUES (p_order_id, v_product_id, v_quantity, v_price);
        
        -- Update inventory
        UPDATE products 
        SET stock_quantity = stock_quantity - v_quantity
        WHERE id = v_product_id;
    END LOOP;
    
    p_total_amount := v_order_total;
    p_status := 'SUCCESS';
    
EXCEPTION
    WHEN OTHERS THEN
        p_status := 'ERROR: ' || SQLERRM;
        ROLLBACK;
END;
$$;

-- Test the procedure
/*
DO $$
DECLARE
    v_order_id INTEGER;
    v_total DECIMAL(10,2);
    v_status TEXT;
BEGIN
    CALL process_new_order(
        1,  -- user_id
        '[{"product_id": 1, "quantity": 2}, {"product_id": 5, "quantity": 1}]'::JSONB,
        '123 Test St, Test City',
        v_order_id,
        v_total,
        v_status,
        NULL  -- billing_address (optional, comes last)
    );
    
    RAISE NOTICE 'Order ID: %, Total: %, Status: %', v_order_id, v_total, v_status;
END;
$$;
*/

-- =============================================================================
-- PART B: TRIGGERS - "Automated database reactions"
-- =============================================================================

-- 💡 Triggers automatically execute code in response to database events
-- Use cases: Auditing, data validation, cache invalidation, business rules

-- =============================================================================
-- B1: AUDIT TRIGGERS - "Track all changes"
-- =============================================================================

-- Exercise 4.4: Create audit trail system
-- Goal: Track all changes to sensitive tables
-- TODO: Set up comprehensive audit logging

-- First, create audit table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100) DEFAULT CURRENT_USER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_info JSONB DEFAULT jsonb_build_object(
        'application_name', current_setting('application_name', true),
        'client_addr', inet_client_addr(),
        'client_port', inet_client_port()
    )
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
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

-- Apply audit triggers to sensitive tables
-- DROP TRIGGER IF EXISTS audit_users_trigger ON users;
-- CREATE TRIGGER audit_users_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON users
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;
-- CREATE TRIGGER audit_orders_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON orders
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================================================
-- 📋 PRACTICAL EXAMPLE: Setting Up and Testing Audit Triggers
-- =============================================================================

-- Step 1: Create the audit triggers on specific tables
-- Let's enable auditing for users and orders tables

-- Enable auditing for users table
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Enable auditing for orders table  
DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;
CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Enable auditing for products table (for stock changes)
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

\echo '✅ Audit triggers created successfully!'

-- =============================================================================
-- 🧪 TESTING THE AUDIT SYSTEM
-- =============================================================================

\echo '--- Testing Audit System with Real Examples ---'

-- Test 1: INSERT operation (creating a new user)
\echo '🔹 Test 1: Creating a new user (INSERT audit)'
INSERT INTO users (first_name, last_name, email, phone) 
VALUES ('John', 'Audit', 'john.audit@test.com', '555-AUDIT');

-- Test 2: UPDATE operation (changing user info)
\echo '🔹 Test 2: Updating user phone (UPDATE audit)'
UPDATE users 
SET phone = '555-NEW-PHONE', 
    updated_at = CURRENT_TIMESTAMP 
WHERE email = 'john.audit@test.com';

-- Test 3: UPDATE operation (changing order status)
\echo '🔹 Test 3: Updating order status (UPDATE audit)'
-- First, let's create an order to update
INSERT INTO orders (user_id, total_amount, status, shipping_address) 
VALUES (
    (SELECT id FROM users WHERE email = 'john.audit@test.com'), 
    99.99, 
    'pending', 
    '123 Audit Street'
);

-- Now update the order status
UPDATE orders 
SET status = 'processing', 
    updated_at = CURRENT_TIMESTAMP 
WHERE user_id = (SELECT id FROM users WHERE email = 'john.audit@test.com')
  AND status = 'pending';

-- Test 4: Product stock change (inventory management)
\echo '🔹 Test 4: Updating product stock (UPDATE audit)'
-- First, let's check current stock and update safely
DO $$
DECLARE
    v_current_stock INTEGER;
    v_product_name TEXT;
BEGIN
    -- Get current stock level
    SELECT stock_quantity, name 
    INTO v_current_stock, v_product_name
    FROM products WHERE id = 1;
    
    RAISE NOTICE 'Product: %, Current Stock: %', v_product_name, v_current_stock;
    
    -- Update stock safely (ensure it doesn't go negative)
    IF v_current_stock >= 3 THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - 3 
        WHERE id = 1;
        RAISE NOTICE 'Stock reduced by 3 units';
    ELSE
        -- If stock is low, just reduce by 1 or set to a safe level
        UPDATE products 
        SET stock_quantity = GREATEST(stock_quantity - 1, 0)
        WHERE id = 1;
        RAISE NOTICE 'Stock reduced safely to prevent negative inventory';
    END IF;
END;
$$;

-- Test 5: DELETE operation (removing the test user)
\echo '🔹 Test 5: Deleting test user (DELETE audit)'
-- First delete any orders (foreign key constraint)
DELETE FROM orders 
WHERE user_id = (SELECT id FROM users WHERE email = 'john.audit@test.com');

-- Then delete the user
DELETE FROM users WHERE email = 'john.audit@test.com';

-- =============================================================================
-- 📊 VIEWING AUDIT RESULTS
-- =============================================================================

\echo '--- Viewing Audit Trail Results ---'

-- View all recent audit entries
\echo '🔍 All recent audit entries (last 10):'
SELECT 
    id,
    table_name,
    operation,
    record_id,
    changed_by,
    changed_at,
    CASE 
        WHEN operation = 'INSERT' THEN 'Created: ' || COALESCE(new_values->>'first_name', '') || ' ' || COALESCE(new_values->>'last_name', '')
        WHEN operation = 'UPDATE' THEN 'Updated: ' || 
            CASE 
                WHEN old_values->>'phone' != new_values->>'phone' THEN 'Phone changed from ' || COALESCE(old_values->>'phone', 'NULL') || ' to ' || COALESCE(new_values->>'phone', 'NULL')
                WHEN old_values->>'status' != new_values->>'status' THEN 'Status changed from ' || COALESCE(old_values->>'status', 'NULL') || ' to ' || COALESCE(new_values->>'status', 'NULL')
                WHEN old_values->>'stock_quantity' != new_values->>'stock_quantity' THEN 'Stock changed from ' || COALESCE(old_values->>'stock_quantity', 'NULL') || ' to ' || COALESCE(new_values->>'stock_quantity', 'NULL')
                ELSE 'Other changes'
            END
        WHEN operation = 'DELETE' THEN 'Deleted: ' || COALESCE(old_values->>'first_name', '') || ' ' || COALESCE(old_values->>'last_name', '')
        ELSE operation
    END as change_summary
FROM audit_log 
ORDER BY changed_at DESC 
LIMIT 10;

-- View audit entries by table
\echo '🔍 Audit entries by table:'
SELECT 
    table_name,
    operation,
    COUNT(*) as count,
    MIN(changed_at) as first_change,
    MAX(changed_at) as last_change
FROM audit_log 
WHERE changed_at >= CURRENT_DATE
GROUP BY table_name, operation
ORDER BY table_name, operation;

-- View detailed changes for users table
\echo '🔍 Detailed user changes:'
SELECT 
    operation,
    record_id,
    CASE 
        WHEN operation = 'INSERT' THEN 
            'New user: ' || COALESCE(new_values->>'first_name', '') || ' ' || COALESCE(new_values->>'last_name', '') || ' (' || COALESCE(new_values->>'email', '') || ')'
        WHEN operation = 'UPDATE' THEN 
            'Updated user ID ' || record_id || ': ' || 
            CASE 
                WHEN old_values->>'first_name' != new_values->>'first_name' THEN 'Name: ' || COALESCE(old_values->>'first_name', 'NULL') || ' → ' || COALESCE(new_values->>'first_name', 'NULL')
                WHEN old_values->>'phone' != new_values->>'phone' THEN 'Phone: ' || COALESCE(old_values->>'phone', 'NULL') || ' → ' || COALESCE(new_values->>'phone', 'NULL')
                ELSE 'Other field changes'
            END
        WHEN operation = 'DELETE' THEN 
            'Deleted user: ' || COALESCE(old_values->>'first_name', '') || ' ' || COALESCE(old_values->>'last_name', '') || ' (' || COALESCE(old_values->>'email', '') || ')'
    END as change_description,
    changed_at,
    changed_by
FROM audit_log 
WHERE table_name = 'users' 
  AND changed_at >= CURRENT_DATE
ORDER BY changed_at DESC;

-- Advanced: Find who made the most changes today
\echo '🔍 Most active users today:'
SELECT 
    changed_by,
    COUNT(*) as total_changes,
    COUNT(CASE WHEN operation = 'INSERT' THEN 1 END) as inserts,
    COUNT(CASE WHEN operation = 'UPDATE' THEN 1 END) as updates,
    COUNT(CASE WHEN operation = 'DELETE' THEN 1 END) as deletes,
    MIN(changed_at) as first_activity,
    MAX(changed_at) as last_activity
FROM audit_log 
WHERE changed_at >= CURRENT_DATE
GROUP BY changed_by
ORDER BY total_changes DESC;

-- =============================================================================
-- 🔧 USEFUL AUDIT QUERIES FOR BUSINESS USE
-- =============================================================================

-- Create a view for easy audit access
CREATE OR REPLACE VIEW audit_summary AS
SELECT 
    al.id,
    al.table_name,
    al.operation,
    al.record_id,
    al.changed_by,
    al.changed_at,
    -- Smart change description based on table and operation
    CASE 
        WHEN al.table_name = 'users' AND al.operation = 'INSERT' THEN 
            'New user registered: ' || COALESCE(al.new_values->>'email', 'Unknown')
        WHEN al.table_name = 'users' AND al.operation = 'UPDATE' THEN 
            'User updated: ' || COALESCE(al.new_values->>'email', 'Unknown')
        WHEN al.table_name = 'users' AND al.operation = 'DELETE' THEN 
            'User deleted: ' || COALESCE(al.old_values->>'email', 'Unknown')
        WHEN al.table_name = 'orders' AND al.operation = 'INSERT' THEN 
            'New order placed: $' || COALESCE(al.new_values->>'total_amount', '0')
        WHEN al.table_name = 'orders' AND al.operation = 'UPDATE' THEN 
            'Order status changed: ' || COALESCE(al.old_values->>'status', 'NULL') || ' → ' || COALESCE(al.new_values->>'status', 'NULL')
        WHEN al.table_name = 'products' AND al.operation = 'UPDATE' THEN 
            'Product stock updated: ' || COALESCE(al.old_values->>'stock_quantity', 'NULL') || ' → ' || COALESCE(al.new_values->>'stock_quantity', 'NULL')
        ELSE al.operation || ' on ' || al.table_name
    END as change_description,
    -- Extract key information based on table
    CASE 
        WHEN al.table_name = 'users' THEN COALESCE(al.new_values->>'email', al.old_values->>'email', 'Unknown User')
        WHEN al.table_name = 'orders' THEN 'Order #' || al.record_id
        WHEN al.table_name = 'products' THEN COALESCE(al.new_values->>'name', al.old_values->>'name', 'Unknown Product')
        ELSE 'Record #' || al.record_id
    END as affected_record
FROM audit_log al;

\echo '✅ Audit system setup and testing complete!'
\echo '💡 Use "SELECT * FROM audit_summary ORDER BY changed_at DESC LIMIT 20;" to see recent changes'
\echo '💡 Use "SELECT * FROM audit_log WHERE table_name = ''users'' ORDER BY changed_at DESC;" for specific table audits'

-- =============================================================================
-- 🔍 UNDERSTANDING CHECK CONSTRAINTS
-- =============================================================================

\echo '--- Understanding Database Constraints ---'

-- View all check constraints on products table
\echo '🔍 Check constraints on products table:'
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
  AND contype = 'c';

-- View current stock levels to understand the data
\echo '🔍 Current product stock levels:'
SELECT 
    id,
    name,
    stock_quantity,
    CASE 
        WHEN stock_quantity <= 0 THEN '🔴 Out of Stock'
        WHEN stock_quantity <= 5 THEN '🟡 Low Stock'
        WHEN stock_quantity <= 10 THEN '🟠 Medium Stock'
        ELSE '🟢 Good Stock'
    END as stock_status
FROM products 
ORDER BY stock_quantity ASC;

-- =============================================================================
-- 🛠️ MANAGING CHECK CONSTRAINTS (OPTIONAL)
-- =============================================================================

-- If you want to temporarily disable the constraint for testing:
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_quantity_check;

-- Or modify it to allow small negative values for testing:
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_quantity_check;
-- ALTER TABLE products ADD CONSTRAINT products_stock_quantity_check 
--     CHECK (stock_quantity >= -10);  -- Allow up to -10 for testing

-- Best practice: Create a more flexible constraint
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_quantity_check;
-- ALTER TABLE products ADD CONSTRAINT products_stock_quantity_check 
--     CHECK (stock_quantity >= 0);  -- Standard: no negative inventory

\echo '💡 TIP: Check constraints protect data integrity!'
\echo '💡 TIP: Use "ALTER TABLE ... DROP CONSTRAINT ..." to modify constraints'

-- =============================================================================
-- B2: BUSINESS LOGIC TRIGGERS - "Enforce business rules"
-- =============================================================================

-- Exercise 4.5: Inventory management triggers
-- Goal: Automatically manage stock levels and alerts
-- TODO: Create triggers for stock management

-- Create low stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    alert_type VARCHAR(50) NOT NULL,  -- 'LOW_STOCK', 'OUT_OF_STOCK', 'RESTOCK'
    current_stock INTEGER,
    threshold_stock INTEGER,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE
);

-- Stock management trigger function
CREATE OR REPLACE FUNCTION manage_stock_levels()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_low_stock_threshold INTEGER := 10;  -- Configurable threshold
    v_alert_message TEXT;
BEGIN
    -- Only process stock updates
    IF TG_OP = 'UPDATE' AND OLD.stock_quantity != NEW.stock_quantity THEN
        
        -- Check for out of stock
        IF NEW.stock_quantity <= 0 AND OLD.stock_quantity > 0 THEN
            INSERT INTO stock_alerts (product_id, alert_type, current_stock, threshold_stock, message)
            VALUES (NEW.id, 'OUT_OF_STOCK', NEW.stock_quantity, v_low_stock_threshold, 
                   'Product "' || NEW.name || '" is now out of stock');
        
        -- Check for low stock
        ELSIF NEW.stock_quantity <= v_low_stock_threshold AND OLD.stock_quantity > v_low_stock_threshold THEN
            INSERT INTO stock_alerts (product_id, alert_type, current_stock, threshold_stock, message)
            VALUES (NEW.id, 'LOW_STOCK', NEW.stock_quantity, v_low_stock_threshold,
                   'Product "' || NEW.name || '" is running low (only ' || NEW.stock_quantity || ' left)');
        
        -- Check for restock (coming back from low/out of stock)
        ELSIF NEW.stock_quantity > v_low_stock_threshold AND OLD.stock_quantity <= v_low_stock_threshold THEN
            -- Mark previous alerts as resolved
            UPDATE stock_alerts 
            SET resolved_at = CURRENT_TIMESTAMP, is_resolved = TRUE
            WHERE product_id = NEW.id AND is_resolved = FALSE;
            
            INSERT INTO stock_alerts (product_id, alert_type, current_stock, threshold_stock, message)
            VALUES (NEW.id, 'RESTOCK', NEW.stock_quantity, v_low_stock_threshold,
                   'Product "' || NEW.name || '" has been restocked (' || NEW.stock_quantity || ' units)');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply stock management trigger
-- DROP TRIGGER IF EXISTS stock_management_trigger ON products;
-- CREATE TRIGGER stock_management_trigger
--     AFTER UPDATE ON products
--     FOR EACH ROW EXECUTE FUNCTION manage_stock_levels();

-- =============================================================================
-- B3: DATA VALIDATION TRIGGERS - "Enforce complex constraints"
-- =============================================================================

-- Exercise 4.6: Advanced validation triggers
-- Goal: Implement business rules that can't be expressed as simple constraints
-- TODO: Create sophisticated validation logic

-- Order validation trigger function
CREATE OR REPLACE FUNCTION validate_order_business_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_order_count INTEGER;
    v_user_total_spending DECIMAL(10,2);
    v_order_item_count INTEGER;
BEGIN
    -- Rule 1: Check if user has too many pending orders (max 5)
    SELECT COUNT(*)
    INTO v_user_order_count
    FROM orders
    WHERE user_id = NEW.user_id AND status IN ('pending', 'processing');
    
    IF v_user_order_count > 5 THEN
        RAISE EXCEPTION 'User cannot have more than 5 pending orders. Current count: %', v_user_order_count;
    END IF;
    
    -- Rule 2: Check minimum order amount ($5.00)
    IF NEW.total_amount < 5.00 THEN
        RAISE EXCEPTION 'Order total must be at least $5.00. Current total: $%', NEW.total_amount;
    END IF;
    
    -- Rule 3: VIP customers get automatic processing
    SELECT COALESCE(SUM(total_amount), 0)
    INTO v_user_total_spending
    FROM orders
    WHERE user_id = NEW.user_id AND status = 'delivered';
    
    IF v_user_total_spending > 1000 AND NEW.status = 'pending' THEN
        NEW.status := 'processing';  -- Auto-approve VIP orders
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply order validation trigger
-- DROP TRIGGER IF EXISTS order_validation_trigger ON orders;
-- CREATE TRIGGER order_validation_trigger
--     BEFORE INSERT OR UPDATE ON orders
--     FOR EACH ROW EXECUTE FUNCTION validate_order_business_rules();



-- =============================================================================
-- PART C: ADVANCED VIEWS & MATERIALIZED VIEWS - "Optimized data access"
-- =============================================================================

-- 💡 Views encapsulate complex queries; Materialized views cache results for performance

-- Exercise 4.7: Create business intelligence views
-- Goal: Build a comprehensive reporting layer
-- TODO: Create views that business users can easily query

-- Customer analytics view
CREATE OR REPLACE VIEW customer_analytics AS
WITH customer_stats AS (
    SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as customer_name,
        u.email,
        u.created_at as customer_since,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as lifetime_value,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        COUNT(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as orders_last_90_days,
        COUNT(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as orders_last_30_days
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at
),
customer_segments AS (
    SELECT *,
        CASE 
            WHEN lifetime_value > 1000 THEN 'VIP'
            WHEN lifetime_value > 500 THEN 'Premium'
            WHEN lifetime_value > 100 THEN 'Regular'
            WHEN lifetime_value > 0 THEN 'New'
            ELSE 'No Purchase'
        END as customer_segment,
        CASE 
            WHEN last_order_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Active'
            WHEN last_order_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'At Risk'
            WHEN last_order_date IS NOT NULL THEN 'Churned'
            ELSE 'Never Purchased'
        END as activity_status
    FROM customer_stats
)
SELECT 
    id,
    customer_name,
    email,
    customer_since,
    total_orders,
    lifetime_value,
    avg_order_value,
    first_order_date,
    last_order_date,
    orders_last_90_days,
    orders_last_30_days,
    customer_segment,
    activity_status,
    EXTRACT(DAYS FROM CURRENT_DATE - last_order_date) as days_since_last_order
FROM customer_segments;

-- Product performance view
CREATE OR REPLACE VIEW product_performance AS
WITH product_stats AS (
    SELECT 
        p.id,
        p.name,
        p.price,
        p.stock_quantity,
        c.name as category,
        COUNT(oi.id) as times_ordered,
        COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count,
        MAX(o.created_at) as last_ordered_date
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id, p.name, p.price, p.stock_quantity, c.name
)
SELECT 
    id,
    name,
    price,
    stock_quantity,
    category,
    times_ordered,
    total_quantity_sold,
    total_revenue,
    ROUND(avg_rating, 2) as avg_rating,
    review_count,
    last_ordered_date,
    CASE 
        WHEN times_ordered = 0 THEN 'Never Ordered'
        WHEN last_ordered_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Popular'
        WHEN last_ordered_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'Moderate'
        ELSE 'Slow Moving'
    END as sales_status,
    CASE 
        WHEN stock_quantity = 0 THEN 'Out of Stock'
        WHEN stock_quantity <= 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM product_stats;

-- =============================================================================
-- 🧪 TESTING THE VIEWS - Exercise 4.7 Examples
-- =============================================================================

\echo '--- Testing Business Intelligence Views ---'

-- Test 1: Customer Analytics View
\echo '🔹 Test 1: Customer Segmentation Analysis'
SELECT 
    customer_segment,
    COUNT(*) as customer_count,
    ROUND(AVG(lifetime_value), 2) as avg_lifetime_value,
    ROUND(AVG(total_orders), 1) as avg_orders_per_customer
FROM customer_analytics 
GROUP BY customer_segment 
ORDER BY customer_count DESC;

-- Test 2: Customer Activity Status
\echo '🔹 Test 2: Customer Activity Analysis'
SELECT 
    activity_status,
    COUNT(*) as customers,
    ROUND(AVG(days_since_last_order), 0) as avg_days_since_order
FROM customer_analytics 
WHERE activity_status != 'Never Purchased'
GROUP BY activity_status 
ORDER BY customers DESC;

-- Test 3: Top Customers by Value
\echo '🔹 Test 3: Top 5 Customers by Lifetime Value'
SELECT 
    customer_name,
    email,
    customer_segment,
    lifetime_value,
    total_orders,
    activity_status
FROM customer_analytics 
ORDER BY lifetime_value DESC 
LIMIT 5;

-- Test 4: Product Performance Overview
\echo '🔹 Test 4: Product Sales Status Summary'
SELECT 
    sales_status,
    COUNT(*) as product_count,
    ROUND(AVG(total_revenue), 2) as avg_revenue,
    ROUND(AVG(avg_rating), 2) as avg_customer_rating
FROM product_performance 
GROUP BY sales_status 
ORDER BY product_count DESC;

-- Test 5: Stock Status Analysis
\echo '🔹 Test 5: Inventory Status Overview'
SELECT 
    stock_status,
    COUNT(*) as products,
    SUM(stock_quantity) as total_stock_units
FROM product_performance 
GROUP BY stock_status 
ORDER BY products DESC;

-- Test 6: Top Revenue Products
\echo '🔹 Test 6: Top 5 Revenue-Generating Products'
SELECT 
    name,
    category,
    total_revenue,
    total_quantity_sold,
    times_ordered,
    avg_rating,
    sales_status
FROM product_performance 
WHERE total_revenue > 0
ORDER BY total_revenue DESC 
LIMIT 5;

-- Test 7: Products Needing Attention
\echo '🔹 Test 7: Products That Need Attention'
SELECT 
    name,
    category,
    stock_status,
    sales_status,
    stock_quantity,
    days_since_last_order,
    CASE 
        WHEN stock_status = 'Out of Stock' AND sales_status = 'Popular' THEN 'URGENT: Restock popular item'
        WHEN stock_status = 'Low Stock' AND sales_status IN ('Popular', 'Moderate') THEN 'WARNING: Low stock on selling item'
        WHEN sales_status = 'Never Ordered' THEN 'REVIEW: Consider discontinuing'
        WHEN sales_status = 'Slow Moving' AND stock_quantity > 50 THEN 'REVIEW: Overstocked slow seller'
        ELSE 'OK'
    END as action_needed
FROM product_performance 
WHERE stock_status IN ('Out of Stock', 'Low Stock') 
   OR sales_status IN ('Never Ordered', 'Slow Moving')
ORDER BY 
    CASE 
        WHEN stock_status = 'Out of Stock' AND sales_status = 'Popular' THEN 1
        WHEN stock_status = 'Low Stock' THEN 2
        WHEN sales_status = 'Never Ordered' THEN 3
        ELSE 4
    END;

-- Test 8: Advanced Customer Insights
\echo '🔹 Test 8: Customer Behavior Insights'
SELECT 
    'VIP Customers' as metric,
    COUNT(*) as count,
    ROUND(AVG(total_orders), 1) as avg_orders,
    ROUND(AVG(orders_last_30_days), 1) as avg_recent_orders
FROM customer_analytics WHERE customer_segment = 'VIP'

UNION ALL

SELECT 
    'At Risk Customers' as metric,
    COUNT(*) as count,
    ROUND(AVG(total_orders), 1) as avg_orders,
    ROUND(AVG(days_since_last_order), 0) as avg_days_inactive
FROM customer_analytics WHERE activity_status = 'At Risk'

UNION ALL

SELECT 
    'Churned Customers' as metric,
    COUNT(*) as count,
    ROUND(AVG(total_orders), 1) as avg_orders,
    ROUND(AVG(days_since_last_order), 0) as avg_days_inactive
FROM customer_analytics WHERE activity_status = 'Churned';

\echo '✅ View testing complete! The views provide powerful business insights.'
\echo '💡 TIP: Views update automatically as underlying data changes!'
\echo '💡 TIP: Use these views in reports, dashboards, and business analysis!'

-- =============================================================================
-- PART D: ADVANCED INDEXING STRATEGIES - "Optimizing for real-world queries"
-- =============================================================================

-- Exercise 4.8: Strategic index creation
-- Goal: Design indexes for common query patterns
-- TODO: Create optimized indexes based on actual usage patterns

-- Composite indexes for common WHERE clause combinations
-- CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at);
-- CREATE INDEX idx_products_category_active_price ON products(category_id, is_active, price);
-- CREATE INDEX idx_order_items_product_date ON order_items(product_id, created_at);

-- Partial indexes for specific conditions
-- CREATE INDEX idx_orders_pending ON orders(user_id, created_at) WHERE status = 'pending';
-- CREATE INDEX idx_products_active ON products(name, price) WHERE is_active = true;


-- Expression indexes for computed queries
-- CREATE INDEX idx_users_full_name ON users(LOWER(first_name || ' ' || last_name));
-- CREATE INDEX idx_orders_total_range ON orders(user_id) WHERE total_amount > 100;

CREATE INDEX idx_users_full_name ON users(LOWER(first_name || ' ' || last_name));
CREATE INDEX idx_orders_total_range ON orders(user_id) WHERE total_amount > 100;

-- =============================================================================
-- 🔧 ADVANCED INDEX MANAGEMENT EXAMPLES
-- =============================================================================

\echo '--- Creating Different Types of Indexes ---'

-- 1. Composite Index (Multiple columns)
\echo '🔹 Creating composite index for common order queries'
CREATE INDEX IF NOT EXISTS idx_orders_user_status_date 
ON orders(user_id, status, created_at);

-- 2. Partial Index (With WHERE condition)
\echo '🔹 Creating partial index for active products only'
CREATE INDEX IF NOT EXISTS idx_products_active_name 
ON products(name, price) 
WHERE is_active = true;

-- 3. Expression Index (On computed values)
\echo '🔹 Creating expression index for email domain searches'
CREATE INDEX IF NOT EXISTS idx_users_email_domain 
ON users(LOWER(SPLIT_PART(email, '@', 2)));

-- 4. Covering Index (Include additional columns)
\echo '🔹 Creating covering index for order lookups'
CREATE INDEX IF NOT EXISTS idx_orders_user_covering 
ON orders(user_id) 
INCLUDE (total_amount, status, created_at);

-- 5. Text Search Index (GIN for full-text search)
\echo '🔹 Creating full-text search index for products'
CREATE INDEX IF NOT EXISTS idx_products_fulltext 
ON products 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 6. JSONB Index (For JSON data - if you have any)
-- CREATE INDEX IF NOT EXISTS idx_audit_log_data 
-- ON audit_log USING GIN(new_values);

\echo '✅ Advanced indexes created successfully!'

-- =============================================================================
-- 📊 INDEX ANALYSIS AND MONITORING
-- =============================================================================

\echo '--- Index Analysis Queries ---'

-- View all indexes on a specific table
\echo '🔍 All indexes on users table:'
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexdef LIKE '%UNIQUE%' THEN 'UNIQUE'
        WHEN indexdef LIKE '%WHERE%' THEN 'PARTIAL'
        WHEN indexdef LIKE '%(%(%' THEN 'EXPRESSION'
        ELSE 'REGULAR'
    END as index_type
FROM pg_indexes 
WHERE tablename = 'users' 
ORDER BY indexname;

-- Check index sizes
\echo '🔍 Index sizes and usage:'
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find unused indexes (potential candidates for removal)
\echo '🔍 Potentially unused indexes:'
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as scan_count
FROM pg_stat_user_indexes 
WHERE idx_scan < 10  -- Adjust threshold as needed
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- 🧪 TESTING INDEX PERFORMANCE
-- =============================================================================

\echo '--- Testing Index Performance ---'

-- Test 1: Query with expression index
\echo '🔹 Test 1: Using expression index for full name search'
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, first_name, last_name, email 
FROM users 
WHERE LOWER(first_name || ' ' || last_name) LIKE '%john%';

-- Test 2: Query with partial index
\echo '🔹 Test 2: Using partial index for active products'
EXPLAIN (ANALYZE, BUFFERS)
SELECT name, price, stock_quantity 
FROM products 
WHERE is_active = true 
  AND price BETWEEN 5.00 AND 15.00;

-- Test 3: Query with composite index
\echo '🔹 Test 3: Using composite index for order queries'
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders 
WHERE user_id = 1 
  AND status = 'delivered' 
ORDER BY created_at DESC;

-- Test 4: Full-text search with GIN index
\echo '🔹 Test 4: Using GIN index for text search'
EXPLAIN (ANALYZE, BUFFERS)
SELECT name, description, price 
FROM products 
WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) 
      @@ to_tsquery('english', 'ramen');

\echo '✅ Index performance tests complete!'
\echo '💡 TIP: Look for "Index Scan" vs "Seq Scan" in EXPLAIN output'
\echo '💡 TIP: Lower execution time = better performance'

-- =============================================================================
-- 🛠️ INDEX MAINTENANCE COMMANDS
-- =============================================================================

\echo '--- Index Maintenance Examples ---'

-- Reindex a specific index (if corrupted or fragmented)
-- REINDEX INDEX idx_users_email;

-- Reindex entire table
-- REINDEX TABLE users;

-- Analyze table to update statistics (helps query planner)
-- ANALYZE users;

-- Check for duplicate/redundant indexes
\echo '🔍 Checking for potentially redundant indexes:'
WITH index_columns AS (
    SELECT 
        schemaname,
        tablename,
        indexname,
        string_agg(attname, ', ' ORDER BY attnum) as columns
    FROM pg_indexes 
    JOIN pg_class ON pg_class.relname = indexname
    JOIN pg_index ON pg_index.indexrelid = pg_class.oid
    JOIN pg_attribute ON pg_attribute.attrelid = pg_index.indrelid 
                      AND pg_attribute.attnum = ANY(pg_index.indkey)
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, indexname
)
SELECT 
    tablename,
    array_agg(indexname) as similar_indexes,
    columns
FROM index_columns
GROUP BY tablename, columns
HAVING COUNT(*) > 1
ORDER BY tablename;

-- =============================================================================
-- TESTING SECTION - "Verify everything works"
-- =============================================================================

-- Test all functions and procedures
\echo '=== TESTING ADVANCED DATABASE FEATURES ==='

-- Test customer lifetime value function
\echo '--- Testing Customer Analytics Function ---'
-- SELECT * FROM get_customer_lifetime_value(1);

-- Test views
\echo '--- Testing Business Intelligence Views ---'
-- SELECT customer_segment, COUNT(*) as customers FROM customer_analytics GROUP BY customer_segment;
-- SELECT sales_status, COUNT(*) as products FROM product_performance GROUP BY sales_status;

-- Test audit system
\echo '--- Testing Audit System ---'
-- UPDATE users SET phone = '555-TEST' WHERE id = 1;
-- SELECT * FROM audit_log WHERE table_name = 'users' ORDER BY changed_at DESC LIMIT 3;

\echo '=== ADVANCED DATABASE DESIGN COMPLETE! ==='

-- =============================================================================
-- KEY CONCEPTS MASTERED
-- =============================================================================

-- ✅ Stored Functions: Reusable calculations and queries
-- ✅ Stored Procedures: Complex business operations with transactions
-- ✅ Audit Triggers: Comprehensive change tracking
-- ✅ Business Logic Triggers: Automated rule enforcement
-- ✅ Validation Triggers: Complex constraint checking
-- ✅ Business Intelligence Views: Optimized reporting layer
-- ✅ Advanced Indexing: Strategic performance optimization
-- ✅ Error Handling: Robust exception management
-- ✅ Transaction Management: ACID compliance in procedures

-- 🎯 Next Level: Database administration, backup/recovery, and scaling strategies
-- 🚀 You now have enterprise-level database design skills! 