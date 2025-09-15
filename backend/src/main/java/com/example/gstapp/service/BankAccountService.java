package com.example.gstapp.service;

import com.example.gstapp.dto.BankAccountRequest;
import com.example.gstapp.model.BankAccount;
import com.example.gstapp.repository.BankAccountRepository;
import com.example.gstapp.service.BankTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BankAccountService {
    
    @Autowired
    private BankAccountRepository bankAccountRepository;
    
    @Autowired
    private BankTransactionService bankTransactionService;
    
    public List<BankAccount> getBankAccountsByMerchantId(Long merchantId) {
        return bankAccountRepository.findByMerchantIdAndIsActiveTrueOrderByCreatedAtDesc(merchantId);
    }
    
    public Optional<BankAccount> getBankAccountById(Long id, Long merchantId) {
        return bankAccountRepository.findByIdAndMerchantId(id, merchantId);
    }
    
    public BankAccount createBankAccount(Long merchantId, BankAccountRequest request) {
        // Check if account number already exists for this merchant (only if not "N/A")
        String accountNumberToCheck = request.getAccountNumber();
        if (accountNumberToCheck != null && !accountNumberToCheck.trim().isEmpty() && !accountNumberToCheck.equals("N/A")) {
            if (bankAccountRepository.existsByMerchantIdAndAccountNumberAndIsActiveTrue(merchantId, accountNumberToCheck)) {
                throw new RuntimeException("Bank account with this account number already exists");
            }
        }
        
        // Use accountDisplayName as bankName if bankName is not provided
        String bankName = request.getBankName();
        if (bankName == null || bankName.trim().isEmpty()) {
            bankName = request.getAccountDisplayName();
        }
        
        // Use default values for required fields if not provided
        String accountNumber = request.getAccountNumber();
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            accountNumber = "N/A";
        }
        
        String ifscCode = request.getIfscCode();
        if (ifscCode == null || ifscCode.trim().isEmpty()) {
            ifscCode = "N/A";
        }
        
        String accountHolderName = request.getAccountHolderName();
        if (accountHolderName == null || accountHolderName.trim().isEmpty()) {
            accountHolderName = request.getAccountDisplayName();
        }
        
        String accountType = request.getAccountType();
        if (accountType == null || accountType.trim().isEmpty()) {
            accountType = "SAVINGS";
        }
        
        BankAccount bankAccount = new BankAccount(
            merchantId,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            request.getBranchName(),
            accountType,
            request.getOpeningBalance()
        );
        
        bankAccount = bankAccountRepository.save(bankAccount);
        
        // Create opening balance transaction if opening balance is greater than 0
        if (request.getOpeningBalance().compareTo(BigDecimal.ZERO) > 0) {
            bankTransactionService.createOpeningBalanceTransaction(
                merchantId, 
                bankAccount.getId(), 
                request.getOpeningBalance()
            );
        }
        
        return bankAccount;
    }
    
    public BankAccount updateBankAccount(Long id, Long merchantId, BankAccountRequest request) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndMerchantId(id, merchantId)
            .orElseThrow(() -> new RuntimeException("Bank account not found"));
        
        // Check if account number already exists for another account
        if (!bankAccount.getAccountNumber().equals(request.getAccountNumber()) &&
            bankAccountRepository.existsByMerchantIdAndAccountNumberAndIsActiveTrue(merchantId, request.getAccountNumber())) {
            throw new RuntimeException("Bank account with this account number already exists");
        }
        
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setIfscCode(request.getIfscCode());
        bankAccount.setAccountHolderName(request.getAccountHolderName());
        bankAccount.setBranchName(request.getBranchName());
        bankAccount.setAccountType(request.getAccountType());
        
        return bankAccountRepository.save(bankAccount);
    }
    
    public void deleteBankAccount(Long id, Long merchantId) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndMerchantId(id, merchantId)
            .orElseThrow(() -> new RuntimeException("Bank account not found"));
        
        bankAccount.setIsActive(false);
        bankAccountRepository.save(bankAccount);
    }
    
    public BigDecimal getTotalBankBalance(Long merchantId) {
        return bankAccountRepository.getTotalBankBalanceByMerchantId(merchantId)
            .orElse(BigDecimal.ZERO);
    }
    
    public BankAccount updateBankBalance(Long id, Long merchantId, BigDecimal newBalance) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndMerchantId(id, merchantId)
            .orElseThrow(() -> new RuntimeException("Bank account not found"));
        
        bankAccount.setCurrentBalance(newBalance);
        return bankAccountRepository.save(bankAccount);
    }
}
