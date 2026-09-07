package com.cloud.AWSbackenderrorcause.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeRequestdto {

    private List<LogEntrydto> logs;   // the batch of logs to analyze
    private Long serviceId;
    // optional: which service triggered this
}
