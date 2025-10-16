package com.example.gstapp.repository;

import com.example.gstapp.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    
    List<Purchase> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);
    
    List<Purchase> findByMerchantIdAndStatusOrderByCreatedAtDesc(Long merchantId, String status);
    
    List<Purchase> findByMerchantIdAndPartyIdOrderByCreatedAtDesc(Long merchantId, Long partyId);
    
    @Query("SELECT p FROM Purchase p WHERE p.merchantId = :merchantId AND p.billNumber = :billNumber")
    Optional<Purchase> findByMerchantIdAndBillNumber(@Param("merchantId") Long merchantId, @Param("billNumber") String billNumber);
    
    @Query("SELECT p FROM Purchase p WHERE p.merchantId = :merchantId AND p.billDate >= :startDate AND p.billDate <= :endDate ORDER BY p.billDate DESC")
    List<Purchase> findByMerchantIdAndBillDateBetween(@Param("merchantId") Long merchantId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    // Alternative query using BETWEEN for better compatibility
    @Query("SELECT p FROM Purchase p WHERE p.merchantId = :merchantId AND p.billDate BETWEEN :startDate AND :endDate ORDER BY p.billDate DESC")
    List<Purchase> findByMerchantIdAndBillDateBetweenAlt(@Param("merchantId") Long merchantId, 
                                                         @Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.merchantId = :merchantId")
    Long countByMerchantId(@Param("merchantId") Long merchantId);
    
    @Query("SELECT MAX(p.id) FROM Purchase p WHERE p.merchantId = :merchantId")
    Optional<Long> findMaxIdByMerchantId(@Param("merchantId") Long merchantId);
}
