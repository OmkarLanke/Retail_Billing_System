-- Fix sale_items table structure to match entity
ALTER TABLE sale_items DROP COLUMN IF EXISTS price_per_unit;
ALTER TABLE sale_items DROP COLUMN IF EXISTS discount;
ALTER TABLE sale_items DROP COLUMN IF EXISTS tax_rate;

-- Add missing columns
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS price DECIMAL(19, 2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(19, 2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(19, 2);

-- Make price NOT NULL after adding it
ALTER TABLE sale_items ALTER COLUMN price SET NOT NULL;

-- Change quantity from DECIMAL to INTEGER
ALTER TABLE sale_items ALTER COLUMN quantity TYPE INTEGER USING quantity::INTEGER;
