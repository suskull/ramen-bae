-- =============================================================================
-- 💾 EXERCISE 2: BACKUP & RECOVERY STRATEGIES
-- =============================================================================
--
-- Learning Objectives:
-- 1. Understand different backup types (logical vs physical)
-- 2. Implement automated backup strategies
-- 3. Configure Point-in-Time Recovery (PITR)
-- 4. Practice disaster recovery scenarios
-- 5. Validate backup integrity
-- 6. Design backup retention policies
--
-- Prerequisites:
-- - PostgreSQL instance with superuser access
-- - File system access to PostgreSQL data directory
-- - Understanding of WAL (Write-Ahead Logging)
--
-- =============================================================================

\echo '🏛️ DATABASE ADMINISTRATION MODULE - Exercise 2'
\echo '💾 Backup & Recovery Strategies'
\echo '============================================='

-- =============================================================================
-- PART A: UNDERSTANDING BACKUP METHODS
-- =============================================================================

\echo '--- Part A: Backup Methods Overview ---'

-- A1: Current database state information
\echo '📊 A1: Current database state and size'
SELECT 
    'Database Name' as metric,
    current_database() as value
UNION ALL
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Total Relations' as metric,
    count(*)::text as value
FROM pg_class 
WHERE relkind IN ('r','i','t','v','m','c','f','p')
UNION ALL
SELECT 
    'Data Directory' as metric,
    current_setting('data_directory') as value
UNION ALL
SELECT 
    'WAL Level' as metric,
    current_setting('wal_level') as value
UNION ALL
SELECT 
    'Archive Mode' as metric,
    current_setting('archive_mode') as value;

-- A2: Backup comparison matrix
\echo '📋 A2: Backup method comparison'
CREATE TEMP TABLE backup_comparison AS
SELECT 
    'Logical (pg_dump)' as backup_type,
    'Schema + Data' as content,
    'Cross-version compatible' as portability,
    'Slower for large databases' as performance,
    'Can exclude specific objects' as flexibility,
    'Database must be online' as requirement
UNION ALL
SELECT 
    'Physical (pg_basebackup)' as backup_type,
    'Entire cluster files' as content,
    'Same version required' as portability,
    'Faster for large databases' as performance,
    'All-or-nothing approach' as flexibility,
    'Can backup offline cluster' as requirement
UNION ALL
SELECT 
    'Continuous (WAL archiving)' as backup_type,
    'Transaction log files' as content,
    'Version specific' as portability,
    'Minimal overhead' as performance,
    'Point-in-time recovery' as flexibility,
    'Requires WAL archiving setup' as requirement;

SELECT * FROM backup_comparison;

-- =============================================================================
-- PART B: LOGICAL BACKUPS WITH PG_DUMP
-- =============================================================================

\echo '--- Part B: Logical Backup Strategies ---'

-- B1: Create test data for backup demonstrations
\echo '🧪 B1: Creating test data for backup examples'
DROP TABLE IF EXISTS backup_test_orders;  -- Drop orders first (has foreign key)
DROP TABLE IF EXISTS backup_test_customers;

CREATE TABLE backup_test_customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE backup_test_orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES backup_test_customers(customer_id),
    order_amount DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Insert sample data - CUSTOMERS FIRST!
INSERT INTO backup_test_customers (first_name, last_name, email)
SELECT 
    'Customer' || generate_series,
    'Lastname' || generate_series,
    'customer' || generate_series || '@example.com'
FROM generate_series(1, 1000);

-- Then insert orders that reference existing customers
-- Use a subquery to ensure we only reference existing customer_ids
INSERT INTO backup_test_orders (customer_id, order_amount, status)
SELECT 
    (SELECT customer_id FROM backup_test_customers ORDER BY random() LIMIT 1) as customer_id,
    (random() * 500 + 10)::DECIMAL(10,2),
    CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'completed'
        ELSE 'cancelled'
    END
FROM generate_series(1, 5000);

\echo '✅ Test data created: 1,000 customers, 5,000 orders'

-- B2: Generate pg_dump commands for different scenarios
\echo '📝 B2: pg_dump command examples'

\echo ''
\echo '=== LOGICAL BACKUP COMMANDS ==='
\echo ''
\echo '# 1. Full database backup (compressed)'
\echo 'pg_dump -h localhost -U student -d learning_db -c -C -f backup_full.sql.gz -Z 9'
\echo ''
\echo '# 2. Schema-only backup'
\echo 'pg_dump -h localhost -U student -d learning_db -s -f backup_schema.sql'
\echo ''
\echo '# 3. Data-only backup'
\echo 'docker exec learning-postgres pg_dump -h localhost -U student -d learning_db -a -f backup_data.sql'
\echo ''
\echo '# 4. Specific table backup'
\echo 'docker exec learning-postgres pg_dump -h localhost -U student -d learning_db -t backup_test_customers -f customers_backup.sql'
\echo ''
\echo '# 5. Custom format (for pg_restore)'
\echo 'docker exec learning-postgres pg_dump -h localhost -U student -d learning_db -F c -f backup_custom.dump'
\echo ''
\echo '# 6. Directory format (parallel backup)'
\echo 'docker exec learning-postgres pg_dump -h localhost -U student -d learning_db -F d -j 4 -f backup_directory/'
\echo ''

-- B3: Demonstrate backup verification queries
\echo '🔍 B3: Pre-backup verification queries'

-- Record current state for backup validation
CREATE TEMP TABLE backup_verification AS
SELECT 
    'backup_test_customers' as table_name,
    count(*) as row_count,
    pg_size_pretty(pg_total_relation_size('backup_test_customers')) as table_size,
    max(customer_id) as max_id,
    CURRENT_TIMESTAMP as backup_time
FROM backup_test_customers
UNION ALL
SELECT 
    'backup_test_orders' as table_name,
    count(*) as row_count,
    pg_size_pretty(pg_total_relation_size('backup_test_orders')) as table_size,
    max(order_id) as max_id,
    CURRENT_TIMESTAMP as backup_time
FROM backup_test_orders;

SELECT * FROM backup_verification;

-- =============================================================================
-- PART C: PHYSICAL BACKUPS AND PITR SETUP
-- =============================================================================

\echo '--- Part C: Physical Backup & Point-in-Time Recovery ---'

-- C1: WAL archiving configuration check
\echo '🔄 C1: WAL archiving configuration status'
SELECT 
    name,
    setting,
    short_desc
FROM pg_settings 
WHERE name IN (
    'wal_level',
    'archive_mode',
    'archive_command',
    'max_wal_senders',
    'wal_keep_segments'  -- PostgreSQL < 13
)
ORDER BY name;

-- C2: Current WAL information
\echo '📄 C2: Current WAL status'
SELECT 
    'Current WAL File' as metric,
    pg_walfile_name(pg_current_wal_lsn()) as value
UNION ALL
SELECT 
    'Current WAL LSN' as metric,
    pg_current_wal_lsn()::text as value
UNION ALL
SELECT 
    'WAL Directory Size' as metric,
    pg_size_pretty(sum(size)) as value
FROM pg_ls_waldir()
UNION ALL
SELECT 
    'WAL Files Count' as metric,
    count(*)::text as value
FROM pg_ls_waldir();

-- C3: Sample WAL archiving configuration
\echo '⚙️ C3: Sample WAL archiving configuration'
\echo ''
\echo '=== WAL ARCHIVING SETUP ==='
\echo ''
\echo '# Add to postgresql.conf:'
\echo 'wal_level = replica'
\echo 'archive_mode = on'
\echo 'archive_command = ''cp %p /var/lib/postgresql/wal_archive/%f'''
\echo 'max_wal_senders = 3'
\echo ''
\echo '# Create archive directory:'
\echo 'mkdir -p /var/lib/postgresql/wal_archive'
\echo 'chown postgres:postgres /var/lib/postgresql/wal_archive'
\echo 'chmod 700 /var/lib/postgresql/wal_archive'
\echo ''
\echo '# Restart PostgreSQL after configuration changes'
\echo ''

-- C4: Physical backup commands
\echo '💿 C4: Physical backup commands'
\echo ''
\echo '=== PHYSICAL BACKUP COMMANDS ==='
\echo ''
\echo '# 1. Full cluster backup'
\echo 'pg_basebackup -h localhost -U postgres -D /backup/postgres_base -c fast -P -v'
\echo ''
\echo '# 2. Compressed backup'
\echo 'docker exec learning-postgres pg_basebackup -h localhost -U student -D - -F t -z | gzip > /backup/postgres_base.tar.gz'
\echo ''
\echo '# 3. Backup with WAL files included'
\echo 'docker exec learning-postgres pg_basebackup -h localhost -U postgres -D /backup/postgres_base -x -c fast -P -v'
\echo ''

-- =============================================================================
-- PART D: BACKUP VALIDATION AND INTEGRITY
-- =============================================================================

\echo '--- Part D: Backup Validation ---'

-- D1: Backup integrity checking functions
\echo '🔍 D1: Creating backup validation functions'

CREATE OR REPLACE FUNCTION validate_backup_integrity(
    backup_path TEXT
) RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    -- This is a conceptual function - actual implementation would vary
    RETURN QUERY
    SELECT 
        'File Existence'::TEXT as check_name,
        'PASS'::TEXT as status,
        'Backup file found at specified path'::TEXT as details
    UNION ALL
    SELECT 
        'File Size'::TEXT as check_name,
        'PASS'::TEXT as status,
        'Backup file size is reasonable'::TEXT as details
    UNION ALL
    SELECT 
        'Timestamp'::TEXT as check_name,
        'PASS'::TEXT as status,
        'Backup timestamp is recent'::TEXT as details;
END;
$$;

-- D2: Database consistency checks
\echo '🔍 D2: Database consistency verification'
CREATE OR REPLACE FUNCTION check_database_consistency()
RETURNS TABLE (
    check_type TEXT,
    table_name TEXT,
    status TEXT,
    issue_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
    -- Check foreign key constraints
    RETURN QUERY
    SELECT 
        'Foreign Key Violations'::TEXT as check_type,
        'backup_test_orders'::TEXT as table_name,
        CASE 
            WHEN count(*) = 0 THEN 'PASS'
            ELSE 'FAIL'
        END as status,
        count(*) as issue_count
    FROM backup_test_orders o
    LEFT JOIN backup_test_customers c ON o.customer_id = c.customer_id
    WHERE c.customer_id IS NULL;
    
    -- Check for NULL violations in NOT NULL columns
    RETURN QUERY
    SELECT 
        'NOT NULL Violations'::TEXT as check_type,
        'backup_test_customers'::TEXT as table_name,
        CASE 
            WHEN count(*) = 0 THEN 'PASS'
            ELSE 'FAIL'
        END as status,
        count(*) as issue_count
    FROM backup_test_customers
    WHERE first_name IS NULL OR last_name IS NULL OR email IS NULL;
END;
$$;

-- Run consistency checks
SELECT * FROM check_database_consistency();

-- =============================================================================
-- PART E: DISASTER RECOVERY SCENARIOS
-- =============================================================================

\echo '--- Part E: Disaster Recovery Scenarios ---'

-- E1: Simulated data corruption scenario
\echo '🚨 E1: Simulating disaster scenarios'

-- Create a backup point
CREATE TEMP TABLE disaster_recovery_checkpoint AS
SELECT 
    'Pre-disaster' as checkpoint_name,
    count(*) as customer_count,
    sum(order_amount) as total_order_value,
    CURRENT_TIMESTAMP as checkpoint_time
FROM backup_test_customers c
JOIN backup_test_orders o ON c.customer_id = o.customer_id;

SELECT * FROM disaster_recovery_checkpoint;

-- Simulate accidental data deletion
\echo '💥 Simulating accidental data deletion...'
-- Note: In a real scenario, this would be a genuine accident
DELETE FROM backup_test_orders WHERE order_date < CURRENT_DATE - INTERVAL '30 days';

-- Check the damage
\echo '📊 Damage assessment:'
SELECT 
    'Post-disaster' as checkpoint_name,
    count(*) as customer_count,
    COALESCE(sum(order_amount), 0) as total_order_value,
    CURRENT_TIMESTAMP as checkpoint_time
FROM backup_test_customers c
LEFT JOIN backup_test_orders o ON c.customer_id = o.customer_id;

-- E2: Recovery planning checklist
\echo '📋 E2: Disaster recovery checklist'

CREATE TEMP TABLE recovery_checklist AS
SELECT 
    1 as step_order,
    'Assess Damage' as step_name,
    'Identify scope of data loss or corruption' as description,
    'Critical' as priority,
    '✅' as status
UNION ALL
SELECT 
    2, 'Stop Applications', 'Prevent further damage by stopping write operations', 'Critical', '⏳'
UNION ALL
SELECT 
    3, 'Identify Recovery Point', 'Determine the latest good backup or WAL position', 'High', '⏳'
UNION ALL
SELECT 
    4, 'Prepare Recovery Environment', 'Set up clean recovery environment', 'High', '⏳'
UNION ALL
SELECT 
    5, 'Restore Base Backup', 'Restore from latest base backup', 'High', '⏳'
UNION ALL
SELECT 
    6, 'Apply WAL Files', 'Replay WAL files to recovery point', 'Medium', '⏳'
UNION ALL
SELECT 
    7, 'Validate Recovery', 'Verify data integrity and completeness', 'Critical', '⏳'
UNION ALL
SELECT 
    8, 'Update Applications', 'Point applications to recovered database', 'High', '⏳';

SELECT * FROM recovery_checklist ORDER BY step_order;

-- =============================================================================
-- PART F: AUTOMATED BACKUP STRATEGIES
-- =============================================================================

\echo '--- Part F: Automated Backup Strategy ---'

-- F1: Backup schedule recommendations
\echo '📅 F1: Recommended backup schedule'

CREATE TEMP TABLE backup_schedule AS
SELECT 
    'Full Backup' as backup_type,
    'Weekly (Sunday 2 AM)' as frequency,
    'pg_basebackup + WAL archiving' as method,
    'Complete cluster recovery' as purpose,
    '30 days' as retention,
    'High' as storage_cost
UNION ALL
SELECT 
    'Incremental WAL', 'Continuous', 'WAL archiving', 'Point-in-time recovery', '7 days', 'Low'
UNION ALL
SELECT 
    'Logical Dump', 'Daily (1 AM)', 'pg_dump', 'Schema changes, dev/test', '14 days', 'Medium'
UNION ALL
SELECT 
    'Schema Only', 'After DDL changes', 'pg_dump -s', 'Structure backup', '90 days', 'Very Low'
UNION ALL
SELECT 
    'Critical Tables', 'Every 4 hours', 'pg_dump -t', 'High-value data', '7 days', 'Low';

SELECT * FROM backup_schedule ORDER BY 
    CASE backup_type 
        WHEN 'Full Backup' THEN 1
        WHEN 'Incremental WAL' THEN 2
        WHEN 'Logical Dump' THEN 3
        WHEN 'Schema Only' THEN 4
        WHEN 'Critical Tables' THEN 5
    END;

-- F2: Backup monitoring queries
\echo '📊 F2: Backup monitoring queries'

-- Last successful backup tracking (conceptual)
CREATE TEMP TABLE backup_monitoring AS
SELECT 
    'Full Backup' as backup_type,
    CURRENT_TIMESTAMP - INTERVAL '3 days' as last_backup,
    'SUCCESS' as last_status,
    '2.3 GB' as backup_size,
    '/backup/postgres_full_20241027.tar.gz' as backup_location
UNION ALL
SELECT 
    'WAL Archive', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'SUCCESS', '16 MB', '/wal_archive/'
UNION ALL
SELECT 
    'Logical Dump', CURRENT_TIMESTAMP - INTERVAL '1 day', 'SUCCESS', '450 MB', '/backup/logical_20241027.sql'
UNION ALL
SELECT 
    'Schema Backup', CURRENT_TIMESTAMP - INTERVAL '7 days', 'SUCCESS', '2 MB', '/backup/schema_20241021.sql';

SELECT 
    backup_type,
    last_backup,
    last_status,
    backup_size,
    CASE 
        WHEN last_backup < CURRENT_TIMESTAMP - INTERVAL '1 day' AND backup_type = 'WAL Archive' 
        THEN '🔴 OVERDUE'
        WHEN last_backup < CURRENT_TIMESTAMP - INTERVAL '7 days' AND backup_type = 'Full Backup' 
        THEN '🔴 OVERDUE'
        WHEN last_backup < CURRENT_TIMESTAMP - INTERVAL '2 days' AND backup_type = 'Logical Dump' 
        THEN '🟡 WARNING'
        ELSE '✅ OK'
    END as backup_status
FROM backup_monitoring;

-- =============================================================================
-- PART G: POINT-IN-TIME RECOVERY (PITR) EXAMPLE
-- =============================================================================

\echo '--- Part G: Point-in-Time Recovery Setup ---'

-- G1: PITR configuration example
\echo '⏰ G1: Point-in-Time Recovery configuration'

\echo ''
\echo '=== PITR RECOVERY EXAMPLE ==='
\echo ''
\echo '# 1. Stop PostgreSQL'
\echo 'systemctl stop postgresql'
\echo ''
\echo '# 2. Backup current data directory (if recoverable)'
\echo 'mv /var/lib/postgresql/13/main /var/lib/postgresql/13/main.damaged'
\echo ''
\echo '# 3. Restore base backup'
\echo 'tar -xzf /backup/postgres_base.tar.gz -C /var/lib/postgresql/13/main'
\echo ''
\echo '# 4. Create recovery.signal file'
\echo 'touch /var/lib/postgresql/13/main/recovery.signal'
\echo ''
\echo '# 5. Configure recovery in postgresql.conf or recovery.conf'
\echo 'restore_command = ''cp /var/lib/postgresql/wal_archive/%f %p'''
\echo 'recovery_target_time = ''2024-10-27 14:30:00'''
\echo ''
\echo '# 6. Start PostgreSQL (recovery mode)'
\echo 'systemctl start postgresql'
\echo ''
\echo '# 7. Monitor recovery progress'
\echo 'tail -f /var/log/postgresql/postgresql-13-main.log'
\echo ''

-- G2: Recovery validation queries
\echo '✅ G2: Post-recovery validation queries'

CREATE OR REPLACE FUNCTION validate_recovery()
RETURNS TABLE (
    validation_check TEXT,
    result TEXT,
    details TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Database Accessibility'::TEXT,
        'PASS'::TEXT,
        'Database is accessible and accepting connections'::TEXT
    UNION ALL
    SELECT 
        'Transaction Log Consistency'::TEXT,
        CASE 
            WHEN pg_is_in_recovery() THEN 'IN RECOVERY'
            ELSE 'NORMAL'
        END,
        'Check if database is still in recovery mode'::TEXT
    UNION ALL
    SELECT 
        'Data Integrity'::TEXT,
        CASE 
            WHEN (SELECT count(*) FROM backup_test_customers) > 0 THEN 'PASS'
            ELSE 'FAIL'
        END,
        'Verify critical data is present'::TEXT
    UNION ALL
    SELECT 
        'Recovery Target Achievement'::TEXT,
        'MANUAL CHECK REQUIRED'::TEXT,
        'Verify recovery stopped at intended point in time'::TEXT;
END;
$$;

-- =============================================================================
-- PART H: BACKUP RETENTION AND CLEANUP
-- =============================================================================

\echo '--- Part H: Backup Retention Policy ---'

-- H1: Retention policy matrix
\echo '🗂️ H1: Backup retention policy recommendations'

CREATE TEMP TABLE retention_policy AS
SELECT 
    'Daily Backups' as backup_category,
    '7 days' as retention_period,
    'Quick recovery for recent issues' as purpose,
    'Delete after 7 days' as cleanup_action,
    'Automated via cron job' as cleanup_method
UNION ALL
SELECT 
    'Weekly Backups', '4 weeks', 'Monthly recovery needs', 'Keep 4 most recent', 'Automated retention script'
UNION ALL
SELECT 
    'Monthly Backups', '12 months', 'Long-term recovery', 'Keep 12 most recent', 'Manual review + automation'
UNION ALL
SELECT 
    'Yearly Backups', '7 years', 'Compliance and archival', 'Legal/compliance based', 'Manual review required'
UNION ALL
SELECT 
    'WAL Archives', '7 days', 'PITR within backup window', 'Delete older than base backup', 'pg_archivecleanup';

SELECT * FROM retention_policy;

-- H2: Cleanup automation examples
\echo '🧹 H2: Backup cleanup script examples'

\echo ''
\echo '=== BACKUP CLEANUP SCRIPTS ==='
\echo ''
\echo '# 1. Clean old logical backups (keep 7 days)'
\echo 'find /backup/logical/ -name "*.sql" -mtime +7 -delete'
\echo ''
\echo '# 2. Clean old WAL archives (after successful base backup)'
\echo 'pg_archivecleanup /wal_archive/ $(ls /wal_archive/ | tail -1)'
\echo ''
\echo '# 3. Verify backup integrity before cleanup'
\echo 'for backup in /backup/*.tar.gz; do'
\echo '    if tar -tzf "$backup" >/dev/null 2>&1; then'
\echo '        echo "Backup $backup is valid"'
\echo '    else'
\echo '        echo "Backup $backup is corrupted - DO NOT DELETE"'
\echo '    fi'
\echo 'done'
\echo ''

-- =============================================================================
-- CLEANUP AND SUMMARY
-- =============================================================================

\echo '--- Exercise 2 Summary ---'

-- Restore the deleted data to clean up our test
INSERT INTO backup_test_orders (customer_id, order_amount, status, order_date)
SELECT 
    (random() * 1000 + 1)::INTEGER,
    (random() * 500 + 10)::DECIMAL(10,2),
    'restored',
    CURRENT_DATE - (random() * 30)::INTEGER
FROM generate_series(1, (SELECT 5000 - count(*) FROM backup_test_orders));

\echo '✅ Exercise 2 Complete: Backup & Recovery Strategies'
\echo ''
\echo '📚 What you learned:'
\echo '- Logical vs Physical backup strategies'
\echo '- Point-in-Time Recovery (PITR) setup'
\echo '- Disaster recovery planning and execution'
\echo '- Backup validation and integrity checking'
\echo '- Automated backup scheduling'
\echo '- Retention policies and cleanup procedures'
\echo ''
\echo '🎯 Next Steps:'
\echo '1. Implement automated backup scripts for your environment'
\echo '2. Test restore procedures in development'
\echo '3. Document your disaster recovery runbook'
\echo '4. Move to Exercise 3: User Management & Security'
\echo ''
\echo '⚠️  Important Reminders:'
\echo '- Test backups regularly by performing restores'
\echo '- Store backups in multiple locations'
\echo '- Document all recovery procedures'
\echo '- Monitor backup job success/failure'
\echo '- Keep retention policy updated with business needs'

-- Clean up test objects (keep for potential use in next exercises)
-- DROP TABLE IF EXISTS backup_test_orders;
-- DROP TABLE IF EXISTS backup_test_customers;

\echo ''
\echo '🚀 Ready for Exercise 3: User Management & Security!' 