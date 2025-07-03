# 🔄 Auto-Generated Database ERD

> Generated on: 2025-06-27T06:46:31.404Z
> Database: learning_db

## Current Database Schema

```mermaid
erDiagram
    PRODUCTS ||--o{ CART_ITEMS : "added_to_cart"
    USERS ||--o{ CART_ITEMS : "has"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered_as"
    USERS ||--o{ ORDERS : "places"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    USERS ||--o{ REVIEWS : "writes"
    PRODUCTS ||--o{ REVIEWS : "receives"

    CART_ITEMS {
        int id PK
        int user_id FK
        int product_id FK
        int quantity
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        int id PK
        string name UK
        text description
        string slug UK
        timestamp created_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_time
        timestamp created_at
    }

    ORDERS {
        int id PK
        int user_id FK
        decimal total_amount
        string status
        text shipping_address
        text billing_address
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        int id PK
        string name
        text description
        decimal price
        int stock_quantity
        string sku UK
        int category_id FK
        string image_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        int id PK
        int user_id FK
        int product_id FK
        int rating
        text comment
        timestamp created_at
    }

    USERS {
        int id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        timestamp created_at
        timestamp updated_at
    }

```

## 📊 Database Statistics

- **Tables**: 7
- **Total Columns**: 50
- **Relationships**: 8

## 🔄 How to Regenerate

To update this ERD after schema changes:

```bash
cd Learning/0.2-Database-Design
node generate-erd.js
```

---
*This ERD was automatically generated from your PostgreSQL database schema.*
