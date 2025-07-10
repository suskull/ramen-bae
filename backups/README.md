# 📦 Database Backups

This folder contains database backups for easy data transfer between computers.

## 🚀 Quick Setup on New Computer

### 1. Clone the repository
```bash
git clone <your-repo>
cd Learning/0.2-Database-Design
```

### 2. Start Docker environment
```bash
docker compose up -d
```

### 3. Load the latest backup
```bash
# Find the latest backup file
ls backups/

# Restore the data (replace filename with actual backup)
docker exec -i learning-postgres psql -U student -d learning_db < backups/learning-data-YYYYMMDD.sql
```

## 🔄 Creating New Backups

```bash
# Create new backup with current date
docker exec learning-postgres pg_dump -U student learning_db > backups/learning-data-$(date +%Y%m%d).sql

# Commit to git
git add backups/
git commit -m "Database backup $(date +%Y-%m-%d)"
```

## 📋 Files Explanation

- `learning-data-YYYYMMDD.sql` - Complete database backup from specific date
- Contains all tables, data, and structure
- Can be restored to any PostgreSQL database

## 💡 Best Practices

1. **Regular backups** - Create backups before major changes
2. **Descriptive names** - Add notes for important milestones
3. **Git history** - Keep backups in version control
4. **Test restores** - Verify backups work before relying on them 