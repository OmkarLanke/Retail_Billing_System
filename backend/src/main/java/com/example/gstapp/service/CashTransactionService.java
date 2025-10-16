package com.example.gstapp.service;

import com.example.gstapp.dto.CashAdjustmentRequest;
import com.example.gstapp.model.CashTransaction;
import com.example.gstapp.model.User;
import com.example.gstapp.repository.CashTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CashTransactionService {
    
    @Autowired
    private CashTransactionRepository cashTransactionRepository;
    
    public List<CashTransaction> getCashTransactionsByMerchantId(Long merchantId) {
        return cashTransactionRepository.findByMerchantIdOrderByTransactionDateDesc(merchantId);
    }
    
    public List<CashTransaction> getCashTransactionsByDateRange(Long merchantId, LocalDateTime startDate, LocalDateTime endDate) {
        return cashTransactionRepository.findByMerchantIdAndDateRange(merchantId, startDate, endDate);
    }
    
    public CashTransaction createCashTransaction(Long merchantId, CashTransaction.TransactionType transactionType, 
                                               BigDecimal amount, String description, String referenceNumber) {
        CashTransaction transaction = new CashTransaction(merchantId, transactionType, amount, description, referenceNumber);
        return cashTransactionRepository.save(transaction);
    }
    
    public CashTransaction createCashTransaction(Long merchantId, CashTransaction.TransactionType transactionType, 
                                               BigDecimal amount, String description, String referenceNumber, 
                                               LocalDateTime transactionDate) {
        CashTransaction transaction = new CashTransaction(merchantId, transactionType, amount, description, referenceNumber);
        transaction.setTransactionDate(transactionDate);
        return cashTransactionRepository.save(transaction);
    }
    
    public CashTransaction adjustCash(Long merchantId, CashAdjustmentRequest request) {
        CashTransaction.TransactionType transactionType;
        try {
            transactionType = CashTransaction.TransactionType.valueOf(request.getTransactionType());
        } catch (IllegalArgumentException e) {
            transactionType = CashTransaction.TransactionType.IN;
        }
        
        LocalDateTime transactionDate = LocalDateTime.now();
        if (request.getAdjustmentDate() != null && !request.getAdjustmentDate().trim().isEmpty()) {
            try {
                transactionDate = LocalDateTime.parse(request.getAdjustmentDate() + "T00:00:00");
            } catch (Exception e) {
                // Use current time if parsing fails
                transactionDate = LocalDateTime.now();
            }
        }
        
        // Handle empty description
        String description = request.getDescription();
        if (description == null || description.trim().isEmpty()) {
            description = "Cash adjustment - " + transactionType.name();
        }
        
        return createCashTransaction(merchantId, transactionType, 
                                   request.getAmount(), description, request.getReferenceNumber(), transactionDate);
    }
    
    public BigDecimal getTotalCashIn(Long merchantId) {
        return cashTransactionRepository.getTotalCashInByMerchantId(merchantId).orElse(BigDecimal.ZERO);
    }
    
    public BigDecimal getTotalCashOut(Long merchantId) {
        return cashTransactionRepository.getTotalCashOutByMerchantId(merchantId).orElse(BigDecimal.ZERO);
    }
    
    public BigDecimal getTotalAdjustments(Long merchantId) {
        return cashTransactionRepository.getTotalAdjustmentsByMerchantId(merchantId).orElse(BigDecimal.ZERO);
    }
    
    public BigDecimal getCurrentCashBalance(Long merchantId) {
        BigDecimal totalIn = getTotalCashIn(merchantId);
        BigDecimal totalOut = getTotalCashOut(merchantId);
        BigDecimal totalAdjustments = getTotalAdjustments(merchantId);
        
        return totalIn.add(totalAdjustments).subtract(totalOut);
    }
    
    // Sale-related methods
    public void recordSalePayment(BigDecimal amount, String description, User user) {
        createCashTransaction(user.getId(), CashTransaction.TransactionType.IN, 
            amount, description, null);
    }
    
    public void reverseSalePayment(BigDecimal amount, User user) {
        // Create a reverse transaction (OUT) to cancel the previous IN transaction
        createCashTransaction(user.getId(), CashTransaction.TransactionType.OUT, 
            amount, "Reversed sale payment", null);
    }
}
