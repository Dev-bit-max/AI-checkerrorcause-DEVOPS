package com.cloud.AWSbackenderrorcause.DTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IncidentEventdto {
    private Long eventId;
    private Long incidentId;
    private Long serviceId;
    private LocalDateTime eventTimestamp;
    private String eventType;
    private String message;
    private String metricName;
    private BigDecimal metricValue;
}
