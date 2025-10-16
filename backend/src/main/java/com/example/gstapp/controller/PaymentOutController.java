package com.example.gstapp.controller;

import com.example.gstapp.dto.PaymentOutRequest;
import com.example.gstapp.dto.PaymentOutResponse;
import com.example.gstapp.model.User;
import com.example.gstapp.service.PaymentOutService;
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
@RequestMapping("/api/payment-out")
@CrossOrigin(origins = "*")
public class PaymentOutController {
    
    @Autowired
    private PaymentOutService paymentOutService;
    
    private Long getMerchantIdFromAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
    
    @PostMapping
    public ResponseEntity<?> createPaymentOut(@Valid @RequestBody PaymentOutRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            System.out.println("Creating payment out for merchant: " + merchantId);
            
            PaymentOutResponse paymentOut = paymentOutService.createPaymentOut(merchantId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment out created successfully");
            response.put("data", paymentOut);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating payment out: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create payment out: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllPaymentOuts(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentOutResponse> paymentOuts = paymentOutService.getPaymentOutsByMerchant(merchantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentOuts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment outs: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment outs: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/party/{partyId}")
    public ResponseEntity<?> getPaymentOutsByParty(@PathVariable Long partyId, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentOutResponse> paymentOuts = paymentOutService.getPaymentOutsByParty(merchantId, partyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentOuts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment outs by party: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment outs by party: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/payment-type/{paymentType}")
    public ResponseEntity<?> getPaymentOutsByPaymentType(@PathVariable String paymentType, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentOutResponse> paymentOuts = paymentOutService.getPaymentOutsByPaymentType(merchantId, paymentType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentOuts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment outs by payment type: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment outs by payment type: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/bank-account/{bankAccountId}")
    public ResponseEntity<?> getPaymentOutsByBankAccount(@PathVariable Long bankAccountId, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PaymentOutResponse> paymentOuts = paymentOutService.getPaymentOutsByBankAccount(merchantId, bankAccountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentOuts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment outs by bank account: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment outs by bank account: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/summary")
    public ResponseEntity<?> getPaymentOutSummary(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            
            Map<String, Object> summary = new HashMap<>();
            
            // Get totals by payment type
            BigDecimal cashTotal = paymentOutService.getTotalAmountByPaymentType(merchantId, "CASH");
            BigDecimal chequeTotal = paymentOutService.getTotalAmountByPaymentType(merchantId, "CHEQUE");
            
            summary.put("cashTotal", cashTotal);
            summary.put("chequeTotal", chequeTotal);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching payment out summary: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment out summary: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/{paymentOutId}")
    public ResponseEntity<?> deletePaymentOut(@PathVariable Long paymentOutId, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            paymentOutService.deletePaymentOut(merchantId, paymentOutId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment out deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error deleting payment out: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete payment out: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
