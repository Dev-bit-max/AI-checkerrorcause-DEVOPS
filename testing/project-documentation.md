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
| **TC-01** | `/api/incidents` | GET | 200 OK | 200 OK | 1.42 s | PASS (4/4 assertions) |
| **TC-02** | `/api/incidents/1` | GET | 200 OK | 200 OK | 1.40 s | PASS (2/2 assertions) |
| **TC-03** | `/api/reports/1` | GET | 200 OK | 200 OK | 411 ms | PASS (2/2 assertions) |
| **TC-04** | `/api/logs` | POST | 200 OK | 500 Internal Server Error | 53 ms | FAIL (Missing `@PostMapping` in `LogController.java`; logged as BUG-002) |
| **TC-05** | `/api/analyze` | POST | 200 OK | 500 Internal Server Error | 1.13 s | FAIL (JPA ID null error during event persistence; logged as BUG-003) |
> **Note on Active Defects:** Full reproduction steps, stack traces, and developer assignments for **BUG-002** (Divyanshu) and **BUG-003** (Divyanshu/Ketaki) are tracked in [`bug-tracker.md`](./bug-tracker.md).

### Test Verification & Evidence
* **TC-01 Evidence:** Verified incident array structure mapped from AWS RDS MySQL (`./screenshots/test-get-all-incidents-pass.png`).
* **TC-02 Evidence:** Verified single incident entity retrieval (`./screenshots/test-get-single-incident-pass.png`).
* **TC-03 Evidence:** Verified diagnostic report, root cause detection payload, and recommendation payload (`./screenshots/test-get-report-pass.png`).
* **TC-04 Evidence:** Log ingestion failed with `Request method 'POST' is not supported` (`./screenshots/test-ingest-logs-fail.png`).
* **TC-05 Evidence:** AI root-cause analysis failed with internal JPA null ID exception (`./screenshots/test-analyze-jpa-id-fail.png`).
---

### Active Defect Logs

#### Defect Report: DEF-001 (AI Analysis Integration Failure)

| Attribute | Details |
|---|---|
| **Defect ID** | DEF-001 |
| **Endpoint** | `POST http://localhost:8081/api/analyze` |
| **Status** | Open / Blocked |
| **Severity** | High / Blocker for Incident Analysis Pipeline |
| **Component** | `LogAnalysisService.java` (lines 33–36) |
| **Assigned Module Owner** | Soham (AI & Log Intelligence) |
| **Backend Lead** | Divyanshu |
| **Reporter** | Malhar (Testing & Documentation Module) |

##### Description
When invoking `POST /api/analyze` with a valid JSON payload containing 4 cloud log events, the backend fails to generate an AI incident report and returns HTTP 500 Internal Server Error.

##### Actual Server Response
- **HTTP Status:** `500 Internal Server Error`
- **Response Payload:**
```json
{
  "data": null,
  "message": "Something went wrong: AI log analysis failed: 401 Unauthorized on POST request for \"[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)\": [no body]",
  "success": false,
  "timestamp": "2026-09-19T19:25:05.1190294"
}
```

##### Diagnostic Findings
1. **API Key Authentication Test:** The shared team OpenRouter API key was tested independently via `curl.exe https://openrouter.ai/api/v1/auth/key` and confirmed valid, active, and holding 50/50 remaining daily requests on the free tier.
2. **Hardcoded Model Slug:** In `LogAnalysisService.java`, line 34 specifies `"model": "openrouter/free"`. OpenRouter rejects this slug as invalid or deprecated, causing the upstream call to abort.
3. **Exception Handling:** `LogAnalysisService.java` wraps this failure into a generic runtime exception, surfacing as an internal server error to the caller.

##### Required Action from AI Module Owner
Soham must update `LogAnalysisService.java` to point to an active routing model identifier or implement a fallback mock handler so that endpoint verification can complete.

## 7. User Manual & Local Setup Guide

This guide provides end-to-end instructions for spinning up the local development environment, verifying services, and operating the AI-Powered Root Cause Analyzer to diagnose cloud infrastructure failures.

---

### **Part 1: Prerequisites & Environment Setup**

Ensure the following tools are installed and verified on the host machine before running the application stack:

| Component | Required Version | Verification Command | Notes / Purpose |
| :--- | :--- | :--- | :--- |
| **Java Development Kit** | JDK 17 or 21 (LTS) | `java -version` | Runtime environment for Spring Boot backend |
| **Node.js & npm** | Node v18+ / npm v9+ | `node -v && npm -v` | Runtime environment for React dashboard |
| **MySQL / Cloud Database** | MySQL 8.0+ / TiDB Cloud | `mysql --version` | Relational storage for incidents, services, and reports |
| **Git** | Git 2.40+ | `git --version` | Version control & repository syncing |
| **Postman** | Desktop App | N/A (GUI application) | API testing and endpoint validation |

---

### **Part 2: Step-by-Step Local Deployment**

#### **1. Database Provisioning & Schema**
The backend repository is pre-configured with Spring Data JPA and Hibernate auto-DDL (`hibernate.ddl-auto: update`):
* **Cloud TiDB / RDS:** If using the configured cloud database gateway, verify outbound network access to the TiDB endpoint on port `4000`.
* **Local MySQL (Alternative):** If running against a local database instance:
  ```bash
  mysql -u root -p
  ```
  ```sql
  CREATE DATABASE rootcause_db;
  USE rootcause_db;
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
5. Open your browser and navigate to the local client dashboard URL (typically `http://localhost:5173` or `http://localhost:3000`).

---

### **Part 3: User Manual – Operating the Analyzer**

#### **Step 1: Ingesting Telemetry & Triggering Analysis**
* **Automated Log Ingestion:** Telemetry streamed from AWS CloudWatch / CloudTrail targets `POST /api/logs`.
* **Manual QA Simulation:**
  1. Open Postman and select the request `POST Trigger AI Analysis` (`http://localhost:8081/api/analyze`).
  2. In the **Body** tab (`raw` > `JSON`), supply the target `serviceId` and chronological failure sequence:
     ```json
     {
       "serviceId": 1,
       "logs": [
         {
           "serviceName": "EC2",
           "timestamp": "2026-09-19T10:01:00",
           "message": "EC2 CPU utilization spiked to 98%"
         },
         {
           "serviceName": "RDS",
           "timestamp": "2026-09-19T10:02:00",
           "message": "Database connection timeout: pool exhausted"
         }
       ]
     }
     ```
  3. Click **Send** to trigger AI cascade analysis.

#### **Step 2: Inspecting the AI Root Cause Report**
Review the response in Postman or open the React Dashboard to inspect:
* **Incident Header:** Incident key, affected service identifier, severity, and status.
* **Chronological Timeline:** Visual nodes depicting failure progression (e.g., EC2 CPU spike at 10:01 $\rightarrow$ RDS pool exhaustion at 10:02 $\rightarrow$ ALB 503 at 10:04).
* **Identified Root Cause:** Synthesized diagnostic narrative pinpointing the primary bottleneck.
* **Prescribed Recommendations:** Actionable mitigation steps (e.g., optimize query indexes, scale connection pool).

#### **Step 3: Accessing Historical Incident Records**
1. In Postman, execute `GET /api/incidents` (`TC-01`) to retrieve all historical incidents.
2. Execute `GET /api/incidents/{id}` (`TC-02`) or `GET /api/reports/{id}` (`TC-03`) to retrieve full diagnostics for an existing record.

---

### **Part 4: Troubleshooting Common Issues**

* **Backend Port Conflict:** If port `8081` is already occupied, update `server.port: 8082` in `application.yml` and update the base URL in Postman and the React frontend.
* **Database Connection Failure (`Communications link failure`):**
  * If using TiDB Cloud, ensure your local IP is allowed in TiDB IP access rules.
  * If using local MySQL, ensure the service is running (`net start MySQL80` on Windows).
* **JPA ID Null Exception (`BUG-003`):** Ensure the root payload contains a non-null `serviceId` before sending requests to `/api/analyze` until the backend patch is applied.
* **AI Analysis Failure (`BUG-001`):** Ensure the OpenAI API key has active quota and model slug is set to an active model (e.g., `gpt-4o-mini`) in `application.yml`.
