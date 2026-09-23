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


    private Long incidentId;
    // optional: which service triggered this
}
