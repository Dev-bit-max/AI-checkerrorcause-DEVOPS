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
public class Incidentdto {

    private Long incidentId;
    private String title;
    private String incidentType;
    private String severity;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}