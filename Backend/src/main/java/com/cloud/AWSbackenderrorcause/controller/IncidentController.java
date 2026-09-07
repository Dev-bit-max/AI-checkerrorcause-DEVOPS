package com.cloud.AWSbackenderrorcause.controller;


import com.cloud.AWSbackenderrorcause.DTO.ApiResponse;
import com.cloud.AWSbackenderrorcause.DTO.Incidentdto;
import com.cloud.AWSbackenderrorcause.services.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    public ApiResponse<List<Incidentdto>> getAllIncidents() {
        return ApiResponse.success("Incidents fetched successfully", incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ApiResponse<Incidentdto> getIncidentById(@PathVariable Long id) {
        return ApiResponse.success("Incident fetched successfully", incidentService.getIncidentById(id));
    }
}
