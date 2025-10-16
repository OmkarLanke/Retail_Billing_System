-- Insert default categories for merchant 1
INSERT INTO categories (name, description, merchant_id, created_at, updated_at) VALUES
('Electronics', 'Electronic items and gadgets', 1, NOW(), NOW()),
('Clothing', 'Apparel and fashion items', 1, NOW(), NOW()),
('Books', 'Books and educational materials', 1, NOW(), NOW()),
('Home & Garden', 'Home improvement and garden items', 1, NOW(), NOW()),
('Sports', 'Sports and fitness equipment', 1, NOW(), NOW());

-- Insert default units for merchant 1
INSERT INTO units (name, short_name, merchant_id, created_at, updated_at) VALUES
('BAGS', 'Bag', 1, NOW(), NOW()),
('BOTTLES', 'Btl', 1, NOW(), NOW()),
('BOX', 'Box', 1, NOW(), NOW()),
('BUNDLES', 'Bdl', 1, NOW(), NOW()),
('CANS', 'Can', 1, NOW(), NOW()),
('CARTONS', 'Ctn', 1, NOW(), NOW()),
('DOZENS', 'Dzn', 1, NOW(), NOW()),
('GRAMMES', 'Gm', 1, NOW(), NOW()),
('KILOGRAMS', 'Kg', 1, NOW(), NOW()),
('LITRE', 'Ltr', 1, NOW(), NOW()),
('METERS', 'Mtr', 1, NOW(), NOW()),
('MILILITRE', 'Ml', 1, NOW(), NOW()),
('NUMBERS', 'Nos', 1, NOW(), NOW()),
('PACKS', 'Pac', 1, NOW(), NOW()),
('PAIRS', 'Prs', 1, NOW(), NOW()),
('PIECES', 'Pcs', 1, NOW(), NOW()),
('QUINTAL', 'Qtl', 1, NOW(), NOW()),
('ROLLS', 'Rol', 1, NOW(), NOW()),
('SQUARE FEET', 'Sqf', 1, NOW(), NOW()),
('SQUARE METERS', 'Sqm', 1, NOW(), NOW()),
('TABLETS', 'Tbs', 1, NOW(), NOW());
