# AI-Powered Root Cause Analyzer for Cloud Failures
**Project Documentation & Technical Specification**

---

## 1. Executive Summary & Problem Statement
Modern cloud applications hosted on AWS generate thousands of log lines across services (EC2, RDS, ALB, Lambda, CloudWatch). Manual log investigation takes 30 to 90 minutes. This project automates log correlation, AI-driven root cause identification, and report generation, reducing MTTR down to 2–5 minutes.

---

## 2. System Architecture & Workflow
* **Log Ingestion:** AWS CloudWatch / CloudTrail logs collected via Spring Boot.
* **AI Analysis:** OpenAI GPT API ingests cleaned logs, detects root causes, and recommends fixes.
* **Storage:** Incidents and reports stored in MySQL via Spring Data JPA.
* **Visualization:** React + Tailwind CSS dashboard displays metrics, timelines, and summaries.

---

## 3. Technology Stack & Team Roles
* **Frontend:** React.js, Tailwind CSS (Krutant)
* **Backend:** Spring Boot, Java, REST APIs (Divyanshu - Team Lead)
* **Database:** MySQL, Spring Data JPA (Ketaki)
* **Cloud Infrastructure:** AWS EC2, RDS, ALB, CloudWatch, CloudTrail (Sakshi)
* **AI Engine:** OpenAI GPT API (Soham)
* **Testing & Documentation:** Postman, QA Automation, System Docs (Malhar)

---

## 4. Database Schema Overview (4 Tables)

### 1. `incidents`
Stores core incident metadata.
* `incident_id` (Primary Key, INT)
* `title` (VARCHAR)
* `status` (VARCHAR - e.g., OPEN, INVESTIGATING, RESOLVED)
* `severity` (VARCHAR - e.g., CRITICAL, HIGH, MEDIUM)
* `incident_type` (VARCHAR - e.g., PERFORMANCE_DEGRADATION, OUTAGE)
* `started_at` (TIMESTAMP)
* `ended_at` (TIMESTAMP, Nullable)

### 2. `incident_events`
Tracks individual chronological timeline events belonging to an incident.
* `event_id` (Primary Key, INT)
* `incident_id` (Foreign Key referencing `incidents.incident_id`)
* `service_id` (Foreign Key referencing `services.service_id`)
* `event_timestamp` (TIMESTAMP)
* `event_type` (VARCHAR - e.g., LOG_WARNING, ALARM_TRIGGERED)
* `message` (TEXT)
* `metric_name` (VARCHAR - e.g., CPUUtilization, ConnectionCount)
* `metric_value` (VARCHAR / FLOAT)

### 3. `reports`
Stores AI-generated root cause analysis output.
* `report_id` (Primary Key, INT)
* `incident_id` (Foreign Key referencing `incidents.incident_id`)
* `summary` (TEXT)
* `root_cause` (TEXT)
* `recommendation` (TEXT)
* `ai_model_used` (VARCHAR - e.g., gpt-4o, gpt-3.5-turbo)
* `generated_at` (TIMESTAMP)

### 4. `services`
Tracks cloud services monitored by the system.
* `service_id` (Primary Key, INT)
* `service_name` (VARCHAR - e.g., ec2-app-server, rds-mysql-primary)
* `service_type` (VARCHAR - e.g., EC2, RDS, ALB, Lambda)
* `resource_id` (VARCHAR - e.g., ARN or Instance ID)
* `region` (VARCHAR - e.g., us-east-1)
* `created_at` (TIMESTAMP)

---

## 5. API Reference
* `POST /api/logs` - Ingest raw AWS logs.
* `POST /api/analyze` - Trigger AI root cause analysis.
* `GET /api/incidents` - Retrieve list of all incidents.
* `GET /api/reports/{id}` - Fetch incident report by ID.

---

## 6. Test Plan & QA Results
*(Postman assertions, test datasets, status code validations, and regression test results).*

---

## 7. User Manual & Local Setup Guide
*(Step-by-step guide to run MySQL, Spring Boot backend, and React frontend locally).*
