-- Add balance_after column to payment_out table
ALTER TABLE payment_out ADD COLUMN balance_after DECIMAL(15,2);
