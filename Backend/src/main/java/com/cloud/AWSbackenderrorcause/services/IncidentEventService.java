package com.cloud.AWSbackenderrorcause.services;

import com.cloud.AWSbackenderrorcause.DTO.IncidentEventdto;
import com.cloud.AWSbackenderrorcause.DTO.LogEntrydto;
import com.cloud.AWSbackenderrorcause.entity.Incident;
import com.cloud.AWSbackenderrorcause.entity.IncidentEvent;
import com.cloud.AWSbackenderrorcause.entity.Service;
import com.cloud.AWSbackenderrorcause.exception.ResourceNotFoundException;
import com.cloud.AWSbackenderrorcause.repository.IncidentEventRepository;
import com.cloud.AWSbackenderrorcause.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.cloud.AWSbackenderrorcause.DTO.IncidentEventdto;
import com.cloud.AWSbackenderrorcause.DTO.LogEntrydto;
import java.math.BigDecimal;
import java.util.List;
@Component
@RequiredArgsConstructor
public class IncidentEventService {

    private final IncidentEventRepository incidentEventRepository;
    private final ServiceRepository serviceRepository;

    public IncidentEvent saveEvent(LogEntrydto dto, Incident incident) {
        Service service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service not found with id: " + dto.getServiceId()));

        IncidentEvent event = new IncidentEvent();
        event.setIncident(incident);
        event.setService(service);
        event.setEventTimestamp(dto.getEventTimestamp());
        event.setEventType(dto.getEventType());
        event.setMessage(dto.getMessage());
        event.setMetricName(dto.getMetricName());
        event.setMetricValue(parseMetricValue(dto.getMetricValue()));

        return incidentEventRepository.save(event);
    }
    public List<IncidentEventdto> getAllEvents() {
        return incidentEventRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private IncidentEventdto mapToDto(IncidentEvent event) {
        return new IncidentEventdto(
                event.getEventId(),
                event.getIncident().getIncidentId(),
                event.getService().getServiceId(),
                event.getEventTimestamp(),
                event.getEventType(),
                event.getMessage(),
                event.getMetricName(),
                event.getMetricValue()
        );
    }
    private BigDecimal parseMetricValue(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) return null;
        try {
            String cleaned = rawValue.replaceAll("[^0-9.\\-]", "");
            //stripes out all things except numbers which eventually will help to process easily
            if (cleaned.isBlank()) return null;
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }

    }
}