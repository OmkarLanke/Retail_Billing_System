package com.example.gstapp.controller;

import com.example.gstapp.dto.CashAdjustmentRequest;
import com.example.gstapp.model.CashTransaction;
import com.example.gstapp.model.User;
import com.example.gstapp.service.CashTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cash-transactions")
@CrossOrigin(origins = "*")
public class CashTransactionController {
    
    @Autowired
    private CashTransactionService cashTransactionService;
    
    @GetMapping
    public ResponseEntity<?> getCashTransactions(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<CashTransaction> transactions = cashTransactionService.getCashTransactionsByMerchantId(merchantId);
            BigDecimal currentBalance = cashTransactionService.getCurrentCashBalance(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactions", transactions);
            response.put("currentBalance", currentBalance);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/balance")
    public ResponseEntity<?> getCurrentCashBalance(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            BigDecimal currentBalance = cashTransactionService.getCurrentCashBalance(merchantId);
            BigDecimal totalIn = cashTransactionService.getTotalCashIn(merchantId);
            BigDecimal totalOut = cashTransactionService.getTotalCashOut(merchantId);
            BigDecimal totalAdjustments = cashTransactionService.getTotalAdjustments(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("currentBalance", currentBalance);
            response.put("totalIn", totalIn);
            response.put("totalOut", totalOut);
            response.put("totalAdjustments", totalAdjustments);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/adjust")
    public ResponseEntity<?> adjustCash(@Valid @RequestBody CashAdjustmentRequest request,
                                      Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            CashTransaction transaction = cashTransactionService.adjustCash(merchantId, request);
            BigDecimal newBalance = cashTransactionService.getCurrentCashBalance(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transaction", transaction);
            response.put("newBalance", newBalance);
            response.put("message", "Cash adjusted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/in")
    public ResponseEntity<?> addCashIn(@Valid @RequestBody CashAdjustmentRequest request,
                                     Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            CashTransaction transaction = cashTransactionService.createCashTransaction(
                merchantId, CashTransaction.TransactionType.IN, request.getAmount(), 
                request.getDescription(), request.getReferenceNumber()
            );
            BigDecimal newBalance = cashTransactionService.getCurrentCashBalance(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transaction", transaction);
            response.put("newBalance", newBalance);
            response.put("message", "Cash added successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/out")
    public ResponseEntity<?> addCashOut(@Valid @RequestBody CashAdjustmentRequest request,
                                      Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            CashTransaction transaction = cashTransactionService.createCashTransaction(
                merchantId, CashTransaction.TransactionType.OUT, request.getAmount(), 
                request.getDescription(), request.getReferenceNumber()
            );
            BigDecimal newBalance = cashTransactionService.getCurrentCashBalance(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transaction", transaction);
            response.put("newBalance", newBalance);
            response.put("message", "Cash deducted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<?> getCashTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<CashTransaction> transactions = cashTransactionService.getCashTransactionsByDateRange(
                merchantId, startDate, endDate);
            return ResponseEntity.ok(Map.of("transactions", transactions));
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
