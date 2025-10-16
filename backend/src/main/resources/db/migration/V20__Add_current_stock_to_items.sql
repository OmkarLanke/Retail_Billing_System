-- Add current_stock column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS current_stock INT DEFAULT 0;

-- Update existing items to have current_stock = 0 if null
UPDATE items SET current_stock = 0 WHERE current_stock IS NULL;
