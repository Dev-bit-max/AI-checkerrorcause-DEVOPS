package com.cloud.AWSbackenderrorcause.repository;

import com.cloud.AWSbackenderrorcause.entity.IncidentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentEventRepository extends JpaRepository<IncidentEvent, Long> {
}