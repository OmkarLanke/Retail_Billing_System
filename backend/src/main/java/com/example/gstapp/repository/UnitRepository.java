package com.example.gstapp.repository;

import com.example.gstapp.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    
    List<Unit> findByMerchantId(Long merchantId);
    
    Optional<Unit> findByMerchantIdAndName(Long merchantId, String name);
    
    List<Unit> findByMerchantIdAndNameContainingIgnoreCase(Long merchantId, String name);
}
