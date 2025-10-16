package com.example.gstapp.controller;

import com.example.gstapp.dto.*;
import com.example.gstapp.model.ItemType;
import com.example.gstapp.model.User;
import com.example.gstapp.service.ItemService;
import com.example.gstapp.service.ItemTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    @Autowired
    private ItemService itemService;
    
    @Autowired
    private ItemTransactionService itemTransactionService;

    private Long getMerchantIdFromAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    // Item CRUD Operations
    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody ItemRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            ItemResponse response = itemService.createItem(request, merchantId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error creating item: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<ItemResponse> items = itemService.getAllItems(merchantId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/type/{itemType}")
    public ResponseEntity<List<ItemResponse>> getItemsByType(@PathVariable ItemType itemType, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<ItemResponse> items = itemService.getItemsByType(merchantId, itemType);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            ItemResponse response = itemService.getItemById(id, merchantId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(@PathVariable Long id, @RequestBody ItemRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            ItemResponse response = itemService.updateItem(id, request, merchantId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            itemService.deleteItem(id, merchantId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemResponse>> searchItems(@RequestParam String q, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<ItemResponse> items = itemService.searchItems(merchantId, q);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/adjust-stock")
    public ResponseEntity<ItemResponse> adjustStock(@RequestBody StockAdjustmentRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            ItemResponse item = itemService.adjustStock(request, merchantId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/adjustments")
    public ResponseEntity<List<ItemTransactionResponse>> getItemAdjustments(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<ItemTransactionResponse> adjustments = itemService.getItemAdjustments(id, merchantId);
            return ResponseEntity.ok(adjustments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<ItemTransactionResponse>> getItemTransactions(@PathVariable Long id, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<ItemTransactionResponse> transactions = itemService.getItemTransactions(id, merchantId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Category Operations
    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody CategoryRequest request, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            CategoryResponse response = itemService.createCategory(request, merchantId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<CategoryResponse> categories = itemService.getAllCategories(merchantId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Unit Operations
    @PostMapping("/units")
    public ResponseEntity<String> createUnit(@RequestParam String name, @RequestParam String shortName, Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            itemService.createUnit(name, shortName, merchantId);
            return ResponseEntity.ok("Unit created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/units")
    public ResponseEntity<List<com.example.gstapp.model.Unit>> getAllUnits(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            List<com.example.gstapp.model.Unit> units = itemService.getAllUnits(merchantId);
            return ResponseEntity.ok(units);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/update-sale-transactions")
    public ResponseEntity<String> updateExistingSaleTransactions(Authentication authentication) {
        try {
            Long merchantId = getMerchantIdFromAuth(authentication);
            itemTransactionService.updateExistingSaleTransactions(merchantId);
            return ResponseEntity.ok("Sale transactions updated successfully");
        } catch (Exception e) {
            System.out.println("Error updating sale transactions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update sale transactions: " + e.getMessage());
        }
    }

}
