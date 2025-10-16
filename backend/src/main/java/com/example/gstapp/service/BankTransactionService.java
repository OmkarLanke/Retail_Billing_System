package com.example.gstapp.service;

import com.example.gstapp.model.BankAccount;
import com.example.gstapp.model.BankTransaction;
import com.example.gstapp.model.User;
import com.example.gstapp.repository.BankAccountRepository;
import com.example.gstapp.repository.BankTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BankTransactionService {
    
    @Autowired
    private BankTransactionRepository bankTransactionRepository;
    
    @Autowired
    private BankAccountRepository bankAccountRepository;
    
    public List<BankTransaction> getBankTransactionsByBankAccountId(Long bankAccountId) {
        return bankTransactionRepository.findByBankAccountIdOrderByTransactionDateDesc(bankAccountId);
    }
    
    public List<BankTransaction> getBankTransactionsByMerchantId(Long merchantId) {
        return bankTransactionRepository.findByMerchantIdOrderByTransactionDateDesc(merchantId);
    }
    
    public List<BankTransaction> getBankTransactionsByDateRange(Long bankAccountId, LocalDateTime startDate, LocalDateTime endDate) {
        return bankTransactionRepository.findByBankAccountIdAndDateRange(bankAccountId, startDate, endDate);
    }
    
    public BankTransaction createBankTransaction(Long merchantId, Long bankAccountId, 
                                               BankTransaction.TransactionType transactionType, 
                                               BigDecimal amount, String description, 
                                               String referenceNumber, BigDecimal balanceAfter) {
        BankTransaction transaction = new BankTransaction(merchantId, bankAccountId, transactionType, 
                                                        amount, description, referenceNumber, balanceAfter);
        return bankTransactionRepository.save(transaction);
    }
    
    public BankTransaction createBankTransaction(Long merchantId, Long bankAccountId, 
                                               BankTransaction.TransactionType transactionType, 
                                               BigDecimal amount, String description, 
                                               String referenceNumber, BigDecimal balanceAfter,
                                               LocalDateTime transactionDate) {
        BankTransaction transaction = new BankTransaction(merchantId, bankAccountId, transactionType, 
                                                        amount, description, referenceNumber, balanceAfter);
        transaction.setTransactionDate(transactionDate);
        return bankTransactionRepository.save(transaction);
    }
    
    public BankTransaction createOpeningBalanceTransaction(Long merchantId, Long bankAccountId, 
                                                         BigDecimal openingBalance) {
        return createBankTransaction(merchantId, bankAccountId, 
                                   BankTransaction.TransactionType.OPENING_BALANCE, 
                                   openingBalance, "Opening Balance", 
                                   "OB-" + System.currentTimeMillis(), openingBalance);
    }
    
    // Sale-related methods
    public void recordSalePayment(BankAccount bankAccount, BigDecimal amount, String description, User user) {
        // Get current balance and update it
        BigDecimal currentBalance = bankAccount.getCurrentBalance() != null ? 
            bankAccount.getCurrentBalance() : BigDecimal.ZERO;
        BigDecimal newBalance = currentBalance.add(amount);
        
        // Update bank account balance
        bankAccount.setCurrentBalance(newBalance);
        bankAccountRepository.save(bankAccount);
        
        createBankTransaction(user.getId(), bankAccount.getId(), 
            BankTransaction.TransactionType.DEPOSIT, 
            amount, description, null, newBalance);
    }
    
    public void reverseSalePayment(BankAccount bankAccount, BigDecimal amount, User user) {
        // Get current balance and update it
        BigDecimal currentBalance = bankAccount.getCurrentBalance() != null ? 
            bankAccount.getCurrentBalance() : BigDecimal.ZERO;
        BigDecimal newBalance = currentBalance.subtract(amount);
        
        // Update bank account balance
        bankAccount.setCurrentBalance(newBalance);
        bankAccountRepository.save(bankAccount);
        
        // Create a reverse transaction (WITHDRAWAL) to cancel the previous DEPOSIT
        createBankTransaction(user.getId(), bankAccount.getId(), 
            BankTransaction.TransactionType.WITHDRAWAL, 
            amount, "Reversed sale payment", null, newBalance);
    }
}
