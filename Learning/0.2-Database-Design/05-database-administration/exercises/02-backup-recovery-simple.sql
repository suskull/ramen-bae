-- =============================================================================
-- 💾 SIMPLE BACKUP & RECOVERY GUIDE
-- =============================================================================
--
-- 🎯 Learning Goals:
-- 1. Understand what a database backup is
-- 2. Learn the 2 main types of backups
-- 3. Practice making simple backups
-- 4. Test restoring from backups
--
-- 🏁 Prerequisites: 
-- - Docker PostgreSQL container running
-- - Basic SQL knowledge
--
-- =============================================================================

\echo '🏛️ SIMPLE DATABASE BACKUP GUIDE'
\echo '================================'

-- =============================================================================
-- PART 1: WHAT IS A BACKUP? 
-- =============================================================================

\echo '--- Part 1: Understanding Backups ---'

\echo '💡 What is a database backup?'
\echo 'A backup is like a "save file" for your entire database.'
\echo 'If something goes wrong, you can restore from the backup.'
\echo ''

-- Let's see what we currently have in our database
\echo '📊 Current database contents:'
SELECT 
    'Database Name' as info,
    current_database() as value
UNION ALL
SELECT 
    'Database Size',
    pg_size_pretty(pg_database_size(current_database()))
UNION ALL
SELECT 
    'Number of Tables',
    count(*)::text
FROM information_schema.tables 
WHERE table_schema = 'public';

-- =============================================================================
-- PART 2: CREATE SOME TEST DATA
-- =============================================================================

\echo '--- Part 2: Creating Test Data ---'

-- Let's create simple test data to backup
\echo '🧪 Creating test data to practice with...'

DROP TABLE IF EXISTS simple_users CASCADE;
DROP TABLE IF EXISTS simple_posts CASCADE;

-- Create users table
CREATE TABLE simple_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE simple_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES simple_users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some test data
INSERT INTO simple_users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Carol Brown', 'carol@example.com'),
    ('David Wilson', 'david@example.com'),
    ('Emma Davis', 'emma@example.com');

INSERT INTO simple_posts (user_id, title, content) VALUES
    (1, 'My First Post', 'Hello world! This is my first blog post.'),
    (1, 'Learning SQL', 'SQL is quite interesting once you get the hang of it.'),
    (2, 'Database Tips', 'Always backup your data regularly!'),
    (3, 'Weekend Plans', 'Going hiking this weekend. Should be fun!'),
    (4, 'Book Review', 'Just finished reading a great book about databases.'),
    (5, 'Recipe Share', 'Here is my favorite pasta recipe...');

\echo '✅ Test data created!'
\echo '   - 5 users'
\echo '   - 6 posts'

-- Let's see our data
\echo '👀 Current data:'
SELECT 'Users' as table_name, count(*) as rows FROM simple_users
UNION ALL
SELECT 'Posts' as table_name, count(*) as rows FROM simple_posts;

-- =============================================================================
-- PART 3: TWO TYPES OF BACKUPS
-- =============================================================================

\echo '--- Part 3: Two Main Backup Types ---'

\echo '📚 There are 2 main types of backups:'
\echo ''
\echo '1. 📄 LOGICAL BACKUP (pg_dump)'
\echo '   - Saves data as SQL commands'
\echo '   - Human readable'
\echo '   - Can backup specific tables'
\echo '   - Works across different PostgreSQL versions'
\echo ''
\echo '2. 💿 PHYSICAL BACKUP (pg_basebackup)'
\echo '   - Copies the actual database files'
\echo '   - Much faster for large databases'
\echo '   - Backs up everything at once'
\echo '   - Same PostgreSQL version required'
\echo ''

-- =============================================================================
-- PART 4: LOGICAL BACKUPS (BEGINNER FRIENDLY)
-- =============================================================================

\echo '--- Part 4: Making Logical Backups ---'

\echo '📄 LOGICAL BACKUP COMMANDS:'
\echo ''
\echo '# 1. Backup entire database:'
\echo 'docker exec learning-postgres pg_dump -U student learning_db > my_backup.sql'
\echo ''
\echo '# 2. Backup just one table:'
\echo 'docker exec learning-postgres pg_dump -U student learning_db -t simple_users > users_backup.sql'
\echo ''
\echo '# 3. Backup with compression (smaller file):'
\echo 'docker exec learning-postgres pg_dump -U student learning_db | gzip > my_backup.sql.gz'
\echo ''

-- Record what we have now (for comparison later)
CREATE TEMP TABLE before_changes AS
SELECT 'before_disaster' as checkpoint, count(*) as user_count
FROM simple_users;

SELECT * FROM before_changes;

-- =============================================================================
-- PART 5: SIMULATE A DISASTER
-- =============================================================================

\echo '--- Part 5: Oops! Something Went Wrong ---'

\echo '💥 Simulating a data disaster...'
\echo '   (In real life, this could be accidental deletion, corruption, etc.)'

-- Simulate accidental data loss
DELETE FROM simple_posts WHERE user_id IN (1, 2);
DELETE FROM simple_users WHERE id IN (1, 2);

\echo '😱 Disaster occurred!'
\echo '   - Lost 2 users'
\echo '   - Lost their posts'

-- See the damage
\echo '📊 After disaster:'
SELECT 'Users' as table_name, count(*) as rows FROM simple_users
UNION ALL
SELECT 'Posts' as table_name, count(*) as rows FROM simple_posts;

-- =============================================================================
-- PART 6: RECOVERY COMMANDS
-- =============================================================================

\echo '--- Part 6: How to Restore from Backup ---'

\echo '🔄 RESTORE COMMANDS:'
\echo ''
\echo '# 1. Restore entire database:'
\echo 'docker exec -i learning-postgres psql -U student learning_db < my_backup.sql'
\echo ''
\echo '# 2. Restore from compressed backup:'
\echo 'gunzip -c my_backup.sql.gz | docker exec -i learning-postgres psql -U student learning_db'
\echo ''
\echo '# 3. Restore specific table (more complex):'
\echo 'docker exec -i learning-postgres psql -U student learning_db < users_backup.sql'
\echo ''

\echo '⚠️  IMPORTANT RESTORE NOTES:'
\echo '1. Restoring usually REPLACES existing data'
\echo '2. Always test restores on a copy first'
\echo '3. Stop applications before restoring production data'
\echo '4. Double-check you have the right backup file'

-- =============================================================================
-- PART 7: PHYSICAL BACKUPS (SIMPLE VERSION)
-- =============================================================================

\echo '--- Part 7: Physical Backups (Advanced) ---'

\echo '💿 PHYSICAL BACKUP COMMANDS:'
\echo ''
\echo '# 1. Full server backup:'
\echo 'docker exec learning-postgres pg_basebackup -U student -D /tmp/full_backup -P -v'
\echo ''
\echo '# 2. Compressed physical backup:'
\echo 'docker exec learning-postgres pg_basebackup -U student -D - -F t | gzip > physical_backup.tar.gz'
\echo ''

\echo '📝 When to use physical backups:'
\echo '  - Large databases (>10GB)'
\echo '  - Need fastest backup speed'
\echo '  - Production environments'
\echo '  - Complete disaster recovery'

-- =============================================================================
-- PART 8: BACKUP BEST PRACTICES (SIMPLE)
-- =============================================================================

\echo '--- Part 8: Simple Backup Best Practices ---'

\echo '✅ BACKUP BEST PRACTICES:'
\echo ''
\echo '1. 📅 SCHEDULE REGULAR BACKUPS'
\echo '   - Daily for important data'
\echo '   - Weekly for less critical data'
\echo ''
\echo '2. 🧪 TEST YOUR BACKUPS'
\echo '   - Try restoring to a test database'
\echo '   - Make sure backup files aren''t corrupted'
\echo ''
\echo '3. 📍 STORE BACKUPS SAFELY'
\echo '   - Keep copies in different locations'
\echo '   - Don''t store backups on the same server'
\echo ''
\echo '4. 🏷️  NAME BACKUPS CLEARLY'
\echo '   - Include date: backup_2024-01-15.sql'
\echo '   - Include what: users_backup_2024-01-15.sql'
\echo ''
\echo '5. 🗑️  CLEAN UP OLD BACKUPS'
\echo '   - Keep daily backups for 1 week'
\echo '   - Keep weekly backups for 1 month'
\echo '   - Keep monthly backups for 1 year'

-- =============================================================================
-- PART 9: PRACTICAL EXERCISE
-- =============================================================================

\echo '--- Part 9: Your Turn to Practice ---'

\echo '🎯 PRACTICE EXERCISE:'
\echo ''
\echo 'Try these commands in your terminal:'
\echo ''
\echo '1. Make a backup of your current database:'
\echo '   docker exec learning-postgres pg_dump -U student learning_db > practice_backup.sql'
\echo ''
\echo '2. Check the backup file was created:'
\echo '   ls -lh practice_backup.sql'
\echo ''
\echo '3. Look at the first few lines of your backup:'
\echo '   head -20 practice_backup.sql'
\echo ''
\echo '4. Check the file size:'
\echo '   du -h practice_backup.sql'

-- =============================================================================
-- PART 10: WHAT YOU LEARNED
-- =============================================================================

\echo '--- Part 10: Summary ---'

\echo '🎓 WHAT YOU LEARNED:'
\echo ''
\echo '✅ What database backups are and why they matter'
\echo '✅ Two main backup types:'
\echo '   - Logical (pg_dump) - SQL format, flexible'
\echo '   - Physical (pg_basebackup) - file copy, fast'
\echo '✅ Basic backup commands for your Docker setup'
\echo '✅ How to restore from backups'
\echo '✅ Simple backup best practices'
\echo ''
\echo '🚀 NEXT STEPS:'
\echo '1. Practice making backups of your own data'
\echo '2. Try restoring a backup to test it works'
\echo '3. Set up a simple backup schedule'
\echo '4. Learn about automated backup scripts'
\echo ''
\echo '💡 REMEMBER:'
\echo 'The best backup is the one you actually make and test!'

-- Restore our test data for next exercises
INSERT INTO simple_users (id, name, email, created_at) VALUES
    (1, 'Alice Johnson', 'alice@example.com', CURRENT_TIMESTAMP),
    (2, 'Bob Smith', 'bob@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO simple_posts (user_id, title, content) VALUES
    (1, 'My First Post', 'Hello world! This is my first blog post.'),
    (1, 'Learning SQL', 'SQL is quite interesting once you get the hang of it.'),
    (2, 'Database Tips', 'Always backup your data regularly!')
ON CONFLICT DO NOTHING;

\echo ''
\echo '✅ Simple Backup Exercise Complete!'
\echo '🎉 You now understand the basics of database backups!' 