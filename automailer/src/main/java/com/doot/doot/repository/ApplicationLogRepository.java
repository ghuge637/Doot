package com.doot.doot.repository;

import com.doot.doot.entity.ApplicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationLogRepository extends JpaRepository<ApplicationLog, Long> {
    List<ApplicationLog> findAllByOrderBySentAtDesc();
    boolean existsByRecipientEmailIgnoreCaseAndStatus(String recipientEmail, String status);
}