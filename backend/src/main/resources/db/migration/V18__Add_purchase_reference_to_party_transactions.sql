-- Add purchase reference to party_transactions table
ALTER TABLE party_transactions 
ADD COLUMN purchase_id BIGINT;

-- Add foreign key constraint
ALTER TABLE party_transactions 
ADD CONSTRAINT fk_party_transactions_purchase 
FOREIGN KEY (purchase_id) REFERENCES purchases(id);

-- Update existing party transactions to link them to purchases based on transaction_number
-- Use LIMIT 1 to handle cases where there might be duplicate bill numbers
UPDATE party_transactions pt 
SET purchase_id = (
    SELECT p.id 
    FROM purchases p 
    WHERE p.bill_number = pt.transaction_number 
    AND pt.transaction_type = 'PURCHASE'
    LIMIT 1
)
WHERE pt.transaction_type = 'PURCHASE' 
AND pt.purchase_id IS NULL;
