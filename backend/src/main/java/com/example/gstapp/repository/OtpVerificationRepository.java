package com.example.gstapp.repository;

import com.example.gstapp.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByPhoneAndOtpAndIsUsedFalse(String phone, String otp);
    
    @Query("SELECT o FROM OtpVerification o WHERE o.phone = :phone AND o.isUsed = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    List<OtpVerification> findActiveOtpsByPhone(@Param("phone") String phone, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(o) FROM OtpVerification o WHERE o.phone = :phone AND o.createdAt > :since")
    long countOtpsSince(@Param("phone") String phone, @Param("since") LocalDateTime since);
}
