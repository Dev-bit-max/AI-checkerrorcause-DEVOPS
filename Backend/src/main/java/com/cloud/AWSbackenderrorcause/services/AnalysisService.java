package com.cloud.AWSbackenderrorcause.services;

import com.cloud.AWSbackenderrorcause.Ai.GptAnalysisResult;
import com.cloud.AWSbackenderrorcause.Ai.LogAnalysisService;
import com.cloud.AWSbackenderrorcause.DTO.AnalyzeRequestdto;
import com.cloud.AWSbackenderrorcause.DTO.IncidentEventdto;
import com.cloud.AWSbackenderrorcause.DTO.Reportdto;
import com.cloud.AWSbackenderrorcause.entity.Incident;
import com.cloud.AWSbackenderrorcause.entity.Report;
import com.cloud.AWSbackenderrorcause.exception.ResourceNotFoundException;
import com.cloud.AWSbackenderrorcause.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AnalysisService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventService incidentEventService;
    private final ReportService reportService;
    private final LogAnalysisService logAnalysisService;

    @Transactional
    public Reportdto processLogs(AnalyzeRequestdto request) {

        // 1. Fetch existing incident
        Incident incident = incidentRepository.findById(request.getIncidentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incident not found"));

        // 2. Fetch all logs of this incident
        List<IncidentEventdto> logs =
                incidentEventService.getEventsByIncidentId(request.getIncidentId());

        if (logs.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No logs found for this incident");
        }

        // 3. Extract log messages
        List<String> errorLogs = logs.stream()
                .map(IncidentEventdto::getMessage)
                .filter(msg -> msg != null && !msg.isBlank())
                .toList();

        // 4. AI Analysis
        GptAnalysisResult aiResult =
                logAnalysisService.analyze("service", errorLogs);

        // 5. Build report
        Report report = buildReport(incident, aiResult);

        // 6. Save & return
        Report savedReport = reportService.saveReport(report);

        return reportService.mapToDto(savedReport);
    }

    private Report buildReport(Incident incident,
                               GptAnalysisResult aiResult) {

        Report report = new Report();

        report.setIncident(incident);

        report.setRootCause(aiResult.getRootCause());

        report.setSummary(
                aiResult.getSummary() != null &&
                        !aiResult.getSummary().isBlank()
                        ? aiResult.getSummary()
                        : "Summary pending — AI layer did not return one"
        );

        report.setRecommendation(
                String.join("; ", aiResult.getRecommendations())
        );

       report.setAiModelUsed("nvidia/nemotron-3-ultra-550b-a55b:free");
        report.setGeneratedAt(LocalDateTime.now());

        return report;
    }
}