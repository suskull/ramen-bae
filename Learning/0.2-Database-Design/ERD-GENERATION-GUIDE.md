# 🎯 Database ERD Generation Guide

> **When your database schema changes, here's how to quickly generate updated ERDs**

## 🚀 **Quick Start (Recommended)**

```bash
cd Learning/0.2-Database-Design
./update-erd.sh
```

This will automatically:
- ✅ Check if your database is running
- ✅ Generate a fresh ERD from your current schema
- ✅ Update your documentation files

---

## 🛠️ **Method 1: Automated Script (Best for Development)**

### **What it does:**
- Connects to your PostgreSQL database
- Reads current schema structure
- Generates Mermaid ERD automatically
- Updates documentation files

### **Files created:**
- `schemas/generated-erd.md` - Auto-generated, don't edit manually
- Updates `schemas/e-commerce-erd.md` - Your main documentation

### **Usage:**
```bash
# One-time setup (if not done already)
npm install pg

# Generate ERD whenever schema changes
node generate-erd.js

# Or use the convenience script
./update-erd.sh
```

---

## 🖥️ **Method 2: pgAdmin Visual ERD (Best for Presentations)**

### **Access pgAdmin:**
1. **Open**: http://localhost:8080
2. **Login**: 
   - Email: `student@example.com`
   - Password: `learn123`

### **Generate Visual ERD:**
1. **Connect to database**:
   - Right-click "Servers" → "Register" → "Server"
   - **Name**: `Learning DB`
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database**: `learning_db`
   - **Username**: `student`
   - **Password**: `learn123`

2. **Create ERD**:
   - Right-click your database → **"Generate ERD"**
   - Select tables to include
   - Customize layout and appearance
   - **Export** as PNG/SVG for presentations

### **Pros:**
- ✅ Beautiful visual diagrams
- ✅ Interactive layout
- ✅ Professional export options
- ✅ Great for documentation and presentations

---

## 📊 **Method 3: Command Line Schema Export**

### **Export Full Schema:**
```bash
# Get complete schema structure
docker exec learning-postgres pg_dump -U student -d learning_db --schema-only --no-privileges --no-owner > current-schema.sql

# Get just table definitions
docker exec learning-postgres psql -U student -d learning_db -c "\dt" > table-list.txt

# Get relationships
docker exec learning-postgres psql -U student -d learning_db -c "
SELECT 
  tc.table_name as source_table,
  kcu.column_name as source_column,
  ccu.table_name as target_table,
  ccu.column_name as target_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';"
```

### **Pros:**
- ✅ Complete schema details
- ✅ Good for backup/documentation
- ✅ Can be version controlled

---

## 🌐 **Method 4: Online ERD Tools**

### **Using dbdiagram.io:**
1. Export your schema: `docker exec learning-postgres pg_dump -U student -d learning_db --schema-only > schema.sql`
2. Visit: https://dbdiagram.io
3. **Paste schema** or use their import feature
4. **Generate beautiful ERDs** with custom styling

### **Using draw.io (now diagrams.net):**
1. Visit: https://app.diagrams.net
2. **New Diagram** → **Entity Relation**
3. **Manually create** based on your schema
4. **Export** as PNG/SVG/PDF

### **Using Mermaid Live:**
1. Copy the mermaid code from `generated-erd.md`
2. Visit: https://mermaid.live
3. **Paste and preview** your ERD
4. **Export** as PNG/SVG

---

## 🔄 **Workflow: When Database Changes**

### **Development Workflow:**
```bash
# 1. Make database changes (add tables, columns, etc.)
# ... your SQL changes here ...

# 2. Update ERD documentation
cd Learning/0.2-Database-Design
./update-erd.sh

# 3. Commit both code and updated ERD
git add schemas/ generate-erd.js
git commit -m "feat: update database schema and ERD"
```

### **Team Collaboration:**
- **Keep ERDs in version control** for team sync
- **Update ERDs with schema changes** to avoid confusion  
- **Use generated ERDs** for code reviews and planning

---

## 📁 **File Organization**

```
Learning/0.2-Database-Design/
├── schemas/
│   ├── e-commerce-erd.md          # 📝 Main ERD documentation
│   ├── generated-erd.md           # 🤖 Auto-generated (don't edit)
│   ├── schema.sql                 # 🗃️ Database creation scripts
│   └── sample-data.sql            # 📊 Test data
├── generate-erd.js                # 🔧 ERD generation script
├── update-erd.sh                  # 🚀 Convenience script
├── package.json                   # 📦 Node.js dependencies
└── ERD-GENERATION-GUIDE.md        # 📋 This guide
```

---

## 🎯 **Best Practices**

### **✅ DO:**
- **Update ERDs immediately** after schema changes
- **Use version control** for ERD files
- **Include ERDs in code reviews**
- **Keep both visual and code formats** (PNG + Mermaid)
- **Document complex relationships** with comments

### **❌ DON'T:**
- **Manually edit** `generated-erd.md` (it gets overwritten)
- **Forget to update ERDs** when changing schema
- **Include test/temporary tables** in production ERDs
- **Make ERDs too complex** (split large schemas)

---

## 🔧 **Troubleshooting**

### **Database Connection Issues:**
```bash
# Check if containers are running
docker ps | grep learning

# Start database if not running
docker-compose up -d

# Check database connectivity
docker exec learning-postgres psql -U student -d learning_db -c "SELECT version();"
```

### **Node.js Issues:**
```bash
# Install/update dependencies
npm install pg

# Check Node.js version
node --version  # Should be >= 14

# Test database connection
node -e "const {Client} = require('pg'); const client = new Client({host:'localhost',port:5432,database:'learning_db',user:'student',password:'learn123'}); client.connect().then(() => console.log('✅ Connected')).catch(console.error);"
```

### **Permission Issues:**
```bash
# Make script executable
chmod +x update-erd.sh

# Check file permissions
ls -la *.sh *.js
```

---

## 📚 **Additional Resources**

- **Mermaid Documentation**: https://mermaid.js.org/syntax/entityRelationshipDiagram.html
- **pgAdmin ERD Guide**: https://www.pgadmin.org/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Database Design Best Practices**: [Your Learning Materials](./theory/database-fundamentals.md)

---

*Happy ERD generating! 🎉* 