package com.cloud.AWSbackenderrorcause.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogEntrydto {
    private Long incidentId;
    private Long serviceId;        // which service this log came from
    private String metricName;
    private String metricValue;
    private String message;
    private String eventType;
    private LocalDateTime eventTimestamp;
}