package com.example.gstapp.controller;

import com.example.gstapp.dto.CompanyRequest;
import com.example.gstapp.dto.CompanyResponse;
import com.example.gstapp.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/company")
@CrossOrigin(origins = "*")
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    private static final String UPLOAD_DIR = "uploads/company/";
    
    /**
     * Get company profile for the current user
     */
    @GetMapping("/profile")
    public ResponseEntity<CompanyResponse> getCompanyProfile() {
        CompanyResponse response = companyService.getCompanyProfile();
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create or update company profile
     */
    @PostMapping("/profile")
    public ResponseEntity<CompanyResponse> saveCompanyProfile(@Valid @RequestBody CompanyRequest companyRequest) {
        CompanyResponse response = companyService.saveCompanyProfile(companyRequest);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Update company profile
     */
    @PutMapping("/profile")
    public ResponseEntity<CompanyResponse> updateCompanyProfile(@Valid @RequestBody CompanyRequest companyRequest) {
        CompanyResponse response = companyService.saveCompanyProfile(companyRequest);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Upload company logo
     */
    @PostMapping("/logo")
    public ResponseEntity<CompanyResponse> uploadLogo(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new CompanyResponse("File is empty", false));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(new CompanyResponse("File must be an image", false));
            }
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR + "logos/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = "logo_" + UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update company logo path
            String logoPath = UPLOAD_DIR + "logos/" + filename;
            CompanyResponse response = companyService.updateLogo(logoPath);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                // Delete uploaded file if update failed
                Files.deleteIfExists(filePath);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new CompanyResponse("Error uploading file: " + e.getMessage(), false));
        }
    }
    
    /**
     * Upload company signature
     */
    @PostMapping("/signature")
    public ResponseEntity<CompanyResponse> uploadSignature(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new CompanyResponse("File is empty", false));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(new CompanyResponse("File must be an image", false));
            }
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR + "signatures/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = "signature_" + UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update company signature path
            String signaturePath = UPLOAD_DIR + "signatures/" + filename;
            CompanyResponse response = companyService.updateSignature(signaturePath);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                // Delete uploaded file if update failed
                Files.deleteIfExists(filePath);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new CompanyResponse("Error uploading file: " + e.getMessage(), false));
        }
    }
    
    /**
     * Delete company profile
     */
    @DeleteMapping("/profile")
    public ResponseEntity<CompanyResponse> deleteCompanyProfile() {
        CompanyResponse response = companyService.deleteCompanyProfile();
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get available business types
     */
    @GetMapping("/business-types")
    public ResponseEntity<String[]> getBusinessTypes() {
        String[] businessTypes = {
            "retail", "wholesale", "distributor", "service", "manufacturing", "others"
        };
        return ResponseEntity.ok(businessTypes);
    }
    
    /**
     * Get available business categories
     */
    @GetMapping("/business-categories")
    public ResponseEntity<String[]> getBusinessCategories() {
        String[] businessCategories = {
            "accounting-ca", "interior-designer", "automobiles-auto-parts", "salon-spa", 
            "liquor-store", "book-stationary-store", "construction-materials-equipment", 
            "repairing-plumbing-electrician", "chemicals-fertilizers", "computer-equipments-softwares", 
            "electrical-electronics-equipments", "fashion-accessory-cosmetics", "tailoring-boutique", 
            "fruit-and-vegetable", "kirana-general-merchant", "fmcg-products", "dairy-farm-products-poultry", 
            "furniture", "garment-fashion-hosiery", "jewellery-gems", "pharmacy-medical", 
            "hardware-store", "industrial-machinery-equipment", "mobile-accessories", "nursery-plants", 
            "petroleum-bulk-stations-terminals-petrol", "restaurant-hotel", "footwear", 
            "paper-paper-products", "sweet-shop-bakery", "gifts-toys", "laundry-washing-dry-clean", 
            "coaching-training", "renting-leasing", "fitness-center", "oil-gas", "real-estate", 
            "ngo-charitable-trust", "tours-travels", "others"
        };
        return ResponseEntity.ok(businessCategories);
    }
    
    /**
     * Get available states
     */
    @GetMapping("/states")
    public ResponseEntity<String[]> getStates() {
        String[] states = {
            "andhra-pradesh", "arunachal-pradesh", "assam", "bihar", "chhattisgarh", "goa", 
            "gujarat", "haryana", "himachal-pradesh", "jharkhand", "karnataka", "kerala", 
            "madhya-pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", 
            "odisha", "punjab", "rajasthan", "sikkim", "tamil-nadu", "telangana", "tripura", 
            "uttar-pradesh", "uttarakhand", "west-bengal", "andaman-nicobar-islands", "chandigarh", 
            "dadra-nagar-haveli-daman-diu", "delhi", "jammu-kashmir", "ladakh", "lakshadweep", "puducherry"
        };
        return ResponseEntity.ok(states);
    }
    
    /**
     * Test endpoint to verify authentication
     */
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testAuth() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Authentication successful");
        response.put("timestamp", new Date());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test endpoint to verify static file serving
     */
    @GetMapping("/test-static-files")
    public ResponseEntity<Map<String, Object>> testStaticFiles() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Static file serving test");
        response.put("uploadsPath", System.getProperty("user.dir") + "/uploads");
        response.put("timestamp", new Date());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Serve uploaded images directly (public endpoint)
     */
    @GetMapping("/image/{type}/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String type, @PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + type + "s/" + filename);
            Resource resource = new FileSystemResource(filePath);
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
