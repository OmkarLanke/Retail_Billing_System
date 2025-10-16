package com.example.gstapp.repository;

import com.example.gstapp.model.Party;
import com.example.gstapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartyRepository extends JpaRepository<Party, Long> {
    
    List<Party> findByMerchantIdAndIsActiveTrueOrderByNameAsc(Long merchantId);
    
    List<Party> findByMerchantIdAndIsActiveTrueAndNameContainingIgnoreCaseOrderByNameAsc(Long merchantId, String name);
    
    Optional<Party> findByIdAndMerchantIdAndIsActiveTrue(Long id, Long merchantId);
    
    @Query("SELECT p FROM Party p WHERE p.merchantId = :merchantId AND p.isActive = true " +
           "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY p.name ASC")
    List<Party> searchParties(@Param("merchantId") Long merchantId, @Param("searchTerm") String searchTerm);
    
    boolean existsByMerchantIdAndNameAndIsActiveTrue(Long merchantId, String name);
    
    boolean existsByMerchantIdAndPhoneAndIsActiveTrue(Long merchantId, String phone);
    
    boolean existsByMerchantIdAndEmailAndIsActiveTrue(Long merchantId, String email);
    
    default Optional<Party> findByIdAndUser(Long id, User user) {
        return findByIdAndMerchantIdAndIsActiveTrue(id, user.getId());
    }
}
