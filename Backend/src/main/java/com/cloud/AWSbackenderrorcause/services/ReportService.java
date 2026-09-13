package com.cloud.AWSbackenderrorcause.services;

import com.cloud.AWSbackenderrorcause.DTO.Reportdto;
import com.cloud.AWSbackenderrorcause.entity.Report;
import com.cloud.AWSbackenderrorcause.exception.ResourceNotFoundException;
import com.cloud.AWSbackenderrorcause.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public Reportdto getReportByIncidentId(Long incidentId) {

        Report report = reportRepository.findByIncident_IncidentId(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Report not found for incident id: " + incidentId));

        return mapToDto(report);
    }

    public Report saveReport(Report report) {
        return reportRepository.save(report);
    }

    public Reportdto mapToDto(Report report) {
        return new Reportdto(
                report.getReportId(),
                report.getIncident().getIncidentId(),
                report.getSummary(),
                report.getRootCause(),
                report.getRecommendation(),
                report.getAiModelUsed(),
                report.getGeneratedAt()
        );
    }
}