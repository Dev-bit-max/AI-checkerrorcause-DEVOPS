package com.cloud.AWSbackenderrorcause.controller;

import com.cloud.AWSbackenderrorcause.DTO.AnalyzeRequestdto;
import com.cloud.AWSbackenderrorcause.DTO.ApiResponse;
import com.cloud.AWSbackenderrorcause.DTO.Reportdto;
import com.cloud.AWSbackenderrorcause.services.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyze")
@RequiredArgsConstructor
public class AnalyzeController {

    private final AnalysisService analysisService;

    @PostMapping
    public ApiResponse<Reportdto> analyzeLogs(@RequestBody AnalyzeRequestdto request) {
        return ApiResponse.success("Logs processed successfully", analysisService.processLogs(request));
    }
}