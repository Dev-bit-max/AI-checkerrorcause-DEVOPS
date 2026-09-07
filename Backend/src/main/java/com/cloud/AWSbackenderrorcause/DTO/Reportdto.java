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
public class Reportdto {

    private Long reportId;
    private Long incidentId;       // just the ID, not the full Incident object
    private String summary;
    private String rootCause;
    private String recommendation;
    private String aiModelUsed;
    private LocalDateTime generatedAt;
}