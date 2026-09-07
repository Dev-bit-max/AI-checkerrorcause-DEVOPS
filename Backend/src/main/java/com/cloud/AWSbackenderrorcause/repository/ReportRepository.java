package com.cloud.AWSbackenderrorcause.repository;

import com.cloud.AWSbackenderrorcause.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByIncident_IncidentId(Long incidentId);

}