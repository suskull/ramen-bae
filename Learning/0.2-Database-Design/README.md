# 🗄️ Task 0.2: Database Design & SQL Fundamentals

**Status**: 🚀 **STARTING TODAY!** (January 27, 2025)  
**Estimated Duration**: 2-3 days  
**Difficulty**: ⭐⭐⭐⭐ (Intermediate)

## 🎯 Learning Objectives

### Primary Goals
- [x] Set up database learning environment options
- [x] Design normalized database schemas with proper relationships
- [x] Master SQL queries (SELECT, INSERT, UPDATE, DELETE, JOINs)
- [x] Understand database constraints and indexes
- [x] Learn Entity Relationship Diagrams (ERDs)
- [x] Practice data normalization principles

### Secondary Goals  
- [ ] Learn PostgreSQL-specific features
- [ ] Understand database migrations and versioning
- [ ] Practice query optimization techniques
- [ ] Learn about database security and permissions

## 🏗️ What You'll Build Today

### 1. **Docker PostgreSQL Environment** 
- Local PostgreSQL database in Docker container
- pgAdmin for visual database management
- Practice environment for SQL queries

### 2. **E-commerce Database Schema**
- Users table (authentication, profiles)
- Products table (catalog, inventory)
- Categories table (product organization)
- Orders table (purchase history)
- Order Items table (cart contents)
- Reviews table (customer feedback)
- Proper relationships with foreign keys

### 3. **SQL Query Practice**
- Basic CRUD operations
- Complex JOINs across multiple tables
- Filtering, sorting, and aggregation
- Understanding query performance

## 📁 Planned Folder Structure

```
0.2-Database-Design/
├── README.md                        # This overview
├── theory/                          # Database fundamentals and theory
│   ├── database-fundamentals.md    # Core concepts, normalization, keys
│   └── normalization-exercise.md   # Hands-on practice exercise
├── exercises/                       # SQL practice exercises
│   ├── 01-basic-queries.sql        # SELECT, INSERT, UPDATE, DELETE
│   ├── 02-joins-relations.sql      # JOIN operations
│   └── 03-advanced-queries.sql     # Aggregation, subqueries
├── schemas/                         # Database schema definitions
│   ├── e-commerce-erd.md           # Entity Relationship Diagram
│   ├── schema.sql                  # Complete database schema
│   └── sample-data.sql             # Test data for practice
├── examples/                        # Real-world examples
│   └── sql-vs-frontend.md          # Comparing SQL to JS operations
├── docker-compose.yml               # PostgreSQL + pgAdmin setup
├── setup-guide.md                  # Database environment setup
└── online-practice.md              # Online SQL practice guide
```

## 🚀 **Today's Learning Journey**

### **Step 1: Environment Setup** ⏱️ (30 minutes)
- Set up PostgreSQL in Docker
- Install and configure pgAdmin
- Test database connection

### **Step 2: Database Theory** ⏱️ (45 minutes)  
- [📚 Database Fundamentals](theory/database-fundamentals.md) - Core concepts, keys, relationships
- [🧩 Normalization Exercise](theory/normalization-exercise.md) - Hands-on practice fixing bad database design
- Learn normalization principles (1NF, 2NF, 3NF)
- Understand primary and foreign keys and referential integrity
- Practice ERD design concepts

### **Step 3: Schema Design** ⏱️ (60 minutes)
- Design e-commerce database schema
- Create tables with proper relationships
- Understand why each relationship exists

### **Step 4: SQL Practice** ⏱️ (90 minutes)
- Basic CRUD operations
- Practice JOINs across tables
- Complex queries with filtering and sorting

### **Step 5: Frontend Connection** ⏱️ (30 minutes)
- Compare SQL operations to JavaScript
- Understand how database queries relate to API responses
- Preview how this will connect to your APIs

## 💡 **Why This Matters for Your Ramen Bae Project**

- **Product Catalog**: How to store products, categories, variants
- **User Management**: Storing user profiles and authentication data  
- **Shopping Cart**: Persistent cart storage and order processing
- **Reviews System**: Linking users to products with ratings
- **Order History**: Complex relationships between users, orders, and products
- **Inventory Management**: Tracking stock levels and product availability

## 🔗 **Building on Task 0.1**

Your HTTP API knowledge will connect perfectly:
- **GET /products** → SQL SELECT queries
- **POST /products** → SQL INSERT operations  
- **PUT /products/:id** → SQL UPDATE operations
- **DELETE /products/:id** → SQL DELETE operations

But now you'll understand how to store and retrieve data efficiently with proper relationships!

---

**Ready to dive into databases?** Let's start with setting up your local PostgreSQL environment! 🚀 

# Database Design Learning Module

This module covers comprehensive database design, from basic concepts to advanced enterprise-level features.

## 📚 Learning Path

### ✅ **Completed Modules**
- **Basic SQL Queries** - SELECT, WHERE, GROUP BY, functions
- **Joins and Relations** - INNER, LEFT, RIGHT, FULL OUTER joins
- **Advanced SQL Features** - Window functions, CTEs, complex queries
- **Advanced Database Design** - Triggers, procedures, views, indexes

### 🚀 **Next: Database Administration (DBA)**
**Module:** `05-database-administration/`
**Topics:**
- Database configuration and tuning
- Backup and recovery strategies
- User management and security
- Performance monitoring and optimization
- Scaling strategies (replication, partitioning)
- Production deployment best practices

---

## 🎯 **Current Status**

You've completed the core database design fundamentals! Now you're ready to learn how to:
- Manage databases in production
- Handle backups and disaster recovery
- Monitor and optimize performance
- Scale databases for high traffic
- Secure multi-user environments

The DBA module will prepare you for real-world database operations and administration. 