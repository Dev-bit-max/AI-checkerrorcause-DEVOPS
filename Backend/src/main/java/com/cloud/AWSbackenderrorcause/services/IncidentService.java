package com.cloud.AWSbackenderrorcause.services;


import com.cloud.AWSbackenderrorcause.DTO.Incidentdto;
import com.cloud.AWSbackenderrorcause.entity.Incident;
import com.cloud.AWSbackenderrorcause.exception.ResourceNotFoundException;
import com.cloud.AWSbackenderrorcause.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public List<Incidentdto> getAllIncidents() {
        return incidentRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public Incidentdto getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
        return mapToDto(incident);
    }

    private Incidentdto mapToDto(Incident incident) {
        return new Incidentdto(
                incident.getIncidentId(),
                incident.getTitle(),
                incident.getIncidentType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getStartedAt(),
                incident.getEndedAt()
        );
    }
}