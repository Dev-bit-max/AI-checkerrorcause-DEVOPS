# AI-Powered Root Cause Analyzer for Cloud Failures
**Comprehensive Project Report, Technical Specification & User Manual**

---

## 1. Executive Summary & Problem Statement
Modern cloud applications deployed on AWS generate vast volumes of logs across decoupled services (EC2, RDS, ALB, Lambda, CloudWatch). When a critical failure or outage occurs, DevOps engineers typically consult 8 to 10 disjointed monitoring dashboards and manually correlate thousands of log lines to identify the failure source. This manual investigation process requires 30 to 90 minutes of Mean Time To Resolution (MTTR).

The **AI-Powered Root Cause Analyzer** automates the end-to-end incident analysis pipeline. By consolidating CloudWatch/CloudTrail streams, leveraging OpenAI GPT for automated log summarization and anomaly correlation, and persisting incident histories in MySQL, the system generates actionable incident reports in **2 to 5 minutes**.

---

## 2. System Architecture & Workflow Pipeline
The application implements an automated sequential pipeline:
[ AWS Infrastructure (EC2, RDS, Lambda, ALB) ]
│ (CloudWatch / CloudTrail)
▼
[ Spring Boot Backend Ingestion ]
│ (Pre-processed JSON)
▼
[ OpenAI GPT AI Engine ]
│ (Parsed Diagnosis & Fixes)
▼
[ MySQL Database ]
│ (REST APIs)
▼
[ React.js + Tailwind UI ]

* **Ingestion Layer:** CloudWatch and CloudTrail streams aggregate service metrics, runtime errors, and infrastructure-level events.
* **Backend Processing:** Spring Boot orchestrates scheduled/on-demand ingestion, cleans log formatting, and routes payloads.
* **AI Analysis Layer:** The GPT engine evaluates chronological anomalies, isolates the primary failure trigger, and constructs remediation strategies.
* **Persistence Layer:** Structured reports, timeline nodes, and metadata are archived in MySQL via Spring Data JPA.
* **Presentation Layer:** A React web dashboard visualizes incident health metrics, dynamic failure timelines, and incident reports.

---

## 3. Technology Stack & Module Ownership
Each module is maintained by a designated team member:

| Layer / Domain | Technology Stack | Module Owner | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Project Lead & Backend** | Java, Spring Boot, Git/GitHub | **Divyanshu** (Team Lead) | Core REST APIs, system integration, repository management |
| **Cloud Infrastructure** | AWS (EC2, RDS, ALB, CloudWatch, Lambda) | **Sakshi** | Infrastructure provisioning, IAM configurations, failure simulation |
| **AI Layer** | OpenAI GPT API, Prompt Engineering | **Soham** | Log preprocessing, prompt templates, JSON response parsing |
| **Database** | MySQL, Spring Data JPA | **Ketaki** | ER modeling, database schemas, repository queries |
| **Frontend** | React.js, Tailwind CSS, Charting | **Krutant** | Metric dashboards, incident tables, timeline rendering |
| **Testing & Documentation** | Postman, QA Frameworks, Markdown | **Malhar** | API test suites, defect logging, system docs, user manuals |

---

## 4. API Reference Specification

### `POST /api/logs`
* **Description:** Ingests raw log messages from AWS CloudWatch/CloudTrail.
* **Request Payload:**
```json
{
  "source": "AWS CloudWatch",
  "service": "ALB / Lambda",
  "timestamp": "2026-08-31T20:00:00Z",
  "logMessage": "503 Service Unavailable: Target response timeout"
}
Response: 200 OK
POST /api/analyze
Description: Sends batched failure logs to the AI engine to compute root causes and fixes.
Request Payload:
JSON
{
  "service": "EC2 / RDS",
  "errorLogs": [
    "10:01:00 AM - EC2 CPU utilization at 98%",
    "10:02:00 AM - RDS Database connection timed out",
    "10:03:00 AM - /api/login endpoint failed with 500 error",
    "10:04:00 AM - ALB returned 503 Service Unavailable"
  ]
}
Response (200 OK):
JSON
{
  "incidentId": 1,
  "service": "EC2 / RDS",
  "rootCause": "RDS Database connection pool exhaustion caused by high CPU load",
  "timeline": [
    {"time": "10:01:00 AM", "event": "EC2 CPU utilization spiked to 98%"},
    {"time": "10:02:00 AM", "event": "RDS connection timeout breached threshold"},
    {"time": "10:03:00 AM", "event": "Authentication service failed (500)"},
    {"time": "10:04:00 AM", "event": "Application Load Balancer returned 503"}
  ],
  "recommendations": [
    "Increase max_connections parameter in RDS parameter group",
    "Implement connection pooling on Spring Boot application layer",
    "Scale EC2 instance size to handle peak computational loads"
  ]
}
GET /api/incidents
Description: Retrieves all historical analyzed cloud incidents.

Response: 200 OK (Array<Incident>)

GET /api/reports/{id}
Description: Fetches a full root-cause report and timeline for a given incident ID.

Response: 200 OK (IncidentReportObject) / 404 Not Found

5. Test Plan & QA Strategy
API Testing (Postman): Automated status code verification (200 OK, 400 Bad Request, 404 Not Found, 500 Internal Error), JSON schema assertions, and response time checks.

Validation Datasets: Standardized mock scenarios (test-failure-datasets.json) covering:

Scenario 1: RDS Connection Pool Exhaustion & ALB 503 errors.

Scenario 2: AWS Lambda execution timeouts.

Scenario 3: Linux Out-Of-Memory (OOM) Kernel kills on EC2.

Defect Lifecycle: Discrepancies between expected API schemas and actual server outputs are tracked in bug-tracker.md and routed to module owners.

6. User Manual & Local Setup Guide
Prerequisites
Java JDK 17+

Node.js v18+ and npm

MySQL Server 8.0+

Postman Desktop Client

Database Setup
Open MySQL terminal or MySQL Workbench.

Execute:

SQL
CREATE DATABASE cloud_incident_db;
Update src/main/resources/application.properties in the backend with your local MySQL credentials.

Backend Setup (Spring Boot)
Navigate to the backend directory:

Bash
cd backend
mvn clean install
mvn spring-boot:run
The server will start locally at http://localhost:8080.

Frontend Setup (React)
Navigate to the frontend directory:

Bash
cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser to access the dashboard.

[cite: 1, 2]

