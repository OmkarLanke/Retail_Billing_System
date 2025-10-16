package com.example.gstapp.controller;

import com.example.gstapp.dto.PaymentInRequest;
import com.example.gstapp.dto.PaymentInResponse;
import com.example.gstapp.model.User;
import com.example.gstapp.service.PaymentInService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment-in")
@CrossOrigin(origins = "*")
public class PaymentInController {
    
    @Autowired
    private PaymentInService paymentInService;
    
    private Long getMerchantIdFromAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
    
    @PostMapping
    public ResponseEntity<?> createPaymentIn(@Valid @RequestBody PaymentInRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            System.out.println("Creating payment in for merchant: " + merchantId);
            
            PaymentInResponse paymentIn = paymentInService.createPaymentIn(merchantId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment in created successfully");
            response.put("data", paymentIn);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating payment in: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create payment in: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllPaymentIns(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentInResponse> paymentIns = paymentInService.getPaymentInsByMerchant(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentIns);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment ins: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment ins: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/party/{partyId}")
    public ResponseEntity<?> getPaymentInsByParty(@PathVariable Long partyId, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentInResponse> paymentIns = paymentInService.getPaymentInsByParty(merchantId, partyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentIns);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment ins by party: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment ins by party: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/payment-type/{paymentType}")
    public ResponseEntity<?> getPaymentInsByPaymentType(@PathVariable String paymentType, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentInResponse> paymentIns = paymentInService.getPaymentInsByPaymentType(merchantId, paymentType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentIns);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment ins by payment type: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment ins by payment type: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/bank-account/{bankAccountId}")
    public ResponseEntity<?> getPaymentInsByBankAccount(@PathVariable Long bankAccountId, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentInResponse> paymentIns = paymentInService.getPaymentInsByBankAccount(merchantId, bankAccountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentIns);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment ins by bank account: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment ins by bank account: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/summary")
    public ResponseEntity<?> getPaymentInSummary(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            
            Map<String, Object> summary = new HashMap<>();
            
            // Get totals by payment type
            BigDecimal cashTotal = paymentInService.getTotalAmountByPaymentType(merchantId, "CASH");
            BigDecimal chequeTotal = paymentInService.getTotalAmountByPaymentType(merchantId, "CHEQUE");
            
            summary.put("cashTotal", cashTotal);
            summary.put("chequeTotal", chequeTotal);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment in summary: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment in summary: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/{paymentInId}")
    public ResponseEntity<?> deletePaymentIn(@PathVariable Long paymentInId, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            paymentInService.deletePaymentIn(merchantId, paymentInId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment in deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error deleting payment in: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete payment in: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
