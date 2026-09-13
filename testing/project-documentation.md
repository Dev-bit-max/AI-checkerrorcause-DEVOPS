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
| **TC-04** | `/api/logs` | POST | 200 OK | Pending | — | Ingestion pipeline pending |
| **TC-05** | `/api/analyze` | POST | 200 OK | Pending | — | Blocked on AI Engine integration |

### Test Verification & Evidence
* **TC-01 Evidence:** Verified incident array structure mapped from AWS RDS MySQL (`./screenshots/test-get-all-incidents-pass.png`).
* **TC-02 Evidence:** Verified single incident entity retrieval (`./screenshots/test-get-single-incident-pass.png`).
* **TC-03 Evidence:** Verified diagnostic report, root cause detection payload, and recommendation payload (`./screenshots/test-get-report-pass.png`).
---

## 7. User Manual & Local Setup Guide

This guide provides end-to-end instructions for spinning up the local development environment, verifying services, and operating the AI-Powered Root Cause Analyzer to diagnose cloud infrastructure failures.

---

### **Part 1: Prerequisites & Environment Setup**

Ensure the following tools are installed and verified on the host machine before running the application stack[cite: 1]:

| Component | Required Version | Verification Command | Notes / Purpose |
| :--- | :--- | :--- | :--- |
| **Java Development Kit** | JDK 21 (LTS) | `java -version` | Runtime environment for Spring Boot backend |
| **Node.js & npm** | Node v18+ / npm v9+ | `node -v` && `npm -v` | Runtime environment for React dashboard |
| **MySQL Server** | MySQL 8.0+ | `mysql --version` | Relational storage for incidents & reports[cite: 1] |
| **Git** | Git 2.40+ | `git --version` | Version control & repository syncing[cite: 1] |
| **Postman** | Desktop App | N/A (GUI application) | API testing and endpoint validation[cite: 1] |

---

### **Part 2: Step-by-Step Local Deployment**

#### **1. Database Provisioning (MySQL)**
1. Launch MySQL CLI or MySQL Workbench:
   ```bash
   mysql -u root -p
   ```
2. Create the target database schema aligned with the JPA entities:
   ```sql
   CREATE DATABASE rootcause_db;
   USE rootcause_db;
   ```
3. *(Optional)* Verify table generation once the backend runs; Hibernate will automatically create `incidents`, `incident_events`, `reports`, and `services` via `ddl-auto=update`[cite: 1].

#### **2. Backend Service Configuration (Spring Boot)**
1. Navigate to the backend directory:
   ```bash
   cd AI-checkererrorcause-DEVOPS/backend
   ```
2. Open `src/main/resources/application.properties` (or create `application-local.properties`):
   ```properties
   spring.application.name=AWSbackenderrorcause
   server.port=8081
   spring.profiles.active=local

   # Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/rootcause_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

   # Hibernate DDL
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true

   # AI Integration
   openai.api.key=YOUR_OPENAI_OR_OPENROUTER_API_KEY
   ```
   *(Note: For testing against AWS RDS, replace `localhost:3306` with the RDS endpoint provided by the cloud engineer)[cite: 1].*
3. Launch the Spring Boot application:
   * **Windows (PowerShell):**
     ```powershell
     ./mvnw.cmd spring-boot:run
     ```
   * **Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
4. Confirm startup by checking console logs for:
   ```text
   Tomcat started on port 8081 (http) with context path ''
   Started AWSbackenderrorcause in X.XXX seconds
   ```

#### **3. Frontend Dashboard Launch (React.js)**
1. Open a separate terminal and navigate to the frontend directory:
   ```bash
   cd AI-checkererrorcause-DEVOPS/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify that the backend API base URL points to `http://localhost:8081` (in `.env` or API config file).
4. Start the development server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

### **Part 3: User Manual — Operating the Analyzer**

#### **Step 1: Simulating / Ingesting AWS Cloud Logs**
* **Automated Mode:** Logs streamed directly from AWS CloudWatch / CloudTrail land on the ingestion endpoint `POST /api/logs`[cite: 1].
* **Manual / QA Simulation Mode:** 
  1. Open Postman and select the request `Trigger AI Analysis` under the `AI-Root-Cause-Analyzer` collection[cite: 1].
  2. Select the **Body** tab (`raw` > `JSON`) and paste a failure sequence from `test-failure-datasets.json` (such as Scenario 1: RDS Database Timeout)[cite: 1].
  3. Click **Send** to dispatch logs to `POST http://localhost:8081/api/analyze`[cite: 1].

#### **Step 2: Inspecting the AI Root Cause Report**
1. Review the response returned in Postman or open the React Dashboard at `http://localhost:3000`[cite: 1].
2. The UI automatically displays:
   * **Incident Header:** Incident Key (e.g., `INC-8421`), Service Tag, Severity Level, and Status[cite: 1].
   * **Chronological Timeline:** Visual nodes showing the chain of events (e.g., EC2 CPU spike at 10:01 $\rightarrow$ RDS pool exhaustion at 10:02 $\rightarrow$ ALB 503 error at 10:04)[cite: 1].
   * **Identified Root Cause:** Synthesized diagnostic paragraph pinpointing the primary bottleneck[cite: 1].
   * **Prescribed Recommendations:** Actionable engineering steps (e.g., scale RDS connection pool, configure auto-scaling group thresholds)[cite: 1].

#### **Step 3: Accessing Historical Incident Reports**
1. Navigate to the **Incidents Overview** tab in the dashboard (or execute `GET /api/incidents` via Postman)[cite: 1].
2. Click on any historical incident record to open the detailed report view (`GET /api/reports/{id}`)[cite: 1].
3. Export or copy the markdown report summary for post-mortem engineering meetings.

---

### **Part 4: Troubleshooting Common Issues**

* **Backend port conflict:** If port `8081` is already occupied, modify `server.port=8082` in `application.properties` and update the base URL in Postman.
* **Database Connection Failure (`Communications link failure`):** Ensure MySQL is running locally (`net start MySQL80` on Windows) or verify security group rules allow traffic if connecting to Sakshi's AWS RDS instance[cite: 1].
* **AI Parser Error / Empty Recommendations:** Verify that the API key provided to Soham's AI module has active quota and that raw logs are non-empty strings[cite: 1].
