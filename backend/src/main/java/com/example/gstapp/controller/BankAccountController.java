package com.example.gstapp.controller;

import com.example.gstapp.dto.BankAccountRequest;
import com.example.gstapp.model.BankAccount;
import com.example.gstapp.model.BankTransaction;
import com.example.gstapp.model.User;
import com.example.gstapp.service.BankAccountService;
import com.example.gstapp.service.BankTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bank-accounts")
@CrossOrigin(origins = "*")
public class BankAccountController {
    
    @Autowired
    private BankAccountService bankAccountService;
    
    @Autowired
    private BankTransactionService bankTransactionService;
    
    @GetMapping
    public ResponseEntity<?> getBankAccounts(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<BankAccount> bankAccounts = bankAccountService.getBankAccountsByMerchantId(merchantId);
            BigDecimal totalBalance = bankAccountService.getTotalBankBalance(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bankAccounts", bankAccounts);
            response.put("totalBalance", totalBalance);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getBankAccount(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            return bankAccountService.getBankAccountById(id, merchantId)
                .map(account -> ResponseEntity.ok(account))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getBankAccountTransactions(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            
            // Verify the bank account belongs to the merchant
            BankAccount bankAccount = bankAccountService.getBankAccountById(id, merchantId)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
            
            List<BankTransaction> transactions = bankTransactionService.getBankTransactionsByBankAccountId(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bankAccount", bankAccount);
            response.put("transactions", transactions);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createBankAccount(@Valid @RequestBody BankAccountRequest request, 
                                             Authentication authentication) {
        try {
            System.out.println("Received request: " + request);
            System.out.println("Authentication: " + authentication);
            Long merchantId = getMerchantIdFromAuth(authentication);
            System.out.println("Merchant ID: " + merchantId);
            BankAccount bankAccount = bankAccountService.createBankAccount(merchantId, request);
            return ResponseEntity.ok(bankAccount);
        } catch (Exception e) {
            System.out.println("Error creating bank account: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBankAccount(@PathVariable Long id, 
                                             @Valid @RequestBody BankAccountRequest request,
                                             Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            BankAccount bankAccount = bankAccountService.updateBankAccount(id, merchantId, request);
            return ResponseEntity.ok(bankAccount);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBankAccount(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            bankAccountService.deleteBankAccount(id, merchantId);
            return ResponseEntity.ok(Map.of("message", "Bank account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/balance/total")
    public ResponseEntity<?> getTotalBankBalance(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            BigDecimal totalBalance = bankAccountService.getTotalBankBalance(merchantId);
            return ResponseEntity.ok(Map.of("totalBalance", totalBalance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private Long getMerchantIdFromAuth(Authentication authentication) {
        // Get the User object from the authentication principal
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
