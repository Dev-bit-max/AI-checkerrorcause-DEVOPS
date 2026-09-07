package com.cloud.AWSbackenderrorcause.controller;


import com.cloud.AWSbackenderrorcause.DTO.ApiResponse;
import com.cloud.AWSbackenderrorcause.DTO.Reportdto;

import com.cloud.AWSbackenderrorcause.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/{incidentId}")
    public ApiResponse<Reportdto> getReportByIncidentId(@PathVariable Long incidentId) {
        return ApiResponse.success("Report fetched successfully", reportService.getReportByIncidentId(incidentId));
    }
}
