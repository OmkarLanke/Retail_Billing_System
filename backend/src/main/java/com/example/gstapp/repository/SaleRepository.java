package com.example.gstapp.repository;

import com.example.gstapp.model.Sale;
import com.example.gstapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    
    List<Sale> findByUserOrderByInvoiceDateDescIdDesc(User user);
    
    List<Sale> findByUserAndInvoiceDateBetweenOrderByInvoiceDateDescIdDesc(
        User user, LocalDate startDate, LocalDate endDate);
    
    Optional<Sale> findByIdAndUser(Long id, User user);
    
    Optional<Sale> findByInvoiceNumberAndUser(String invoiceNumber, User user);
    
    boolean existsByInvoiceNumberAndUser(String invoiceNumber, User user);
    
    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.saleItems WHERE s.id = :id AND s.user = :user")
    Optional<Sale> findByIdAndUserWithItems(@Param("id") Long id, @Param("user") User user);
    
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.user = :user")
    Long countByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.user = :user")
    Double getTotalSalesAmountByUser(@Param("user") User user);
    
    @Query("SELECT COALESCE(SUM(s.balanceAmount), 0) FROM Sale s WHERE s.user = :user AND s.saleType = 'Credit'")
    Double getTotalPendingAmountByUser(@Param("user") User user);
    
    @Query("SELECT MAX(s.invoiceNumber) FROM Sale s WHERE s.user = :user")
    String findMaxInvoiceNumberByUser(@Param("user") User user);
    
    @Query("SELECT MAX(s.invoiceNumber) FROM Sale s WHERE s.user.id = :userId")
    String findMaxInvoiceNumberByUserId(@Param("userId") Long userId);
}
