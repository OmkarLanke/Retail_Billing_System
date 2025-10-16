package com.example.gstapp.service;

import com.example.gstapp.model.Party;
import com.example.gstapp.model.PartyTransaction;
import com.example.gstapp.repository.PartyRepository;
import com.example.gstapp.repository.PartyTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PartyTransactionService {
    
    @Autowired
    private PartyTransactionRepository partyTransactionRepository;
    
    @Autowired
    private PartyRepository partyRepository;
    
    @Autowired
    private PartyService partyService;
    
    public void recordPurchaseTransaction(Party party, BigDecimal totalAmount, BigDecimal paidAmount, String description) {
        // Create transaction for purchase
        BigDecimal balanceAmount = totalAmount.subtract(paidAmount);
        PartyTransaction transaction = new PartyTransaction();
        transaction.setPartyId(party.getId());
        transaction.setParty(party);
        transaction.setMerchantId(party.getMerchantId());
        transaction.setTransactionType(PartyTransaction.TransactionType.PURCHASE);
        transaction.setAmount(balanceAmount); // Store the balance amount as the transaction amount
        transaction.setDescription(description);
        transaction.setTransactionDate(LocalDateTime.now());
        
        // Use PartyService to update balance with proper logic
        partyService.updatePartyBalance(party.getMerchantId(), party.getId(), balanceAmount, PartyTransaction.TransactionType.PURCHASE);
        
        // Get the updated balance after the transaction
        BigDecimal balanceAfter = partyService.getPartyBalance(party.getMerchantId(), party.getId());
        transaction.setBalanceAfter(balanceAfter);
        
        partyTransactionRepository.save(transaction);
    }
    
    public void recordSaleTransaction(Party party, BigDecimal totalAmount, BigDecimal receivedAmount, String description) {
        // Create transaction for sale
        BigDecimal balanceAmount = totalAmount.subtract(receivedAmount);
        PartyTransaction transaction = new PartyTransaction();
        transaction.setPartyId(party.getId());
        transaction.setParty(party);
        transaction.setMerchantId(party.getMerchantId());
        transaction.setTransactionType(PartyTransaction.TransactionType.SALE);
        transaction.setAmount(totalAmount); // Store the total amount as the transaction amount (for display in Total column)
        transaction.setDescription(description);
        transaction.setTransactionDate(LocalDateTime.now());
        
        // Use PartyService to update balance with proper logic
        partyService.updatePartyBalance(party.getMerchantId(), party.getId(), balanceAmount, PartyTransaction.TransactionType.SALE);
        
        // Get the updated balance after the transaction
        BigDecimal balanceAfter = partyService.getPartyBalance(party.getMerchantId(), party.getId());
        transaction.setBalanceAfter(balanceAfter);
        
        // Set the specific sale's balance (remaining amount to be paid for this sale)
        transaction.setSaleBalance(balanceAmount);
        
        partyTransactionRepository.save(transaction);
    }
    
    public void reversePurchaseTransaction(Party party, BigDecimal totalAmount, BigDecimal paidAmount) {
        // Reverse the purchase transaction effect
        BigDecimal currentBalance = party.getCurrentBalance() != null ? party.getCurrentBalance() : BigDecimal.ZERO;
        BigDecimal adjustment = totalAmount.subtract(paidAmount);
        BigDecimal newBalance = currentBalance.subtract(adjustment);
        
        // Create reversal transaction
        PartyTransaction transaction = new PartyTransaction();
        transaction.setPartyId(party.getId());
        transaction.setParty(party);
        transaction.setMerchantId(party.getMerchantId());
        transaction.setTransactionType(PartyTransaction.TransactionType.PAYMENT_IN);
        transaction.setAmount(adjustment);
        transaction.setDescription("Reversed Purchase");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setBalanceAfter(newBalance);
        
        partyTransactionRepository.save(transaction);
        
        // Update party balance
        // Always store balance as positive value, use balanceType to indicate direction
        party.setCurrentBalance(newBalance.abs());
        if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
            party.setBalanceType(Party.BalanceType.TO_PAY);
        } else if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            party.setBalanceType(Party.BalanceType.TO_RECEIVE);
        } else {
            party.setBalanceType(null);
        }
        partyRepository.save(party);
    }
    
    public void reverseSaleTransaction(Party party, BigDecimal totalAmount, BigDecimal receivedAmount) {
        // Reverse the sale transaction effect
        BigDecimal currentBalance = party.getCurrentBalance() != null ? party.getCurrentBalance() : BigDecimal.ZERO;
        BigDecimal adjustment = totalAmount.subtract(receivedAmount);
        BigDecimal newBalance = currentBalance.add(adjustment);
        
        // Create reversal transaction
        PartyTransaction transaction = new PartyTransaction();
        transaction.setPartyId(party.getId());
        transaction.setParty(party);
        transaction.setMerchantId(party.getMerchantId());
        transaction.setTransactionType(PartyTransaction.TransactionType.PAYMENT_OUT);
        transaction.setAmount(adjustment);
        transaction.setDescription("Reversed Sale");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setBalanceAfter(newBalance);
        
        partyTransactionRepository.save(transaction);
        
        // Update party balance
        // Always store balance as positive value, use balanceType to indicate direction
        party.setCurrentBalance(newBalance.abs());
        if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
            party.setBalanceType(Party.BalanceType.TO_PAY);
        } else if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            party.setBalanceType(Party.BalanceType.TO_RECEIVE);
        } else {
            party.setBalanceType(null);
        }
        partyRepository.save(party);
    }
    
    /**
     * Update existing sale transactions to show total amount instead of balance amount
     */
    public void updateExistingSaleTransactions(Long merchantId) {
        System.out.println("Starting to update existing sale transactions for merchant: " + merchantId);
        
        // Get all sale transactions
        List<PartyTransaction> saleTransactions = partyTransactionRepository
            .findByMerchantIdAndTransactionType(merchantId, PartyTransaction.TransactionType.SALE);
        
        int updatedCount = 0;
        
        for (PartyTransaction transaction : saleTransactions) {
            boolean updated = false;
            
            // Check if this transaction has a balance amount that should be the total amount
            // For sale transactions, the amount should be the total amount, not the balance
            if (transaction.getAmount() != null && transaction.getBalanceAfter() != null) {
                // If the transaction amount is less than the balance after, it's likely a balance amount
                // We need to find the corresponding sale to get the total amount
                // For now, we'll use a heuristic: if amount < balanceAfter, it's likely a balance amount
                if (transaction.getAmount().compareTo(transaction.getBalanceAfter()) < 0) {
                    // This is likely a balance amount, we need to find the sale total
                    // For now, we'll add the amount to the balance to get the total
                    BigDecimal totalAmount = transaction.getAmount().add(transaction.getBalanceAfter());
                    transaction.setAmount(totalAmount);
                    updated = true;
                    
                    System.out.println("Updated sale transaction ID: " + transaction.getId() + 
                        " from balance amount to total amount: " + totalAmount);
                }
            }
            
            // Set the saleBalance field if it's null
            if (transaction.getSaleBalance() == null) {
                // For sale transactions, the saleBalance should be the remaining amount to be paid
                // This is calculated as: total amount - received amount
                // Since we don't have the received amount directly, we'll use the balanceAfter as a proxy
                // The saleBalance should be the amount that was added to the party's balance
                BigDecimal currentBalance = transaction.getBalanceAfter() != null ? transaction.getBalanceAfter() : BigDecimal.ZERO;
                // For sale transactions, the balance after should be negative (party owes us)
                // So the saleBalance should be the absolute value of the change
                BigDecimal saleBalance = currentBalance.abs();
                transaction.setSaleBalance(saleBalance);
                updated = true;
                
                System.out.println("Set saleBalance for transaction ID: " + transaction.getId() + 
                    " to: " + saleBalance);
            }
            
            if (updated) {
                partyTransactionRepository.save(transaction);
                updatedCount++;
            }
        }
        
        System.out.println("Updated " + updatedCount + " existing sale transactions");
    }
}


