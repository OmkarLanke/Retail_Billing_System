package com.example.gstapp.service;

import com.example.gstapp.model.Item;
import com.example.gstapp.model.ItemTransaction;
import com.example.gstapp.model.ItemTransactionType;
import com.example.gstapp.model.User;
import com.example.gstapp.model.Sale;
import com.example.gstapp.model.SaleItem;
import com.example.gstapp.repository.ItemRepository;
import com.example.gstapp.repository.ItemTransactionRepository;
import com.example.gstapp.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemTransactionService {
    
    @Autowired
    private ItemTransactionRepository itemTransactionRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private SaleRepository saleRepository;
    
    public void recordPurchase(Item item, Integer quantity, User user) {
        // Create transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.PURCHASE);
        transaction.setQuantity(new BigDecimal(quantity));
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setMerchantId(user.getId());
        itemTransactionRepository.save(transaction);
        
        // Update item stock
        item.setCurrentStock(item.getCurrentStock() + quantity);
        itemRepository.save(item);
    }
    
    public void recordSale(Item item, Integer quantity, User user) {
        // Create transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.SALE);
        transaction.setQuantity(new BigDecimal(-quantity)); // Negative quantity for sales (stock reduction)
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setMerchantId(user.getId());
        itemTransactionRepository.save(transaction);
        
        // Update item stock
        item.setCurrentStock(item.getCurrentStock() - quantity);
        itemRepository.save(item);
    }
    
    public void recordSale(Item item, Integer quantity, User user, String invoiceRef, String partyName, 
                          BigDecimal pricePerUnit, BigDecimal totalAmount, String status) {
        // Create transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.SALE);
        transaction.setInvoiceRef(invoiceRef);
        transaction.setPartyName(partyName);
        transaction.setQuantity(new BigDecimal(-quantity)); // Negative quantity for sales (stock reduction)
        transaction.setPricePerUnit(pricePerUnit);
        transaction.setTotalAmount(totalAmount);
        transaction.setStatus(status);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setMerchantId(user.getId());
        itemTransactionRepository.save(transaction);
        
        // Update item stock
        item.setCurrentStock(item.getCurrentStock() - quantity);
        itemRepository.save(item);
    }
    
    public void reversePurchase(Item item, Integer quantity, User user) {
        // Create reverse transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.ADJUSTMENT);
        transaction.setQuantity(new BigDecimal(-quantity));
        transaction.setAdjustmentType("REDUCE");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setMerchantId(user.getId());
        itemTransactionRepository.save(transaction);
        
        // Update item stock
        item.setCurrentStock(item.getCurrentStock() - quantity);
        itemRepository.save(item);
    }
    
    public void reverseSale(Item item, Integer quantity, User user) {
        // Create reverse transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.ADJUSTMENT);
        transaction.setQuantity(new BigDecimal(quantity));
        transaction.setAdjustmentType("ADD");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setMerchantId(user.getId());
        itemTransactionRepository.save(transaction);
        
        // Update item stock
        item.setCurrentStock(item.getCurrentStock() + quantity);
        itemRepository.save(item);
    }
    
    public void reverseSale(Item item, Integer quantity, User user, String invoiceRef, String partyName, 
                           BigDecimal pricePerUnit, BigDecimal totalAmount, String status) {
        // Create reverse transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.ADJUSTMENT);
        transaction.setInvoiceRef(invoiceRef);
        transaction.setPartyName(partyName);
        transaction.setQuantity(new BigDecimal(quantity));
        transaction.setPricePerUnit(pricePerUnit);
        transaction.setTotalAmount(totalAmount);
        transaction.setStatus(status);
        transaction.setAdjustmentType("ADD");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setMerchantId(user.getId());
        itemTransactionRepository.save(transaction);
        
        // Update item stock
        item.setCurrentStock(item.getCurrentStock() + quantity);
        itemRepository.save(item);
    }
    
    /**
     * Update existing sale transactions with missing data from Sale and SaleItem records
     */
    public void updateExistingSaleTransactions(Long merchantId) {
        System.out.println("Starting to update existing sale transactions for merchant: " + merchantId);
        
        // Get all sale transactions that are missing data
        List<ItemTransaction> saleTransactions = itemTransactionRepository
            .findByMerchantIdAndTransactionType(merchantId, ItemTransactionType.SALE);
        
        int updatedCount = 0;
        
        for (ItemTransaction transaction : saleTransactions) {
            // Check if transaction is missing key data
            if (transaction.getInvoiceRef() == null || transaction.getPartyName() == null || 
                transaction.getPricePerUnit() == null || transaction.getTotalAmount() == null) {
                
                System.out.println("Updating transaction ID: " + transaction.getId());
                
                // Try to find the corresponding sale and sale item
                Sale sale = findSaleByItemAndDate(transaction.getItemId(), transaction.getTransactionDate(), merchantId);
                
                if (sale != null) {
                    SaleItem saleItem = findSaleItemByItemId(sale, transaction.getItemId());
                    
                    if (saleItem != null) {
                        // Update transaction with data from sale and sale item
                        transaction.setInvoiceRef(sale.getInvoiceNumber());
                        
                        String partyName = sale.getParty() != null ? sale.getParty().getName() : sale.getBillingName();
                        transaction.setPartyName(partyName);
                        
                        transaction.setPricePerUnit(saleItem.getPrice());
                        transaction.setTotalAmount(saleItem.getTotalAmount());
                        
                        String status = calculatePaymentStatus(sale);
                        transaction.setStatus(status);
                        
                        itemTransactionRepository.save(transaction);
                        updatedCount++;
                        
                        System.out.println("Updated transaction ID: " + transaction.getId() + 
                            " with invoice: " + sale.getInvoiceNumber() + 
                            ", party: " + partyName + 
                            ", price: " + saleItem.getPrice() + 
                            ", amount: " + saleItem.getTotalAmount() +
                            ", status: " + status);
                    }
                }
            }
        }
        
        System.out.println("Updated " + updatedCount + " sale transactions");
    }
    
    /**
     * Calculate payment status based on received amount vs total amount
     */
    private String calculatePaymentStatus(Sale sale) {
        if (sale.getTotalAmount() == null) {
            System.out.println("Sale " + sale.getId() + ": Total amount is null, returning Unpaid");
            return "Unpaid";
        }
        
        BigDecimal totalAmount = sale.getTotalAmount();
        BigDecimal receivedAmount = sale.getReceivedAmount() != null ? sale.getReceivedAmount() : BigDecimal.ZERO;
        
        System.out.println("Sale " + sale.getId() + " payment status calculation:");
        System.out.println("  Total Amount: " + totalAmount);
        System.out.println("  Received Amount: " + receivedAmount);
        System.out.println("  Sale Type: " + sale.getSaleType());
        
        String status;
        if (receivedAmount.compareTo(BigDecimal.ZERO) == 0) {
            status = "Unpaid";
        } else if (receivedAmount.compareTo(totalAmount) >= 0) {
            status = "Paid";
        } else {
            status = "Partial";
        }
        
        System.out.println("  Calculated Status: " + status);
        return status;
    }
    
    private Sale findSaleByItemAndDate(Long itemId, LocalDateTime transactionDate, Long merchantId) {
        // Get all sales for the merchant - we need to get the User first
        // For now, let's use a different approach - get all sales and filter by merchantId
        List<Sale> allSales = saleRepository.findAll();
        List<Sale> sales = allSales.stream()
            .filter(sale -> sale.getUser().getId().equals(merchantId))
            .collect(Collectors.toList());
        
        for (Sale sale : sales) {
            // Check if sale date matches transaction date (within same day)
            if (sale.getInvoiceDate().equals(transactionDate.toLocalDate())) {
                // Check if this sale contains the item
                for (SaleItem saleItem : sale.getSaleItems()) {
                    if (saleItem.getItem().getId().equals(itemId)) {
                        return sale;
                    }
                }
            }
        }
        return null;
    }
    
    private SaleItem findSaleItemByItemId(Sale sale, Long itemId) {
        for (SaleItem saleItem : sale.getSaleItems()) {
            if (saleItem.getItem().getId().equals(itemId)) {
                return saleItem;
            }
        }
        return null;
    }
}
