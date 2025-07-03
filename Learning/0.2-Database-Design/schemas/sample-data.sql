-- 🍜 Sample Data for E-commerce Learning Database
-- Ramen shop themed data for practice
-- Run this AFTER schema.sql

-- =============================================================================
-- SAMPLE USERS
-- =============================================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', 'John', 'Doe', '555-0101'),
('jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', 'Jane', 'Smith', '555-0102'),
('alice.johnson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', 'Alice', 'Johnson', '555-0103'),
('bob.wilson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', 'Bob', 'Wilson', '555-0104'),
('carol.davis@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', 'Carol', 'Davis', '555-0105');

-- =============================================================================
-- SAMPLE CATEGORIES
-- =============================================================================
INSERT INTO categories (name, description, slug) VALUES
('Instant Ramen', 'Quick and delicious instant ramen noodles', 'instant-ramen'),
('Fresh Ramen', 'Premium fresh ramen with authentic broth', 'fresh-ramen'),
('Toppings', 'Delicious toppings to enhance your ramen', 'toppings'),
('Beverages', 'Drinks that pair perfectly with ramen', 'beverages'),
('Snacks', 'Japanese snacks and sides', 'snacks');

-- =============================================================================
-- SAMPLE PRODUCTS
-- =============================================================================
INSERT INTO products (name, description, price, stock_quantity, sku, category_id, image_url, is_active) VALUES
-- Instant Ramen
('Shoyu Instant Ramen', 'Classic soy sauce based instant ramen with rich umami flavor', 3.99, 100, 'IR-SHOYU-001', 1, '/images/shoyu-instant.jpg', true),
('Miso Instant Ramen', 'Hearty miso-based instant ramen with fermented soybean paste', 4.49, 85, 'IR-MISO-001', 1, '/images/miso-instant.jpg', true),
('Tonkotsu Instant Ramen', 'Rich pork bone broth instant ramen, creamy and indulgent', 4.99, 75, 'IR-TONK-001', 1, '/images/tonkotsu-instant.jpg', true),
('Spicy Kimchi Ramen', 'Korean-style instant ramen with spicy kimchi flavor', 4.29, 60, 'IR-KIMC-001', 1, '/images/kimchi-instant.jpg', true),

-- Fresh Ramen
('Premium Shoyu Ramen', 'Authentic shoyu ramen with handmade noodles and rich broth', 14.99, 25, 'FR-SHOYU-001', 2, '/images/fresh-shoyu.jpg', true),
('Miso Ramen Deluxe', 'Premium miso ramen with chashu pork and soft-boiled egg', 16.99, 20, 'FR-MISO-001', 2, '/images/fresh-miso.jpg', true),
('Tonkotsu Ramen Special', 'Rich 24-hour tonkotsu broth with tender chashu and bamboo shoots', 18.99, 15, 'FR-TONK-001', 2, '/images/fresh-tonkotsu.jpg', true),
('Vegetarian Miso Ramen', 'Plant-based miso ramen with tofu and seasonal vegetables', 15.99, 30, 'FR-VEG-001', 2, '/images/fresh-veg.jpg', true),

-- Toppings
('Chashu Pork Slices', 'Tender braised pork belly slices, perfect ramen topping', 5.99, 50, 'TOP-CHAS-001', 3, '/images/chashu.jpg', true),
('Soft-Boiled Eggs (2pc)', 'Perfectly soft-boiled ramen eggs with seasoned yolk', 3.99, 80, 'TOP-EGG-002', 3, '/images/ramen-eggs.jpg', true),
('Bamboo Shoots', 'Crisp menma bamboo shoots, traditional ramen topping', 2.99, 40, 'TOP-BAMB-001', 3, '/images/bamboo.jpg', true),
('Green Onions', 'Fresh chopped scallions for garnish', 1.99, 100, 'TOP-ONION-001', 3, '/images/green-onions.jpg', true),
('Nori Seaweed Sheets', 'Premium nori seaweed sheets for authentic flavor', 2.49, 75, 'TOP-NORI-001', 3, '/images/nori.jpg', true),

-- Beverages
('Japanese Green Tea', 'Premium sencha green tea, hot or iced', 2.99, 120, 'BEV-TEA-001', 4, '/images/green-tea.jpg', true),
('Ramune Soda', 'Classic Japanese marble soda in assorted flavors', 3.49, 90, 'BEV-RAM-001', 4, '/images/ramune.jpg', true),
('Sake (Hot)', 'Premium sake served hot in traditional style', 8.99, 30, 'BEV-SAKE-001', 4, '/images/hot-sake.jpg', true),
('Asahi Beer', 'Crisp Japanese lager beer, perfect with ramen', 4.99, 60, 'BEV-BEER-001', 4, '/images/asahi.jpg', true),

-- Snacks
('Gyoza (6pc)', 'Pan-fried pork and vegetable dumplings', 7.99, 40, 'SNK-GYOZA-006', 5, '/images/gyoza.jpg', true),
('Karaage Chicken', 'Japanese fried chicken with crispy coating', 8.99, 35, 'SNK-KARA-001', 5, '/images/karaage.jpg', true),
('Edamame', 'Steamed and salted young soybeans', 4.99, 70, 'SNK-EDAM-001', 5, '/images/edamame.jpg', true),
('Takoyaki (6pc)', 'Octopus balls with takoyaki sauce and bonito flakes', 9.99, 25, 'SNK-TAKO-006', 5, '/images/takoyaki.jpg', true);

-- =============================================================================
-- SAMPLE ORDERS
-- =============================================================================
INSERT INTO orders (user_id, total_amount, status, shipping_address, billing_address) VALUES
(1, 23.97, 'delivered', '123 Main St, Anytown, ST 12345', '123 Main St, Anytown, ST 12345'),
(2, 45.96, 'shipped', '456 Oak Ave, Springfield, ST 67890', '456 Oak Ave, Springfield, ST 67890'),
(3, 31.94, 'processing', '789 Pine Rd, Hometown, ST 11111', '789 Pine Rd, Hometown, ST 11111'),
(1, 18.98, 'delivered', '123 Main St, Anytown, ST 12345', '123 Main St, Anytown, ST 12345'),
(4, 67.93, 'pending', '321 Elm St, Newcity, ST 22222', '321 Elm St, Newcity, ST 22222');

-- =============================================================================
-- SAMPLE ORDER ITEMS
-- =============================================================================
INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES
-- Order 1 (John's first order)
(1, 1, 2, 3.99),  -- 2x Shoyu Instant Ramen
(1, 10, 2, 3.99), -- 2x Soft-Boiled Eggs
(1, 14, 1, 2.99), -- 1x Japanese Green Tea
(1, 17, 1, 7.99), -- 1x Gyoza

-- Order 2 (Jane's order)
(2, 5, 1, 14.99), -- 1x Premium Shoyu Ramen
(2, 6, 1, 16.99), -- 1x Miso Ramen Deluxe
(2, 9, 1, 5.99),  -- 1x Chashu Pork
(2, 15, 2, 3.49), -- 2x Ramune Soda

-- Order 3 (Alice's order)
(3, 2, 3, 4.49),  -- 3x Miso Instant Ramen
(3, 11, 2, 2.99), -- 2x Bamboo Shoots
(3, 12, 1, 1.99), -- 1x Green Onions
(3, 18, 1, 8.99), -- 1x Karaage Chicken

-- Order 4 (John's second order)
(4, 3, 1, 4.99),  -- 1x Tonkotsu Instant Ramen
(4, 4, 1, 4.29),  -- 1x Spicy Kimchi Ramen
(4, 13, 3, 2.49), -- 3x Nori Seaweed
(4, 16, 1, 8.99), -- 1x Sake

-- Order 5 (Bob's large order)
(5, 7, 2, 18.99), -- 2x Tonkotsu Ramen Special
(5, 9, 2, 5.99),  -- 2x Chashu Pork
(5, 10, 4, 3.99), -- 4x Soft-Boiled Eggs
(5, 19, 1, 4.99), -- 1x Edamame
(5, 20, 1, 9.99); -- 1x Takoyaki

-- =============================================================================
-- SAMPLE CART ITEMS (Current shopping carts)
-- =============================================================================
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
-- John's current cart
(1, 8, 1),  -- 1x Vegetarian Miso Ramen
(1, 11, 2), -- 2x Bamboo Shoots

-- Jane's current cart
(2, 3, 2),  -- 2x Tonkotsu Instant Ramen
(2, 17, 1), -- 1x Gyoza
(2, 14, 1), -- 1x Japanese Green Tea

-- Carol's cart (new customer)
(5, 1, 3),  -- 3x Shoyu Instant Ramen
(5, 2, 3),  -- 3x Miso Instant Ramen
(5, 10, 6), -- 6x Soft-Boiled Eggs
(5, 15, 2); -- 2x Ramune Soda

-- =============================================================================
-- SAMPLE REVIEWS
-- =============================================================================
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
-- Reviews for instant ramen
(1, 1, 5, 'Amazing flavor! Just like the ramen shops in Japan. Highly recommended!'),
(2, 1, 4, 'Really good for instant ramen. The broth has great depth of flavor.'),
(3, 2, 5, 'The miso flavor is incredible. This is my go-to instant ramen now.'),
(1, 2, 4, 'Very satisfying and authentic taste. Good value for money.'),
(4, 3, 5, 'Rich and creamy broth, just like restaurant quality!'),
(2, 4, 3, 'Good spice level, but could use more kimchi flavor.'),

-- Reviews for fresh ramen
(2, 5, 5, 'Absolutely incredible! The handmade noodles make all the difference.'),
(3, 6, 5, 'Best miso ramen I have ever had. The chashu melts in your mouth.'),
(1, 7, 4, 'Amazing tonkotsu broth, though a bit expensive. Worth it for special occasions.'),
(4, 8, 5, 'Finally, a great vegetarian option! The vegetables are fresh and flavorful.'),

-- Reviews for toppings
(1, 9, 5, 'Perfect chashu! Tender, flavorful, and exactly what ramen needs.'),
(2, 10, 5, 'These eggs are perfection. Creamy yolk and perfect seasoning.'),
(3, 11, 4, 'Good quality bamboo shoots. Adds nice texture to the ramen.'),
(4, 13, 4, 'Premium nori with great ocean flavor. Really enhances the broth.'),

-- Reviews for beverages
(1, 14, 4, 'Refreshing and pairs well with ramen. Good quality tea.'),
(2, 15, 5, 'Love ramune! The marble gimmick never gets old, and it tastes great.'),
(4, 16, 5, 'Excellent sake, served at perfect temperature. Great with ramen.'),

-- Reviews for snacks
(1, 17, 5, 'Crispy on outside, juicy inside. These gyoza are restaurant quality!'),
(3, 18, 4, 'Delicious karaage! Crispy coating and tender chicken.'),
(2, 19, 3, 'Good edamame, though a bit salty for my taste.'),
(4, 20, 5, 'Amazing takoyaki! Just like the ones from Osaka street vendors.');

-- =============================================================================
-- DATA SUMMARY
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Sample data inserted successfully!';
    RAISE NOTICE '👥 Users: 5 customers ready to shop';
    RAISE NOTICE '🏷️ Categories: 5 product categories (Instant, Fresh, Toppings, Beverages, Snacks)';
    RAISE NOTICE '🍜 Products: 20 delicious ramen products and toppings';
    RAISE NOTICE '📦 Orders: 5 orders with various statuses';
    RAISE NOTICE '🛒 Cart Items: 3 active shopping carts';
    RAISE NOTICE '⭐ Reviews: 20+ authentic customer reviews';
    RAISE NOTICE '🚀 Ready for SQL practice queries!';
END $$; 