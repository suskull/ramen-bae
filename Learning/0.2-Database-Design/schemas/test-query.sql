SELECT 
    p.name as product_name,
    c.name as category_name,
    p.price,
    p.stock_quantity
FROM products p
INNER JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.price;
