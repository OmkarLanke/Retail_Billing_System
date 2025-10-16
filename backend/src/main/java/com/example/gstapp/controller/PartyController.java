package com.example.gstapp.controller;

import com.example.gstapp.dto.PartyRequest;
import com.example.gstapp.dto.PartyResponse;
import com.example.gstapp.model.User;
import com.example.gstapp.service.PartyService;
import com.example.gstapp.service.PartyTransactionService;
import com.example.gstapp.service.UserService;
import com.example.gstapp.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parties")
@CrossOrigin(origins = "*")
public class PartyController {

    @Autowired
    private PartyService partyService;

    @Autowired
    private PartyTransactionService partyTransactionService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getCurrentUserId(HttpServletRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User user = userService.findByUsername(username);
                if (user != null) {
                    return user.getId();
                }
            }
            throw new RuntimeException("User not authenticated");
        } catch (Exception e) {
            System.err.println("Error getting current user ID: " + e.getMessage());
            throw new RuntimeException("Authentication failed");
        }
    }

    @GetMapping
    public ResponseEntity<List<PartyResponse>> getAllParties(HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            List<PartyResponse> parties = partyService.getAllParties(merchantId);
            return ResponseEntity.ok(parties);
        } catch (Exception e) {
            System.err.println("Error in getAllParties: " + e.getMessage());
            return ResponseEntity.status(401).body(null);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PartyResponse>> searchParties(
            @RequestParam String q,
            HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            List<PartyResponse> parties = partyService.searchParties(merchantId, q);
            return ResponseEntity.ok(parties);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartyResponse> getPartyById(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            PartyResponse party = partyService.getPartyById(merchantId, id);
            return ResponseEntity.ok(party);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createParty(@Valid @RequestBody PartyRequest partyRequest, 
                                       HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            PartyResponse party = partyService.createParty(merchantId, partyRequest);
            return ResponseEntity.ok(party);
        } catch (Exception e) {
            System.err.println("Error creating party: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create party: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartyResponse> updateParty(@PathVariable Long id, 
                                                   @Valid @RequestBody PartyRequest partyRequest,
                                                   HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            PartyResponse party = partyService.updateParty(merchantId, id, partyRequest);
            return ResponseEntity.ok(party);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParty(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            partyService.deleteParty(merchantId, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<Double> getPartyBalance(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            return ResponseEntity.ok(partyService.getPartyBalance(merchantId, id).doubleValue());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/update-sale-transactions")
    public ResponseEntity<String> updateExistingSaleTransactions(HttpServletRequest request) {
        try {
            Long merchantId = getCurrentUserId(request);
            partyTransactionService.updateExistingSaleTransactions(merchantId);
            return ResponseEntity.ok("Party sale transactions updated successfully");
        } catch (Exception e) {
            System.out.println("Error updating party sale transactions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update party sale transactions: " + e.getMessage());
        }
    }
}
