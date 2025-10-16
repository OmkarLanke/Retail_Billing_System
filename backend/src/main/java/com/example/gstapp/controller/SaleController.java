package com.example.gstapp.controller;

import com.example.gstapp.dto.SaleRequest;
import com.example.gstapp.dto.SaleResponse;
import com.example.gstapp.model.User;
import com.example.gstapp.service.SaleService;
import com.example.gstapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = userService.findByUsername(authentication.getName());
        
        List<SaleResponse> sales;
        if (startDate != null && endDate != null) {
            sales = saleService.getSalesByDateRange(user, startDate, endDate);
        } else {
            sales = saleService.getAllSales(user);
        }
        
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getSaleById(
            @PathVariable Long id,
            Authentication authentication) {
        
        User user = userService.findByUsername(authentication.getName());
        SaleResponse sale = saleService.getSaleById(id, user);
        return ResponseEntity.ok(sale);
    }

    @PostMapping
    public ResponseEntity<SaleResponse> createSale(
            @RequestBody SaleRequest request,
            Authentication authentication) {
        
        User user = userService.findByUsername(authentication.getName());
        SaleResponse sale = saleService.createSale(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(sale);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SaleResponse> updateSale(
            @PathVariable Long id,
            @RequestBody SaleRequest request,
            Authentication authentication) {
        
        User user = userService.findByUsername(authentication.getName());
        SaleResponse sale = saleService.updateSale(id, request, user);
        return ResponseEntity.ok(sale);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(
            @PathVariable Long id,
            Authentication authentication) {
        
        User user = userService.findByUsername(authentication.getName());
        saleService.deleteSale(id, user);
        return ResponseEntity.noContent().build();
    }
}
