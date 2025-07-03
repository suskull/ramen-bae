# 🛠️ Database Learning Environment Setup

This guide provides multiple options to set up your database learning environment.

## 🐳 **Option 1: Docker Setup (Recommended)**

### Prerequisites
First, install Docker Desktop:
- **macOS**: Download from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- **Windows**: Download from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- **Linux**: Follow [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

### Setup Steps
```bash
# 1. Navigate to the database learning folder
cd Learning/0.2-Database-Design

# 2. Start the database environment
docker compose up -d

# 3. Verify containers are running
docker compose ps

# 4. View logs if needed
docker compose logs postgres
docker compose logs pgadmin
```

### Access Information
- **Database Connection**: 
  - Host: `localhost`
  - Port: `5432` 
  - Database: `learning_db`
  - Username: `student`
  - Password: `learn123`

- **pgAdmin Web Interface**: [http://localhost:8080](http://localhost:8080)
  - Email: `student@example.com`
  - Password: `learn123`

### Stop Environment
```bash
# Stop containers
docker compose down

# Stop and remove all data (reset)
docker compose down -v
```

---

## ☁️ **Option 2: Online Database (Quick Start)**

If Docker isn't available, use **ElephantSQL** (free PostgreSQL hosting):

### Setup Steps
1. Go to [https://www.elephantsql.com/](https://www.elephantsql.com/)
2. Create free account
3. Create a new database instance (Tiny Turtle plan - free)
4. Note your connection details:
   ```
   Host: [your-instance].db.elephantsql.com
   Database: [your-database]
   User: [your-user]
   Password: [your-password]
   Port: 5432
   ```

### Access Tools
- **pgAdmin Cloud**: Use [https://www.pgadmin.org/cloud/](https://www.pgadmin.org/cloud/)
- **SQL Editor**: Built into ElephantSQL dashboard

---

## 💻 **Option 3: Local PostgreSQL Installation**

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create learning database
createdb learning_db

# Access database
psql learning_db
```

### Windows 
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run installer with default settings
3. Remember the password you set for 'postgres' user
4. Use pgAdmin (included with installation)

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Switch to postgres user
sudo -u postgres psql

# Create learning database and user
CREATE DATABASE learning_db;
CREATE USER student WITH PASSWORD 'learn123';
GRANT ALL PRIVILEGES ON DATABASE learning_db TO student;
```

---

## 📱 **Option 4: Browser-Based SQL Practice**

For immediate SQL practice without installation:

### Online SQL Editors
- **DB Fiddle**: [https://www.db-fiddle.com/](https://www.db-fiddle.com/) (PostgreSQL support)
- **SQLiteOnline**: [https://sqliteonline.com/](https://sqliteonline.com/) (PostgreSQL mode)
- **W3Schools SQL Tryit**: [https://www.w3schools.com/sql/trysql.asp](https://www.w3schools.com/sql/trysql.asp)

### Sample Schema Setup
Copy our schema files into these online editors to practice.

---

## 🔌 **Testing Your Connection**

### Using Command Line (psql)
```bash
# Connect to database
psql -h localhost -p 5432 -U student -d learning_db

# Or with connection string
psql "postgresql://student:learn123@localhost:5432/learning_db"
```

### Using pgAdmin
1. Open pgAdmin (web or desktop)
2. Add New Server:
   - **Name**: Learning Database
   - **Host**: localhost (or your cloud host)
   - **Port**: 5432
   - **Database**: learning_db
   - **Username**: student
   - **Password**: learn123

### Test Query
Run this to verify everything works:
```sql
-- Test connection
SELECT 'Database connection successful!' as message;

-- Check PostgreSQL version
SELECT version();

-- List databases
\l

-- List tables (should be empty initially)
\dt
```

---

## 🛠️ **Troubleshooting**

### Docker Issues
```bash
# Check if Docker is running
docker --version

# View container logs
docker compose logs postgres

# Reset everything
docker compose down -v
docker system prune -f
```

### Connection Issues
- **Port already in use**: Change port in docker-compose.yml (e.g., `5433:5432`)
- **Permission denied**: Ensure Docker has proper permissions
- **Container won't start**: Check Docker Desktop is running

### pgAdmin Issues
- **Can't access web interface**: Try [http://127.0.0.1:8080](http://127.0.0.1:8080)
- **Login fails**: Check credentials in docker-compose.yml
- **Server connection fails**: Use container name `postgres` as host in pgAdmin

---

## ✅ **Verification Checklist**

Before proceeding with database learning:
- [ ] Database server is running
- [ ] Can connect using credentials
- [ ] pgAdmin (or equivalent) interface is accessible
- [ ] Test query executes successfully
- [ ] Ready to create tables and run SQL commands

---

## 🚀 **Next Steps**

Once your environment is ready:
1. **Create your first table** using SQL
2. **Practice basic queries** with sample data
3. **Design the e-commerce schema**
4. **Learn complex JOINs and relationships**

Choose the setup option that works best for your system and let's start learning databases! 🗄️ 