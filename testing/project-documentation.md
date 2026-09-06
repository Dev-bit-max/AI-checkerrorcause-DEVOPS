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

This section outlines the REST API contracts implemented by the Spring Boot backend (`http://localhost:8081`), defining endpoints, payloads, and response structures for log ingestion, AI root-cause analysis, and dashboard reporting.

---

### **1. Ingest Raw AWS Cloud Logs**

Accepts and stores raw incoming operational events from AWS CloudWatch before processing.

* **Endpoint:** `POST /api/logs`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "source": "AWS CloudWatch",
  "service": "ALB / Lambda",
  "timestamp": "2026-08-31T20:00:00Z",
  "logMessage": "503 Service Unavailable: Target response timeout"
}
```
* **Success Response (`200 OK`):**
```json
{
  "status": "SUCCESS",
  "message": "Log entry ingested successfully",
  "logId": 1042
}
```
* **Error Codes:** `400 Bad Request` (malformed JSON or missing fields).

---

### **2. Trigger AI Root-Cause Analysis**

Transfers failure logs to the AI layer (OpenAI/OpenRouter) to generate timeline correlations, determine the root cause, and propose mitigation strategies.

* **Endpoint:** `POST /api/analyze`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "service": "EC2 / RDS / ALB",
  "errorLogs": [
    "10:01:00 AM [EC2-App-01] WARNING: CPU utilization spiked to 98%",
    "10:02:15 AM [RDS-MySQL-Primary] ERROR: Connection pool exhausted",
    "10:04:10 AM [AWS-ALB] HTTP 503 Service Unavailable"
  ]
}
```
* **Success Response (`200 OK`):**
```json
{
  "incidentId": "INC-8421",
  "rootCause": "RDS MySQL database connection pool exhaustion triggered by upstream EC2 CPU saturation",
  "timeline": [
    { "time": "10:01:00 AM", "event": "EC2 CPU spiked to 98%" },
    { "time": "10:02:15 AM", "event": "RDS connection pool exhausted" },
    { "time": "10:04:10 AM", "event": "ALB returned 503 Service Unavailable" }
  ],
  "recommendations": [
    "Increase RDS max_connections configuration and connection pool capacity",
    "Configure auto-scaling triggers on EC2 based on 75% CPU threshold",
    "Profile and optimize slow-running database queries"
  ],
  "severity": "HIGH",
  "status": "ANALYZED"
}
```
* **Error Codes:** `400 Bad Request` (empty log array), `500 Internal Server Error` (AI service unreachable or failed to parse JSON).

---

### **3. Retrieve All Incidents**

Supplies Krutant's React dashboard with historical incident overviews populated from Ketaki's MySQL database.

* **Endpoint:** `GET /api/incidents`
* **Success Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "incidentKey": "INC-8421",
    "serviceName": "EC2 / RDS",
    "severity": "HIGH",
    "status": "RESOLVED",
    "createdAt": "2026-08-31T10:05:00Z"
  }
]
```
* **Error Codes:** `500 Internal Server Error` (database query failure).

---

### **4. Retrieve Specific Incident Report by ID**

Fetches detailed AI breakdown, event timelines, and recommendations for a single incident record.

* **Endpoint:** `GET /api/reports/{id}`
* **Parameters:** `id` (Path variable, Integer)
* **Success Response (`200 OK`):**
```json
{
  "reportId": 1,
  "incidentId": 1,
  "rootCause": "RDS MySQL database connection pool exhaustion",
  "aiModelUsed": "gpt-4o / openrouter",
  "confidenceScore": 0.94,
  "recommendation": "Increase RDS max_connections parameter and scale instance.",
  "generatedAt": "2026-08-31T10:05:30Z"
}
```
* **Error Codes:** `404 Not Found` (invalid report ID), `400 Bad Request` (non-numeric ID).

---

## 6. Test Plan & QA Results
*(Postman assertions, test datasets, status code validations, and regression test results).*

---

## 7. User Manual & Local Setup Guide
*(Step-by-step guide to run MySQL, Spring Boot backend, and React frontend locally).*
