package com.example.gstapp.repository;

import com.example.gstapp.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByMerchantId(Long merchantId);
    
    Optional<Category> findByMerchantIdAndName(Long merchantId, String name);
    
    List<Category> findByMerchantIdAndNameContainingIgnoreCase(Long merchantId, String name);
}
