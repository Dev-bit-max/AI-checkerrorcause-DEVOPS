# AI-Powered Root Cause Analyzer for Cloud Failures 🚀

An automated cloud incident investigation system that ingests distributed AWS operational logs, correlates timeline anomalies, and leverages AI/LLMs to diagnose root causes and generate mitigation reports in minutes[cite: 1, 2].

---

## 📌 Problem Overview & Solution
* **The Problem:** When cloud applications experience outages, DevOps engineers manually parse thousands of logs across multiple AWS services (EC2, RDS, ALB, Lambda), taking 30 to 90 minutes to diagnose the underlying failure[cite: 1, 2].
* **The Solution:** Automates cross-service log correlation and AI-driven root cause identification, shrinking Mean Time To Resolution (MTTR) down to 2–5 minutes with an actionable incident report and visual timeline[cite: 1, 2].

---

## 🏗️ Architecture & Data Pipeline

```
AWS Cloud (EC2/RDS/ALB) ──> CloudWatch/CloudTrail ──> Spring Boot Backend ──> AI Engine (LLM) ──> MySQL Database ──> React Dashboard
   (Generates Logs)              (Ingests)              (Cleans & Prepares)       (Analyzes)            (Persists)          (Visualizes)
```
[cite: 1]

1. **AWS Ingestion:** Infrastructure logs and telemetry metrics stream via AWS CloudWatch and CloudTrail[cite: 1, 2].
2. **Backend Processing:** Spring Boot ingests, normalizes, and structures event payloads[cite: 1, 2].
3. **AI Root-Cause Inference:** An LLM correlates multi-service log sequences, extracts root causes, and generates remediation recommendations[cite: 1, 2].
4. **Relational Storage:** Incidents, event timelines, and diagnostic reports persist in MySQL via Spring Data JPA[cite: 1, 2].
5. **Dashboard Visualization:** React.js renders interactive incident overviews, chronological timeline graphs, and remediation steps[cite: 1, 2].

---

## 🛠️ Tech Stack & Module Ownership

| Domain / Layer | Technology | Lead / Contributor | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Backend Architecture** | Java 21, Spring Boot, REST APIs | **Divyanshu** (Team Lead) | Core API design, service orchestration, GitHub management[cite: 1, 2] |
| **Cloud Infrastructure** | AWS (EC2, RDS, ALB, CloudWatch) | **Sakshi** | Cloud resources, telemetry pipelines, failure simulations[cite: 1, 2] |
| **AI Intelligence** | OpenAI / OpenRouter API | **Soham** | Prompt engineering, raw log preprocessing, JSON schema parsing[cite: 1, 2] |
| **Database Design** | MySQL, Spring Data JPA | **Ketaki** | ER modeling, JPA entities, database optimization[cite: 1, 2] |
| **Frontend UI** | React.js, Tailwind CSS, Chart.js | **Krutant** | Incident dashboard, chronological timeline, metric visualizers[cite: 1, 2] |
| **QA & Documentation** | Postman, Markdown, Automated QA | **Malhar** | Test automation, failure datasets, defect logging, documentation[cite: 1, 2] |

---

## 📡 REST API Specifications

**Base URL:** `http://localhost:8081`

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analyze` | Ingests cloud log batches and generates AI incident analysis[cite: 1, 2] | AI Integration Pending |
| `GET` | `/api/incidents` | Retrieves all historical incident summaries from MySQL/RDS[cite: 1, 2] | Active / Ready |
| `GET` | `/api/incidents/{id}` | Fetches individual incident details and metadata | Active / Ready |
| `GET` | `/api/reports/{id}` | Fetches generated root-cause reports, timelines, and recommendations[cite: 1, 2] | Active / Ready |
| `POST` | `/api/logs` | Ingests raw AWS CloudWatch / CloudTrail telemetry[cite: 1, 2] | Active / Ready |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Java:** JDK 21 installed (`java -version`)
* **Node.js:** Node v18+ & npm v9+ (`node -v`)
* **Database:** MySQL 8.0+ or connection credentials for AWS RDS[cite: 2]

### Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Verify database connection credentials in `src/main/resources/application.yml` (pointing to Sakshi's AWS RDS instance)[cite: 2].
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
* **Simulated Cloud Datasets:** Standardized failure payloads (RDS pool exhaustion, Lambda timeout, EC2 OOM) are documented in `testing/test-failure-datasets.json`[cite: 1].
* **Defect Log:** Historical bug tracking is maintained in `testing/bug-tracker.md`[cite: 1].