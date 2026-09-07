package com.cloud.AWSbackenderrorcause.controller;


import com.cloud.AWSbackenderrorcause.DTO.ApiResponse;
import com.cloud.AWSbackenderrorcause.DTO.IncidentEventdto;
import com.cloud.AWSbackenderrorcause.DTO.IncidentEventdto;
import com.cloud.AWSbackenderrorcause.services.IncidentEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final IncidentEventService incidentEventService;

    @GetMapping
    public ApiResponse<List<IncidentEventdto>> getAllLogs() {
        return ApiResponse.success("Logs fetched successfully", incidentEventService.getAllEvents());
    }
}
