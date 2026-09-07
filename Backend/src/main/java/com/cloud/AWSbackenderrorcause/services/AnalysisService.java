package com.cloud.AWSbackenderrorcause.services;

import com.cloud.AWSbackenderrorcause.Ai.GptAnalysisResult;
import com.cloud.AWSbackenderrorcause.Ai.LogAnalysisService;
import com.cloud.AWSbackenderrorcause.DTO.AnalyzeRequestdto;
import com.cloud.AWSbackenderrorcause.DTO.LogEntrydto;
import com.cloud.AWSbackenderrorcause.entity.Incident;
import com.cloud.AWSbackenderrorcause.entity.Report;
import com.cloud.AWSbackenderrorcause.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AnalysisService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventService incidentEventService;
    private final ReportService reportService;
    private final LogAnalysisService logAnalysisService;

    public Report processLogs(AnalyzeRequestdto request) {

        // 1. Validate request
        if (request.getLogs() == null || request.getLogs().isEmpty()) {
            throw new IllegalArgumentException("No logs provided");
        }

        // 2. Find existing OPEN incident or create a new one
        Incident incident = incidentRepository.findAll().stream()
                .filter(i -> "OPEN".equalsIgnoreCase(i.getStatus()))
                .findFirst()
                .orElseGet(() -> createNewIncident(request));

        // 3. Save every log as an incident event
        request.getLogs().forEach(log ->
                incidentEventService.saveEvent(log, incident));

        // 4. Extract only messages for AI
        List<String> errorLogs = request.getLogs().stream()
                .map(LogEntrydto::getMessage)
                .filter(msg -> msg != null && !msg.isBlank())
                .toList();

        String serviceName = "service-" + request.getServiceId();

        // 5. AI Analysis
        GptAnalysisResult aiResult = logAnalysisService.analyze(serviceName, errorLogs);

        // 6. Build & save report
        Report report = buildReport(incident, aiResult);
        return reportService.saveReport(report);
    }

    private Report buildReport(Incident incident, GptAnalysisResult aiResult) {

        Report report = new Report();
        report.setIncident(incident);

        report.setRootCause(aiResult.getRootCause());

        // Soham will provide summary later
        //report.setSummary(aiResult.getSummary());

        report.setRecommendation(
                String.join("; ", aiResult.getRecommendations())
        );

        report.setAiModelUsed("gpt-4o-mini");
        report.setGeneratedAt(LocalDateTime.now());

        return report;
    }

    private Incident createNewIncident(AnalyzeRequestdto request) {

        Incident incident = new Incident();

        incident.setTitle("Failure - Service " + request.getServiceId());
        incident.setIncidentType(detectIncidentType(request.getLogs()));
        incident.setSeverity(calculateSeverity(request.getLogs()));
        incident.setStatus("OPEN");
        incident.setStartedAt(LocalDateTime.now());

        return incidentRepository.save(incident);
    }

    private String calculateSeverity(List<LogEntrydto> logs) {

        String text = logs.stream()
                .map(LogEntrydto::getMessage)
                .reduce("", String::concat)
                .toLowerCase();

        if (text.contains("503"))
            return "CRITICAL";

        if (text.contains("timeout"))
            return "HIGH";

        return "MEDIUM";
    }

    private String detectIncidentType(List<LogEntrydto> logs) {

        String text = logs.stream()
                .map(LogEntrydto::getMessage)
                .reduce("", String::concat)
                .toLowerCase();

        if (text.contains("database"))
            return "DATABASE";

        if (text.contains("cpu"))
            return "INFRASTRUCTURE";

        if (text.contains("lambda"))
            return "SERVERLESS";

        return "APPLICATION";
    }
}