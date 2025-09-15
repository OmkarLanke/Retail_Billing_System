package com.example.gstapp.service;

import com.example.gstapp.model.BankTransaction;
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
    
    public BankTransaction createOpeningBalanceTransaction(Long merchantId, Long bankAccountId, 
                                                         BigDecimal openingBalance) {
        return createBankTransaction(merchantId, bankAccountId, 
                                   BankTransaction.TransactionType.OPENING_BALANCE, 
                                   openingBalance, "Opening Balance", 
                                   "OB-" + System.currentTimeMillis(), openingBalance);
    }
}
