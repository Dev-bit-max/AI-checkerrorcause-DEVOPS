# AI-Powered Root Cause Analyzer for Cloud Failures 🚀

An automated cloud incident investigation system that ingests distributed AWS operational logs, correlates timeline anomalies, and leverages AI/LLMs to diagnose root causes and generate mitigation reports in minutes.

---

## 📌 Problem Overview & Solution
* **The Problem:** When cloud applications experience outages, DevOps engineers manually parse thousands of logs across multiple AWS services (EC2, RDS, ALB, Lambda), taking 30 to 90 minutes to diagnose the underlying failure.
* **The Solution:** Automates cross-service log correlation and AI-driven root cause identification, shrinking Mean Time To Resolution (MTTR) down to 2–5 minutes with an actionable incident report and visual timeline.

---

## 🏗️ Architecture & Data Pipeline

```
AWS Cloud (EC2/RDS/ALB) ──> CloudWatch/CloudTrail ──> Spring Boot Backend ──> AI Engine (LLM) ──> MySQL Database ──> React Dashboard
   (Generates Logs)              (Ingests)              (Cleans & Prepares)       (Analyzes)            (Persists)          (Visualizes)
```


1. **AWS Ingestion:** Infrastructure logs and telemetry metrics stream via AWS CloudWatch and CloudTrail.
2. **Backend Processing:** Spring Boot ingests, normalizes, and structures event payloads.
3. **AI Root-Cause Inference:** An LLM correlates multi-service log sequences, extracts root causes, and generates remediation recommendations.
4. **Relational Storage:** Incidents, event timelines, and diagnostic reports persist in MySQL via Spring Data JPA.
5. **Dashboard Visualization:** React.js renders interactive incident overviews, chronological timeline graphs, and remediation steps.

---

## 🛠️ Tech Stack & Module Ownership

| Domain / Layer | Technology | Lead / Contributor | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Backend Architecture** | Java 21, Spring Boot, REST APIs | **Divyanshu** (Team Lead) | Core API design, service orchestration, GitHub management |
| **Cloud Infrastructure** | AWS (EC2, RDS, ALB, CloudWatch) | **Sakshi** | Cloud resources, telemetry pipelines, failure simulations |
| **AI Intelligence** | OpenAI / OpenRouter API | **Soham** | Prompt engineering, raw log preprocessing, JSON schema parsing |
| **Database Design** | MySQL, Spring Data JPA | **Ketaki** | ER modeling, JPA entities, database optimization |
| **Frontend UI** | React.js, Tailwind CSS, Chart.js | **Krutant** | Incident dashboard, chronological timeline, metric visualizers |
| **QA & Documentation** | Postman, Markdown, Automated QA | **Malhar** | Test automation, failure datasets, defect logging, documentation |

---

## 📡 REST API Specifications

**Base URL:** `http://localhost:8081`

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analyze` | Ingests cloud log batches and generates AI incident analysis | AI Integration Pending |
| `GET` | `/api/incidents` | Retrieves all historical incident summaries from MySQL/RDS | Active / Ready |
| `GET` | `/api/incidents/{id}` | Fetches individual incident details and metadata | Active / Ready |
| `GET` | `/api/reports/{id}` | Fetches generated root-cause reports, timelines, and recommendations | Active / Ready |
| `POST` | `/api/logs` | Ingests raw AWS CloudWatch / CloudTrail telemetry | Active / Ready |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Java:** JDK 21 installed (`java -version`)
* **Node.js:** Node v18+ & npm v9+ (`node -v`)
* **Database:** MySQL 8.0+ or connection credentials for AWS RDS

### Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Verify database connection credentials in `src/main/resources/application.yml` (pointing to Sakshi's AWS RDS instance).
3. Run the Spring Boot application:
   ```powershell
   ./mvnw.cmd spring-boot:run
   ```
4. The service will be operational on `http://localhost:8081`.

### Frontend Setup (React.js)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Launch the dashboard server:
   ```bash
   npm start
   ```
4. Access the dashboard UI at `http://localhost:3000`.

---

## 🧪 Testing & Quality Assurance
* **Postman Test Suite:** Complete API assertion scripts and collections reside under `testing/`.
* **Simulated Cloud Datasets:** Standardized failure payloads (RDS pool exhaustion, Lambda timeout, EC2 OOM) are documented in `testing/test-failure-datasets.json`.
* **Defect Log:** Historical bug tracking is maintained in `testing/bug-tracker.md`.

## AI Layer Setup (OpenRouter)

The AI Layer uses OpenRouter to generate root-cause analysis. To run it locally:

1. Create `Backend/src/main/resources/application-local.properties` (this file is gitignored — you must create it yourself).
2. Add the following line:

openai.api.key=YOUR_KEY_HERE

3. Contact Divyanshu to get the shared OpenRouter key.