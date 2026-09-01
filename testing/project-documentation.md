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
* `id` (Primary Key, INT)
* `service_name` (VARCHAR)
* `status` (VARCHAR - e.g., OPEN, RESOLVED)
* `severity` (VARCHAR - e.g., CRITICAL, HIGH)
* `created_at` (TIMESTAMP)

### 2. `incident_events`
Tracks chronological timeline events under a single incident.
* `id` (Primary Key, INT)
* `incident_id` (Foreign Key referencing `incidents.id`)
* `timestamp` (TIMESTAMP)
* `log_level` (VARCHAR - e.g., WARNING, ERROR)
* `message` (TEXT - e.g., "RDS Database connection timed out")

### 3. `reports`
Stores AI-generated root cause analysis output.
* `id` (Primary Key, INT)
* `incident_id` (Foreign Key referencing `incidents.id`)
* `root_cause` (TEXT)
* `fix_recommendations` (TEXT)
* `generated_at` (TIMESTAMP)

### 4. `services`
Tracks cloud services monitored by the system.
* `id` (Primary Key, INT)
* `service_name` (VARCHAR)
* `environment` (VARCHAR)
* `health_status` (VARCHAR)

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
