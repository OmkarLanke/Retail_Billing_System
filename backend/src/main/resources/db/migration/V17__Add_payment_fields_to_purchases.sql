-- Add payment-related fields to purchases table
ALTER TABLE purchases 
ADD COLUMN paid_amount DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN balance_amount DECIMAL(15,2) DEFAULT 0.00;

-- Update existing records to have paid_amount equal to total_amount (assuming all were fully paid)
UPDATE purchases 
SET paid_amount = total_amount, 
    balance_amount = 0.00 
WHERE paid_amount IS NULL OR paid_amount = 0;

-- Update status comment to include PARTIAL
COMMENT ON COLUMN purchases.status IS 'Purchase status: DRAFT, COMPLETED, PARTIAL, CANCELLED';
