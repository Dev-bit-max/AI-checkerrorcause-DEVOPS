    CREATE TABLE services (
                          service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          service_name VARCHAR(255) NOT NULL,
                          service_type VARCHAR(50) NOT NULL,
                          resource_id VARCHAR(255) NOT NULL,
                          region VARCHAR(50),
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
                           incident_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           title VARCHAR(255) NOT NULL,
                           incident_type VARCHAR(100) NOT NULL,
                           severity VARCHAR(50) NOT NULL,
                           status VARCHAR(50) NOT NULL,
                           started_at TIMESTAMP NOT NULL,
                           ended_at TIMESTAMP NULL
);

CREATE TABLE incident_events (
                                 event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 incident_id BIGINT NOT NULL,
                                 service_id BIGINT NOT NULL,
                                 event_timestamp TIMESTAMP NOT NULL,
                                 event_type VARCHAR(100) NOT NULL,
                                 message TEXT,
                                 metric_name VARCHAR(100),
                                 metric_value DECIMAL(20,6),

                                 CONSTRAINT fk_event_incident
                                     FOREIGN KEY (incident_id)
                                         REFERENCES incidents(incident_id),

                                 CONSTRAINT fk_event_service
                                     FOREIGN KEY (service_id)
                                         REFERENCES services(service_id)
);

CREATE TABLE reports (
                         report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         incident_id BIGINT NOT NULL UNIQUE,
                         summary TEXT NOT NULL,
                         root_cause TEXT NOT NULL,
                         recommendation TEXT NOT NULL,
                         ai_model_used VARCHAR(100),
                         generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT fk_report_incident
                             FOREIGN KEY (incident_id)
                                 REFERENCES incidents(incident_id)
);