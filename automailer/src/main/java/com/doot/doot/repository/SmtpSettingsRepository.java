package com.doot.doot.repository;

import com.doot.doot.entity.SmtpSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmtpSettingsRepository extends JpaRepository<SmtpSettingsEntity, Long> {
}