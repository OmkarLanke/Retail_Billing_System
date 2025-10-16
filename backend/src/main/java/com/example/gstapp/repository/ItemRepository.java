package com.example.gstapp.repository;

import com.example.gstapp.model.Item;
import com.example.gstapp.model.ItemType;
import com.example.gstapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    
    List<Item> findByMerchantIdAndItemType(Long merchantId, ItemType itemType);
    
    List<Item> findByMerchantId(Long merchantId);
    
    Optional<Item> findByMerchantIdAndCode(Long merchantId, String code);
    
    List<Item> findByMerchantIdAndNameContainingIgnoreCase(Long merchantId, String name);
    
    List<Item> findByMerchantIdAndCategory(Long merchantId, String category);
    
    @Query("SELECT i FROM Item i WHERE i.merchantId = :merchantId AND " +
           "(LOWER(i.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.hsnCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Item> searchItems(@Param("merchantId") Long merchantId, @Param("searchTerm") String searchTerm);
    
    default Optional<Item> findByIdAndUser(Long id, User user) {
        Optional<Item> item = findById(id);
        if (item.isPresent() && item.get().getMerchantId().equals(user.getId())) {
            return item;
        }
        return Optional.empty();
    }
}
