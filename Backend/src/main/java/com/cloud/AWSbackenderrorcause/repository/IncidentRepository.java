package com.cloud.AWSbackenderrorcause.repository;

import com.cloud.AWSbackenderrorcause.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
}