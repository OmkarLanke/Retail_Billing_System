package com.example.gstapp.repository;

import com.example.gstapp.model.Company;
import com.example.gstapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    /**
     * Find company by user
     */
    Optional<Company> findByUser(User user);
    
    /**
     * Find company by user ID
     */
    @Query("SELECT c FROM Company c WHERE c.user.id = :userId")
    Optional<Company> findByUserId(@Param("userId") Long userId);
    
    /**
     * Check if company exists for user
     */
    boolean existsByUser(User user);
    
    /**
     * Check if company exists for user ID
     */
    @Query("SELECT COUNT(c) > 0 FROM Company c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
    
    /**
     * Check if GSTIN already exists for other companies
     */
    @Query("SELECT COUNT(c) > 0 FROM Company c WHERE c.gstin = :gstin AND c.id != :companyId")
    boolean existsByGstinAndIdNot(@Param("gstin") String gstin, @Param("companyId") Long companyId);
    
    /**
     * Check if GSTIN already exists
     */
    boolean existsByGstin(String gstin);
    
    /**
     * Check if email already exists for other companies
     */
    @Query("SELECT COUNT(c) > 0 FROM Company c WHERE c.email = :email AND c.id != :companyId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("companyId") Long companyId);
    
    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);
}
