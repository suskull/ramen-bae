-- =============================================================================
-- 🔧 EXERCISE 1: DATABASE CONFIGURATION & PERFORMANCE TUNING
-- =============================================================================
--
-- Learning Objectives:
-- 1. Understand PostgreSQL configuration parameters
-- 2. Optimize memory settings for performance
-- 3. Configure connection management
-- 4. Tune Write-Ahead Logging (WAL)
-- 5. Optimize query planner settings
-- 6. Monitor configuration changes impact
--
-- Prerequisites:
-- - PostgreSQL instance with superuser access
-- - Basic understanding of system resources (RAM, CPU, disk)
--
-- =============================================================================

\echo '🏛️ DATABASE ADMINISTRATION MODULE - Exercise 1'
\echo '🔧 Configuration & Performance Tuning'
\echo '============================================='

-- =============================================================================
-- PART A: UNDERSTANDING CURRENT CONFIGURATION
-- =============================================================================

\echo '--- Part A: Current Configuration Analysis ---'

-- A1: View current database configuration
\echo '🔍 A1: Current key configuration parameters'
SELECT 
    name,
    setting,
    unit,
    context,
    short_desc
FROM pg_settings 
WHERE name IN (
    'shared_buffers',
    'effective_cache_size', 
    'work_mem',
    'maintenance_work_mem',
    'max_connections',
    'checkpoint_completion_target',
    'wal_buffers',
    'random_page_cost',
    'effective_io_concurrency'
)
ORDER BY name;

-- A2: Check system resources
\echo '🔍 A2: System resource information'
SELECT 
    'Total RAM' as resource,
    pg_size_pretty(
        CAST(
            substring(
                pg_read_file('/proc/meminfo'), 
                'MemTotal:\s+(\d+)'
            ) AS bigint
        ) * 1024
    ) as value
WHERE EXISTS (SELECT 1 FROM pg_stat_file('/proc/meminfo'))
UNION ALL
SELECT 
    'PostgreSQL Version' as resource,
    version() as value
UNION ALL
SELECT 
    'Data Directory' as resource,
    current_setting('data_directory') as value
UNION ALL
SELECT 
    'Config File' as resource,
    current_setting('config_file') as value;

-- A3: Current connection and activity stats
\echo '🔍 A3: Current database activity'
SELECT 
    'Active Connections' as metric,
    count(*)::text as value
FROM pg_stat_activity 
WHERE state = 'active'
UNION ALL
SELECT 
    'Total Connections' as metric,
    count(*)::text as value
FROM pg_stat_activity
UNION ALL
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Shared Buffers Hit Ratio' as metric,
    ROUND(
        100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 2
    )::text || '%' as value
FROM pg_stat_database;

-- =============================================================================
-- PART B: MEMORY CONFIGURATION OPTIMIZATION
-- =============================================================================

\echo '--- Part B: Memory Configuration Guidelines ---'

-- B1: Calculate optimal memory settings
\echo '🧮 B1: Recommended memory configuration'

-- This is a demonstration of calculation logic
-- In practice, you would modify postgresql.conf file
WITH system_info AS (
    SELECT 
        -- Assume 8GB RAM for calculation (adjust based on your system)
        8 * 1024 * 1024 * 1024 as total_ram_bytes,
        current_setting('max_connections')::int as current_max_conn
),
recommendations AS (
    SELECT 
        total_ram_bytes,
        current_max_conn,
        -- Shared buffers: 25% of RAM (common starting point)
        (total_ram_bytes * 0.25)::bigint as recommended_shared_buffers,
        -- Effective cache size: 75% of RAM
        (total_ram_bytes * 0.75)::bigint as recommended_effective_cache,
        -- Work mem: 4MB per connection (conservative)
        (4 * 1024 * 1024) as recommended_work_mem,
        -- Maintenance work mem: 1GB or 5% of RAM
        GREATEST(1024 * 1024 * 1024, (total_ram_bytes * 0.05)::bigint) as recommended_maint_work_mem
    FROM system_info
)
SELECT 
    'Current shared_buffers' as setting,
    current_setting('shared_buffers') as current_value,
    pg_size_pretty(recommended_shared_buffers) as recommended_value,
    'Portion of RAM for shared data cache' as description
FROM recommendations
UNION ALL
SELECT 
    'Current effective_cache_size' as setting,
    current_setting('effective_cache_size') as current_value,
    pg_size_pretty(recommended_effective_cache) as recommended_value,
    'Estimated disk cache available to PostgreSQL' as description
FROM recommendations
UNION ALL
SELECT 
    'Current work_mem' as setting,
    current_setting('work_mem') as current_value,
    pg_size_pretty(recommended_work_mem) as recommended_value,
    'Memory for sort operations and hash tables' as description
FROM recommendations
UNION ALL
SELECT 
    'Current maintenance_work_mem' as setting,
    current_setting('maintenance_work_mem') as current_value,
    pg_size_pretty(recommended_maint_work_mem) as recommended_value,
    'Memory for maintenance operations (VACUUM, CREATE INDEX)' as description
FROM recommendations;

-- B2: Connection-related settings analysis
\echo '🔗 B2: Connection configuration analysis'
SELECT 
    'max_connections' as parameter,
    current_setting('max_connections') as current_value,
    CASE 
        WHEN current_setting('max_connections')::int > 200 THEN 
            'Consider connection pooling for better performance'
        WHEN current_setting('max_connections')::int < 50 THEN 
            'May be too low for production workloads'
        ELSE 'Acceptable range'
    END as recommendation
UNION ALL
SELECT 
    'superuser_reserved_connections' as parameter,
    current_setting('superuser_reserved_connections') as current_value,
    'Reserve connections for emergency access' as recommendation
UNION ALL
SELECT 
    'shared_preload_libraries' as parameter,
    current_setting('shared_preload_libraries') as current_value,
    'Libraries loaded at server start (requires restart to change)' as recommendation;

-- =============================================================================
-- PART C: WRITE-AHEAD LOGGING (WAL) CONFIGURATION
-- =============================================================================

\echo '--- Part C: WAL Configuration Analysis ---'

-- C1: Current WAL settings
\echo '📝 C1: Write-Ahead Logging configuration'
SELECT 
    name,
    setting,
    unit,
    short_desc
FROM pg_settings 
WHERE name IN (
    'wal_level',
    'wal_buffers',
    'checkpoint_completion_target',
    'checkpoint_timeout',
    'max_wal_size',
    'min_wal_size',
    'wal_compression',
    'synchronous_commit'
)
ORDER BY name;

-- C2: WAL statistics and performance
\echo '📊 C2: WAL performance statistics'
SELECT 
    'WAL files generated' as metric,
    count(*) as value
FROM pg_ls_waldir()
UNION ALL
SELECT 
    'Current WAL location' as metric,
    pg_current_wal_lsn()::text as value
UNION ALL
SELECT 
    'WAL directory size' as metric,
    pg_size_pretty(
        sum(size)
    ) as value
FROM pg_ls_waldir();

-- C3: Checkpoint statistics
\echo '✅ C3: Checkpoint performance'
SELECT 
    checkpoints_timed + checkpoints_req as total_checkpoints,
    checkpoints_timed,
    checkpoints_req,
    checkpoint_write_time,
    checkpoint_sync_time,
    ROUND(
        100.0 * checkpoints_req / NULLIF(checkpoints_timed + checkpoints_req, 0), 
        2
    ) as pct_req_checkpoints
FROM pg_stat_bgwriter;

-- =============================================================================
-- PART D: QUERY PLANNER OPTIMIZATION
-- =============================================================================

\echo '--- Part D: Query Planner Configuration ---'

-- D1: Planner cost parameters
\echo '💰 D1: Query planner cost settings'
SELECT 
    name,
    setting,
    unit,
    short_desc
FROM pg_settings 
WHERE name IN (
    'random_page_cost',
    'seq_page_cost',
    'cpu_tuple_cost',
    'cpu_index_tuple_cost',
    'cpu_operator_cost',
    'effective_io_concurrency',
    'default_statistics_target'
)
ORDER BY name;

-- D2: Storage type recommendations
\echo '💾 D2: Storage-based recommendations'
SELECT 
    'Storage Type' as category,
    'SSD' as type,
    'random_page_cost = 1.1' as recommendation,
    'SSDs have low random access penalty' as reason
UNION ALL
SELECT 
    'Storage Type' as category,
    'HDD (Traditional)' as type,
    'random_page_cost = 4.0' as recommendation,
    'HDDs have high random access penalty' as reason
UNION ALL
SELECT 
    'I/O Concurrency' as category,
    'RAID or SAN' as type,
    'effective_io_concurrency = 200' as recommendation,
    'Multiple disks can handle concurrent requests' as reason
UNION ALL
SELECT 
    'I/O Concurrency' as category,
    'Single Disk' as type,
    'effective_io_concurrency = 1' as recommendation,
    'Single disk cannot benefit from parallelism' as reason;

-- =============================================================================
-- PART E: PERFORMANCE TESTING SETUP
-- =============================================================================

\echo '--- Part E: Performance Testing Framework ---'

-- E1: Create test table for performance testing
\echo '🧪 E1: Setting up performance test environment'
DROP TABLE IF EXISTS perf_test_table;
CREATE TABLE perf_test_table (
    id SERIAL PRIMARY KEY,
    data_text TEXT,
    data_number INTEGER,
    data_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    random_value DOUBLE PRECISION DEFAULT random()
);

-- E2: Insert test data
\echo '📊 E2: Generating test data (50,000 rows)'
INSERT INTO perf_test_table (data_text, data_number)
SELECT 
    'Test data row ' || generate_series,
    (random() * 1000000)::INTEGER
FROM generate_series(1, 50000);

-- E3: Create indexes for testing
\echo '📇 E3: Creating test indexes'
CREATE INDEX idx_perf_test_number ON perf_test_table(data_number);
CREATE INDEX idx_perf_test_timestamp ON perf_test_table(data_timestamp);

-- E4: Update table statistics
ANALYZE perf_test_table;

-- =============================================================================
-- PART F: PERFORMANCE MONITORING QUERIES
-- =============================================================================

\echo '--- Part F: Performance Monitoring ---'

-- F1: Buffer cache hit ratio
\echo '📈 F1: Buffer cache performance'
SELECT 
    'Buffer Hit Ratio' as metric,
    ROUND(
        100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 
        2
    ) || '%' as value,
    CASE 
        WHEN ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 2) >= 95 
        THEN '✅ Excellent'
        WHEN ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 2) >= 90 
        THEN '🟡 Good'
        ELSE '🔴 Needs Attention'
    END as status
FROM pg_stat_database
WHERE datname = current_database();

-- F2: Connection utilization
\echo '🔗 F2: Connection utilization'
WITH connection_stats AS (
    SELECT 
        current_setting('max_connections')::int as max_conn,
        count(*) as current_conn,
        count(*) FILTER (WHERE state = 'active') as active_conn
    FROM pg_stat_activity
)
SELECT 
    'Max Connections' as metric,
    max_conn::text as value,
    '100%' as percentage
FROM connection_stats
UNION ALL
SELECT 
    'Current Connections' as metric,
    current_conn::text as value,
    ROUND(100.0 * current_conn / max_conn, 1) || '%' as percentage
FROM connection_stats
UNION ALL
SELECT 
    'Active Connections' as metric,
    active_conn::text as value,
    ROUND(100.0 * active_conn / max_conn, 1) || '%' as percentage
FROM connection_stats;

-- F3: Table and index sizes
\echo '💾 F3: Storage utilization'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(
        pg_total_relation_size(schemaname||'.'||tablename) - 
        pg_relation_size(schemaname||'.'||tablename)
    ) as indexes_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- =============================================================================
-- PART G: CONFIGURATION RECOMMENDATIONS
-- =============================================================================

\echo '--- Part G: Configuration Recommendations ---'

-- G1: Generate configuration recommendations
\echo '⚙️ G1: Configuration optimization recommendations'

-- Create a view with recommendations
CREATE OR REPLACE VIEW config_recommendations AS
WITH system_analysis AS (
    SELECT 
        current_setting('shared_buffers') as current_shared_buffers,
        current_setting('effective_cache_size') as current_effective_cache,
        current_setting('work_mem') as current_work_mem,
        current_setting('max_connections')::int as current_max_conn,
        current_setting('random_page_cost')::numeric as current_random_cost
)
SELECT 
    'Memory Optimization' as category,
    'shared_buffers' as parameter,
    current_shared_buffers as current_value,
    '25% of available RAM' as recommended_value,
    'Increase if you have sufficient RAM' as action_needed,
    'High' as priority
FROM system_analysis
UNION ALL
SELECT 
    'Memory Optimization' as category,
    'work_mem' as parameter,
    current_work_mem as current_value,
    '4MB per expected concurrent connection' as recommended_value,
    'Monitor query performance and adjust' as action_needed,
    'Medium' as priority
FROM system_analysis
UNION ALL
SELECT 
    'Connection Management' as category,
    'max_connections' as parameter,
    current_max_conn::text as current_value,
    '100-200 for most applications' as recommended_value,
    CASE 
        WHEN current_max_conn > 300 THEN 'Consider connection pooling'
        WHEN current_max_conn < 50 THEN 'May need to increase'
        ELSE 'Current setting is reasonable'
    END as action_needed,
    'High' as priority
FROM system_analysis
UNION ALL
SELECT 
    'Storage Optimization' as category,
    'random_page_cost' as parameter,
    current_random_cost::text as current_value,
    '1.1 for SSD, 4.0 for HDD' as recommended_value,
    'Adjust based on storage type' as action_needed,
    'Medium' as priority
FROM system_analysis;

-- Display recommendations
SELECT * FROM config_recommendations ORDER BY category, priority DESC;

-- =============================================================================
-- PART H: PRACTICAL CONFIGURATION EXAMPLE
-- =============================================================================

\echo '--- Part H: Sample Configuration File ---'

\echo '📄 H1: Sample postgresql.conf optimizations'
\echo ''
\echo '# ============================================='
\echo '# SAMPLE POSTGRESQL.CONF OPTIMIZATIONS'
\echo '# ============================================='
\echo ''
\echo '# Memory Settings (adjust based on available RAM)'
\echo '# For 8GB RAM system:'
\echo 'shared_buffers = 2GB                    # 25% of RAM'
\echo 'effective_cache_size = 6GB              # 75% of RAM'
\echo 'work_mem = 4MB                          # Per connection'
\echo 'maintenance_work_mem = 512MB            # For maintenance ops'
\echo ''
\echo '# Connection Settings'
\echo 'max_connections = 200                   # Adjust based on needs'
\echo 'superuser_reserved_connections = 3      # Emergency connections'
\echo ''
\echo '# WAL Settings'
\echo 'wal_buffers = 16MB                      # WAL buffer size'
\echo 'checkpoint_completion_target = 0.9      # Spread checkpoints'
\echo 'max_wal_size = 4GB                      # Maximum WAL size'
\echo 'min_wal_size = 1GB                      # Minimum WAL size'
\echo ''
\echo '# Query Planner Settings'
\echo '# For SSD storage:'
\echo 'random_page_cost = 1.1                  # SSD random access cost'
\echo 'effective_io_concurrency = 200          # Concurrent I/O'
\echo ''
\echo '# For HDD storage:'
\echo '# random_page_cost = 4.0               # HDD random access cost'
\echo '# effective_io_concurrency = 2         # Limited concurrency'
\echo ''
\echo '# Logging Settings'
\echo 'log_min_duration_statement = 1000       # Log slow queries (1s+)'
\echo 'log_checkpoints = on                    # Log checkpoint activity'
\echo 'log_connections = on                    # Log connections'
\echo 'log_disconnections = on                 # Log disconnections'
\echo 'log_lock_waits = on                     # Log lock waits'
\echo ''

-- =============================================================================
-- CLEANUP AND SUMMARY
-- =============================================================================

\echo '--- Exercise 1 Summary ---'

\echo '✅ Exercise 1 Complete: Configuration & Performance Tuning'
\echo ''
\echo '📚 What you learned:'
\echo '- How to analyze current PostgreSQL configuration'
\echo '- Memory optimization strategies'
\echo '- WAL (Write-Ahead Logging) tuning'
\echo '- Query planner optimization'
\echo '- Performance monitoring techniques'
\echo '- Configuration best practices'
\echo ''
\echo '🎯 Next Steps:'
\echo '1. Review the configuration recommendations'
\echo '2. Test configuration changes in development first'
\echo '3. Monitor performance impact of changes'
\echo '4. Move to Exercise 2: Backup & Recovery'
\echo ''
\echo '⚠️  Important Notes:'
\echo '- Always backup before making configuration changes'
\echo '- Some changes require PostgreSQL restart'
\echo '- Test in development before applying to production'
\echo '- Monitor system resources after changes'

-- Drop test objects
DROP VIEW IF EXISTS config_recommendations;
-- Note: Keeping perf_test_table for use in subsequent exercises

\echo ''
\echo '🚀 Ready for Exercise 2: Backup & Recovery!' 