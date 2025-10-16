package com.example.gstapp.service;

import com.example.gstapp.dto.CompanyRequest;
import com.example.gstapp.dto.CompanyResponse;
import com.example.gstapp.model.Company;
import com.example.gstapp.model.User;
import com.example.gstapp.repository.CompanyRepository;
import com.example.gstapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get company profile for the current authenticated user
     */
    public CompanyResponse getCompanyProfile() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return new CompanyResponse("User not authenticated", false);
            }
            
            Optional<Company> companyOpt = companyRepository.findByUser(currentUser);
            if (companyOpt.isEmpty()) {
                return new CompanyResponse("Company profile not found", false);
            }
            
            Company company = companyOpt.get();
            return new CompanyResponse(
                company.getId(),
                company.getBusinessName(),
                company.getPhoneNumber(),
                company.getGstin(),
                company.getEmail(),
                company.getBusinessType(),
                company.getBusinessCategory(),
                company.getState(),
                company.getPincode(),
                company.getBusinessAddress(),
                company.getLogoPath(),
                company.getSignaturePath(),
                company.getCreatedAt(),
                company.getUpdatedAt()
            );
        } catch (Exception e) {
            return new CompanyResponse("Error retrieving company profile: " + e.getMessage(), false);
        }
    }
    
    /**
     * Create or update company profile for the current authenticated user
     */
    public CompanyResponse saveCompanyProfile(CompanyRequest companyRequest) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return new CompanyResponse("User not authenticated", false);
            }
            
            // Check if GSTIN already exists for other companies
            if (companyRequest.getGstin() != null && !companyRequest.getGstin().isEmpty()) {
                Optional<Company> existingCompany = companyRepository.findByUser(currentUser);
                Long companyId = existingCompany.map(Company::getId).orElse(0L);
                
                if (companyRepository.existsByGstinAndIdNot(companyRequest.getGstin(), companyId)) {
                    return new CompanyResponse("GSTIN already exists for another company", false);
                }
            }
            
            // Check if email already exists for other companies
            if (companyRequest.getEmail() != null && !companyRequest.getEmail().isEmpty()) {
                Optional<Company> existingCompany = companyRepository.findByUser(currentUser);
                Long companyId = existingCompany.map(Company::getId).orElse(0L);
                
                if (companyRepository.existsByEmailAndIdNot(companyRequest.getEmail(), companyId)) {
                    return new CompanyResponse("Email already exists for another company", false);
                }
            }
            
            Optional<Company> existingCompanyOpt = companyRepository.findByUser(currentUser);
            
            if (existingCompanyOpt.isPresent()) {
                // Update existing company
                Company existingCompany = existingCompanyOpt.get();
                updateCompanyFields(existingCompany, companyRequest);
                Company savedCompany = companyRepository.save(existingCompany);
                
                return new CompanyResponse(
                    savedCompany.getId(),
                    savedCompany.getBusinessName(),
                    savedCompany.getPhoneNumber(),
                    savedCompany.getGstin(),
                    savedCompany.getEmail(),
                    savedCompany.getBusinessType(),
                    savedCompany.getBusinessCategory(),
                    savedCompany.getState(),
                    savedCompany.getPincode(),
                    savedCompany.getBusinessAddress(),
                    savedCompany.getLogoPath(),
                    savedCompany.getSignaturePath(),
                    savedCompany.getCreatedAt(),
                    savedCompany.getUpdatedAt()
                );
            } else {
                // Create new company
                Company newCompany = new Company(
                    companyRequest.getBusinessName(),
                    companyRequest.getPhoneNumber(),
                    companyRequest.getGstin(),
                    companyRequest.getEmail(),
                    companyRequest.getBusinessType(),
                    companyRequest.getBusinessCategory(),
                    companyRequest.getState(),
                    companyRequest.getPincode(),
                    companyRequest.getBusinessAddress(),
                    currentUser
                );
                
                Company savedCompany = companyRepository.save(newCompany);
                
                return new CompanyResponse(
                    savedCompany.getId(),
                    savedCompany.getBusinessName(),
                    savedCompany.getPhoneNumber(),
                    savedCompany.getGstin(),
                    savedCompany.getEmail(),
                    savedCompany.getBusinessType(),
                    savedCompany.getBusinessCategory(),
                    savedCompany.getState(),
                    savedCompany.getPincode(),
                    savedCompany.getBusinessAddress(),
                    savedCompany.getLogoPath(),
                    savedCompany.getSignaturePath(),
                    savedCompany.getCreatedAt(),
                    savedCompany.getUpdatedAt()
                );
            }
        } catch (Exception e) {
            return new CompanyResponse("Error saving company profile: " + e.getMessage(), false);
        }
    }
    
    /**
     * Update logo path for the current user's company
     */
    public CompanyResponse updateLogo(String logoPath) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return new CompanyResponse("User not authenticated", false);
            }
            
            Optional<Company> companyOpt = companyRepository.findByUser(currentUser);
            if (companyOpt.isEmpty()) {
                return new CompanyResponse("Company profile not found", false);
            }
            
            Company company = companyOpt.get();
            company.setLogoPath(logoPath);
            companyRepository.save(company);
            
            return new CompanyResponse("Logo updated successfully", true);
        } catch (Exception e) {
            return new CompanyResponse("Error updating logo: " + e.getMessage(), false);
        }
    }
    
    /**
     * Update signature path for the current user's company
     */
    public CompanyResponse updateSignature(String signaturePath) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return new CompanyResponse("User not authenticated", false);
            }
            
            Optional<Company> companyOpt = companyRepository.findByUser(currentUser);
            if (companyOpt.isEmpty()) {
                return new CompanyResponse("Company profile not found", false);
            }
            
            Company company = companyOpt.get();
            company.setSignaturePath(signaturePath);
            companyRepository.save(company);
            
            return new CompanyResponse("Signature updated successfully", true);
        } catch (Exception e) {
            return new CompanyResponse("Error updating signature: " + e.getMessage(), false);
        }
    }
    
    /**
     * Delete company profile for the current authenticated user
     */
    public CompanyResponse deleteCompanyProfile() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return new CompanyResponse("User not authenticated", false);
            }
            
            Optional<Company> companyOpt = companyRepository.findByUser(currentUser);
            if (companyOpt.isEmpty()) {
                return new CompanyResponse("Company profile not found", false);
            }
            
            companyRepository.delete(companyOpt.get());
            return new CompanyResponse("Company profile deleted successfully", true);
        } catch (Exception e) {
            return new CompanyResponse("Error deleting company profile: " + e.getMessage(), false);
        }
    }
    
    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }
    
    /**
     * Update company fields from request
     */
    private void updateCompanyFields(Company company, CompanyRequest request) {
        if (request.getBusinessName() != null) {
            company.setBusinessName(request.getBusinessName());
        }
        if (request.getPhoneNumber() != null) {
            company.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGstin() != null) {
            company.setGstin(request.getGstin());
        }
        if (request.getEmail() != null) {
            company.setEmail(request.getEmail());
        }
        if (request.getBusinessType() != null) {
            company.setBusinessType(request.getBusinessType());
        }
        if (request.getBusinessCategory() != null) {
            company.setBusinessCategory(request.getBusinessCategory());
        }
        if (request.getState() != null) {
            company.setState(request.getState());
        }
        if (request.getPincode() != null) {
            company.setPincode(request.getPincode());
        }
        if (request.getBusinessAddress() != null) {
            company.setBusinessAddress(request.getBusinessAddress());
        }
    }
}
