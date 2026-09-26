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

### Postman Test Execution Matrix

| Test ID | Endpoint | Method | Expected Status | Actual Status | Latency | Assertion Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `/api/incidents` | GET | 200 OK | 200 OK | 142 ms | PASS (4/4 assertions) |
| **TC-02** | `/api/incidents/1` | GET | 200 OK | 200 OK | 118 ms | PASS (2/2 assertions) |
| **TC-03** | `/api/reports/1` | GET | 200 OK | 200 OK | 134 ms | PASS (2/2 assertions) |
| **TC-04** | `/api/logs` | POST | 200 OK | 200 OK | 185 ms | PASS (Log ingestion verified via UI) |
| **TC-05** | `/api/analyze` | POST | 200 OK | 200 OK | 1,420 ms | PASS (AI report verified via Incident #29) |

### Test Verification & Evidence
* **TC-01 Evidence:** Verified incident array structure mapped from AWS RDS MySQL (`./screenshots/test-get-all-incidents-pass.png`).
* **TC-02 Evidence:** Verified single incident entity retrieval (`./screenshots/test-get-single-incident-pass.png`).
* **TC-03 Evidence:** Verified diagnostic report, root cause detection payload, and recommendation payload (`./screenshots/test-get-report-pass.png`).
* **TC-04 Evidence:** Log ingestion verified end-to-end via UI submission form (`./screenshots/ui-log-analysis-form.jpeg`).
* **TC-05 Evidence:** AI Root Cause report generation verified end-to-end via UI dashboard (`./screenshots/ui-ai-report-generated.jpeg`).

---

### Defect Resolution Summary

All defects logged during QA execution have been resolved and closed. Detailed reproduction steps, developer collaboration logs, and patch histories are documented in [`bug-tracker.md`](./bug-tracker.md).

| Defect ID | Module | Title | Severity | Resolution Summary | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-001 (BUG-001)** | AI Layer | Upstream OpenRouter Model / Token Rejection | High | Updated model slug and API key binding in `application.yml`. Verified on UI Incident #29. | **CLOSED** |
| **DEF-002 (BUG-002)** | Backend | Missing `@PostMapping` for `/api/logs` | Medium | Divyanshu added `@PostMapping` ingestion handler. Verified via UI log form. | **CLOSED** |
| **DEF-003 (BUG-003)** | Backend/DB | JPA `The given id must not be null` | High | Standardized payload contract to `{"incidentId": <id>}` with Ketaki. Verified via database lookups. | **CLOSED** |

## 7. User Manual & Local Setup Guide

This guide provides end-to-end instructions for spinning up the local development environment, verifying services, and operating the AI-Powered Root Cause Analyzer to diagnose cloud infrastructure failures.

---

### **Part 1: Prerequisites & Environment Setup**

Ensure the following tools are installed and verified on the host machine before running the application stack:

| Component | Required Version | Verification Command | Notes / Purpose |
| :--- | :--- | :--- | :--- |
| **Java Development Kit** | JDK 17 or 21 (LTS) | `java -version` | Runtime environment for Spring Boot backend |
| **Node.js & npm** | Node v18+ / npm v9+ | `node -v && npm -v` | Runtime environment for React dashboard |
| **MySQL / Cloud Database** | MySQL 8.0+ / AWS RDS | `mysql --version` | Relational storage for incidents, services, and reports |
| **Git** | Git 2.40+ | `git --version` | Version control & repository syncing |
| **Postman** | Desktop App | N/A (GUI application) | API testing and endpoint validation |

---

### **Part 2: Step-by-Step Local Deployment**

#### **1. Database Provisioning & Schema**
The backend repository connects to AWS RDS MySQL via Spring Data JPA and Hibernate auto-DDL (`hibernate.ddl-auto: update`):
* **AWS RDS MySQL Instance:** The project connects to AWS RDS on port `3306` (`ai-root-cause-db.cijk6ok82wrd.us-east-1.rds.amazonaws.com`). Ensure outbound network connectivity on port 3306 is allowed.
* **Local MySQL (Alternative):** If running against a local database instance:
  ```sql
  CREATE DATABASE rootcauseanalyzer;
  USE rootcauseanalyzer;
  ```
  Hibernate will automatically generate `incidents`, `incident_events`, `reports`, and `services` upon application startup.

#### **2. Backend Service Configuration (Spring Boot)**
1. Navigate to the backend directory:
   ```powershell
   cd Backend
   ```
2. Open `src/main/resources/application.yml` and verify the active profile and connection settings:
   ```yaml
   spring:
     profiles:
       active: aws   # or set to local if using a local MySQL instance

     datasource:
       url: jdbc:mysql://[gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sys?sslMode=VERIFY_IDENTITY](https://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sys?sslMode=VERIFY_IDENTITY)
       username: <DB_USERNAME>
       password: <DB_PASSWORD>
       driver-class-name: com.mysql.cj.jdbc.Driver

     jpa:
       hibernate:
         ddl-auto: update
         properties:
           hibernate:
             dialect: org.hibernate.dialect.MySQLDialect

   server:
     port: 8081

   openai:
     api:
       key: <OPENAI_OR_OPENROUTER_API_KEY>
   ```
   *(Ensure the OpenAI/OpenRouter API key is populated to prevent NPE failures during AI report generation).*

3. Launch the Spring Boot application:
   * **Windows (PowerShell):**
     ```powershell
     ./mvnw.cmd spring-boot:run
     ```
   * **Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
4. Confirm startup by checking the console logs:
   ```text
   Tomcat started on port 8081 (http) with context path ''
   Started AWSbackenderrorcause in X.XXX seconds
   ```

#### **3. Frontend Dashboard Launch (React.js)**
1. Open a separate terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Confirm that the API base URL in the frontend client configuration points to `http://localhost:8081`.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to http://localhost:5173.

---

### **Part 3: User Manual – Operating the Analyzer**

#### **Step 1: Ingesting Telemetry & Triggering Analysis**
* **Automated / UI Submission:** 
1.Open the React Dashboard at http://localhost:5173.
2.Navigate to the Incident Analysis submission form.
3.Paste the multi-service failure sequence (EC2 CPU Spike -> RDS Timeout -> ALB 503) and click Analyze Incident.
* **Postman API Simulation:**
  1. Open Postman and select the request `POST Trigger AI Analysis` (`http://localhost:8081/api/analyze`).
  2. In the **Body** tab (`raw` > `JSON`), supply the target `serviceId` and chronological failure sequence:
     ```json
     {
       "incidentId": 29
     }
     ```
  3. Click **Send** to trigger AI cascade analysis.

#### **Step 2: Inspecting the AI Root Cause Report**
Review the response in Postman or inspect the React Dashboard:
* **Incident Header:** Incident identifier, affected service name, severity level, and resolution status.
* **Chronological Timeline:** Visual nodes depicting failure progression (e.g., EC2 CPU spike at 10:01 $\rightarrow$ RDS pool exhaustion at 10:02 $\rightarrow$ ALB 503 at 10:04).
* **Identified Root Cause:** Synthesized diagnostic narrative pinpointing the primary bottleneck.
* **Prescribed Recommendations:** Actionable mitigation steps (e.g., scale RDS connection pool capacity, configure EC2 auto-scaling thresholds).

#### **Step 3: Accessing Historical Incident Records**
1. In Postman, execute `GET /api/incidents` (`TC-01`) to retrieve all historical incidents.
2. Execute `GET /api/incidents/{id}` (`TC-02`) or `GET /api/reports/{id}` (`TC-03`) to retrieve full diagnostics for an existing record.

---

### **Part 4: Troubleshooting Common Issues**

* **Backend Port Conflict:** If port `8081` is already occupied, update `server.port: 8082` in `application.yml` and update the base URL in Postman and the React frontend.
* **Database Connection Failure (`Communications link failure`):**
  * Ensure your host machine has outbound internet connectivity to the AWS RDS endpoint on port 3306, or verify that AWS security group inbound rules permit access.
* **JPA ID Null Exception (`BUG-003`):** Ensure the payload to POST /api/analyze targets an existing persisted entity via {"incidentId": <id>} rather than passing raw unpersisted log arrays directly.
* **AI Analysis Failure (`BUG-001`):** AI Analysis Failure (BUG-001): Ensure the OpenRouter API key has active quota and the model slug in LogAnalysisService.java is active (e.g., nvidia/nemotron-3-ultra-550b-a55b:free).

## 8. Failure Scenario & Dataset Validation

To validate the analyzer's diagnostic capabilities against complex multi-service cascading failures, simulated incident telemetry was structured in `testing/datasets/failure-scenarios.json`:

* **Scenario 1 (RDS Cascade):** Validates that when EC2 CPU utilization spikes to 98% and causes an RDS connection pool exhaustion resulting in ALB 503 errors, the AI model correctly identifies the upstream database connection pool exhaustion as the true root cause rather than incorrectly attributing the fault to the load balancer.
* **Scenario 2 (Lambda Cold Start / Saturation):** Validates detection of serverless function memory timeouts causing downstream API Gateway 504 timeouts.
* **Scenario 3 (IAM / Security):** Validates detection of CloudTrail authorization denial logs and permission misconfigurations.

---

## 9. QA Sign-Off & Verification Criteria

| Verification Metric | Target Threshold | Final Result | Verification Status |
| :--- | :--- | :--- | :--- |
| **Core Read Endpoints** | 100% Pass (TC-01, TC-02, TC-03) | 3 / 3 Verified | **PASSED** |
| **Log Ingestion Pipeline** | Parse and ingest AWS telemetry (TC-04) | Ingestion verified via UI form | **PASSED** |
| **AI Incident Analysis** | End-to-end root cause generation (TC-05) | Validated via Incident #29 UI | **PASSED** |
| **API Latency Compliance** | Read < 300 ms, AI pipeline < 2,500 ms | 118 ms – 1,420 ms observed | **PASSED** |
| **Defect Resolution Rate** | 100% Closed (BUG-001, BUG-002, BUG-003) | 3 / 3 Defects Resolved | **PASSED** |
| **Documentation & User Manual** | Complete setup guide, schema & test matrix | Sections 1 through 9 finalized | **PASSED** |

### QA Final Verdict
The AI-Powered Root Cause Analyzer application core interfaces, database models, and diagnostic pipelines have been verified against functional requirements[cite: 14]. All identified defects (BUG-001, BUG-002, BUG-003) have been resolved, and end-to-end integration across the React Frontend, Spring Boot Backend, AWS RDS MySQL, and the OpenRouter AI Analysis Layer is verified and signed off for presentation and deployment.

* **Module Owner (Testing & Documentation):** Malhar
* **Phase:** Phase 4 (Final Testing, Documentation & QA Sign-Off)
* **Date:** 26 September 2026
* **Sign-Off Status:** **APPROVED / READY FOR SUBMISSION**