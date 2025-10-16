package com.example.gstapp.controller;

import com.example.gstapp.dto.PurchaseRequest;
import com.example.gstapp.dto.PurchaseResponse;
import com.example.gstapp.service.PurchaseService;
import com.example.gstapp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    private Long getMerchantIdFromAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<?> createPurchase(@RequestBody PurchaseRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            PurchaseResponse response = purchaseService.createPurchase(merchantId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create purchase: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getPurchases(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<PurchaseResponse> purchases = purchaseService.getPurchasesByMerchant(merchantId);
            return ResponseEntity.ok(purchases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch purchases: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPurchaseById(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            PurchaseResponse response = purchaseService.getPurchaseById(merchantId, id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Purchase not found: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePurchase(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            purchaseService.deletePurchase(merchantId, id);
            return ResponseEntity.ok("Purchase deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to delete purchase: " + e.getMessage());
        }
    }

    @GetMapping("/bills")
    public ResponseEntity<?> getPurchaseBills(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            
            List<PurchaseResponse> purchases;
            if (startDate != null && endDate != null && !startDate.trim().isEmpty() && !endDate.trim().isEmpty()) {
                // Parse date strings and filter by date range
                java.time.LocalDate startDateParsed = java.time.LocalDate.parse(startDate);
                java.time.LocalDate endDateParsed = java.time.LocalDate.parse(endDate);
                
                // Always set start time to beginning of day and end time to end of day
                java.time.LocalDateTime start = startDateParsed.atStartOfDay(); // 00:00:00
                java.time.LocalDateTime end = endDateParsed.atTime(23, 59, 59, 999999999); // 23:59:59.999999999
                
                System.out.println("Filtering purchases from " + start + " to " + end);
                System.out.println("Start date: " + startDate + ", End date: " + endDate);
                purchases = purchaseService.getPurchasesByDateRange(merchantId, start, end);
                System.out.println("Found " + purchases.size() + " purchases in date range");
            } else {
                // Get all purchases if no date filter provided
                purchases = purchaseService.getPurchasesByMerchant(merchantId);
                System.out.println("No date filter - returning all " + purchases.size() + " purchases");
            }
            
            return ResponseEntity.ok(purchases);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch purchase bills: " + e.getMessage());
        }
    }
}
