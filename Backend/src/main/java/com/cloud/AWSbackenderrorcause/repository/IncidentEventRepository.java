package com.cloud.AWSbackenderrorcause.repository;

import com.cloud.AWSbackenderrorcause.entity.IncidentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentEventRepository extends JpaRepository<IncidentEvent, Long> {
    List<IncidentEvent> findByIncident_IncidentId(Long incidentId);
}