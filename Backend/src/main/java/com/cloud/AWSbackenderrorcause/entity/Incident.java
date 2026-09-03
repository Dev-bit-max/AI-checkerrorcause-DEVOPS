package com.cloud.AWSbackenderrorcause.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incident_id")
    private Long incidentId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "incident_type", nullable = false, length = 100)
    private String incidentType;

    @Column(name = "severity", nullable = false, length = 50)
    private String severity;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;
}