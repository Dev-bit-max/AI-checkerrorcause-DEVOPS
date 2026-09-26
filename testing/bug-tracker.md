# Project Bug & Issue Tracker
**Project:** AI-Powered Root Cause Analyzer for Cloud Failures  
**Module Owner (Testing & Documentation):** Malhar  

---
### **Active Defects & Issue Log**

| Bug ID | Endpoint / Module | Description | Severity | Assigned To | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | `POST /api/analyze` (AI) | HTTP 500: AI analysis failed due to invalid/deprecated model string or API token expiry | High | Soham | **CLOSED / RESOLVED** |
| **BUG-002** | `POST /api/logs` (Backend) | HTTP 500 / 405: Request method 'POST' is not supported on /api/logs | Medium | Divyanshu | **CLOSED / RESOLVED** |
| **BUG-003** | `POST /api/analyze` (Backend/DB) | HTTP 500: JPA `The given id must not be null` during incident event persistence | High / Schema Mismatch | Divyanshu / Ketaki | **CLOSED / RESOLVED** |

---

#### **[BUG-001] AI Analysis Pipeline Upstream Failure on POST /api/analyze [CLOSED]**
* **Module Affected:** AI & Log Intelligence
* **Endpoint / Screen:** `POST /api/analyze`
* **Date Reported:** 2026-09-19
* **Reported By:** Malhar
* **Assigned To:** Soham
* **Severity:** High
* **Status:** **CLOSED / RESOLVED**

**1. Steps to Reproduce:**
1. Start backend server on port 8081.
2. Open Postman request `POST Trigger AI Analysis` (`http://localhost:8081/api/analyze`).
3. Send the 4-event incident payload.
4. Inspect the returned response status and body.

**2. Expected Result:**
* HTTP 200 OK with structured JSON containing `summary`, `rootCause`, `timeline`, and `recommendations`.

**3. Actual Result:**
* Server returned HTTP 500 Internal Server Error due to upstream model rejection / authentication.

**4. Error Response Snippet:**
```json
{
  "data": null,
  "message": "Something went wrong: AI log analysis failed: 401 Unauthorized on POST request for \"[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)\": [no body]",
  "success": false,
  "timestamp": "2026-09-19T19:25:05.1190294"
}
```

**5. Root Cause & Diagnostic Findings:**
* In LogAnalysisService.java, "model": "openrouter/free" was hardcoded, which OpenRouter rejected as invalid/deprecated.
* Upstream token handling was updated to support active OpenRouter model routing.

**6. Required Fix:**
* Resolution: Soham replaced the inactive slug with an active model slug (nvidia/nemotron-3-ultra-550b-a55b:free), corrected aiModelUsed, and re-routed configuration mapping in application.yml.

* Verification: Successfully verified end-to-end via UI incident report generation for Incident #29 (ui-ai-report-generated.jpeg).
* Verdict: CLOSED / VERIFIED.

---

#### **[BUG-002] Missing POST Mapping for Log Ingestion on /api/logs**
* **Module Affected:** Backend (Spring Boot) / Core REST APIs
* **Endpoint / Screen:** `POST /api/logs`
* **Date Reported:** 2026-09-23
* **Reported By:** Malhar
* **Assigned To:** Divyanshu
* **Severity:** CLOSED / RESOLVED

**1. Steps to Reproduce:**
1. Start backend server on port 8081.
2. Open Postman request `POST Ingest AWS Logs` (`http://localhost:8081/api/logs`).
3. Send standard JSON log payload in the request body.
4. Inspect the returned response status and body.

**2. Expected Result:**
* HTTP 200 OK or 201 Created confirming ingestion and storage of raw log entries.

**3. Actual Result:**
* Server returned HTTP 500 Internal Server Error (`HttpRequestMethodNotSupportedException`).

**4. Error Response Snippet:**
```json
{
  "data": null,
  "message": "Something went wrong: Request method 'POST' is not supported",
  "success": false,
  "timestamp": "2026-09-23T12:08:17.7963886"
}
```
**5. Root Cause & Diagnostic Findings:**
*LogController.java only defines a @GetMapping for retrieving log entities.
*No @PostMapping endpoint is mapped to ingest incoming raw log payloads.

**6. Required Fix:**
*Resolution: Divyanshu implemented the missing @PostMapping handler and service method in LogController.java to ingest and persist log records to MySQL via Spring Data JPA.
*Verification: Log ingestion confirmed functional via the React UI analysis submission form (ui-log-analysis-form.jpeg).
*Verdict: CLOSED / VERIFIED.

---

#### **[BUG-003] JPA Entity Persistence Failure on /api/analyze ("The given id must not be null")**
* **Module Affected:** Backend (`AnalysisService.java`) & Database (`IncidentEventService.java`)
* **Endpoint / Screen:** `POST /api/analyze`
* **Date Reported:** 2026-09-23
* **Reported By:** Malhar (QA)
* **Assigned To:** Divyanshu & Ketaki
* **Severity:** CLOSED / RESOLVED

##### 1. Steps to Reproduce
1. Start backend server on port 8081.
2. In Postman, select `POST Trigger AI Analysis` (`http://localhost:8081/api/analyze`).
3. Provide raw log JSON containing nested event items without an existing entity reference.
4. Click Send.

##### 2. Expected Result
* HTTP 200 OK returning structured JSON with incident analysis, summary, root cause, and recommendations

##### 3. Actual Result
* Server returned HTTP 500 Internal Server Error (IllegalArgumentException: The given id must not be null).

##### 4. Error Response Snippet
```json
{
  "data": null,
  "message": "Something went wrong: The given id must not be null",
  "success": false,
  "timestamp": "2026-09-23T12:46:27.290327"
}
```
#### 5. Root Cause & Diagnostic Findings
*Design contract clarification: POST /api/analyze is exclusively designed to query existing persisted incidents using incidentRepository.findById(request.getIncidentId()). Passing raw logs on the fly caused JPA lookups against a null primary key.  

#### 6. Required Fix
*Resolution: Ticket closed as Contract Mismatch / Architectural Realignment. The request contract was standardized to require {"incidentId": <id>}. Raw log ingestion remains decoupled under POST /api/logs.  
*Verification: Request payload updated across documentation and validated against existing database incident records.
*Verdict: CLOSED / RESOLVED.

#### 7. Developer Feedback & Code Review Findings
* **Developer Confirmation (Ketaki):** Confirmed `AnalyzeRequestdto.java` strictly accepts `{"incidentId": <id>}`. 
* **Design Purpose:** The endpoint `POST /api/analyze` is intended to trigger AI diagnostics against existing incident records stored in the database via `incidentRepository.findById(request.getIncidentId())`. It is not responsible for creating incidents or saving new event telemetry on the fly.
* **Pipeline Clarification:** Raw log ingestion and initial incident creation belong exclusively to `POST /api/logs` (tracked separately under BUG-002).

#### 8. Resolution & QA Action Taken
* **Ticket Status:** Closed as **Invalid / Schema Mismatch**. The JPA `null` ID error was the expected failure resulting from passing an incompatible payload structure (`serviceId` + `logs` instead of `incidentId`).
* **Test Case Updated:** Test case `TC-05` in `testing/project-documentation.md` and the Postman collection have been updated to target existing records:
  ```json
  {
    "incidentId": 1
  }
  ```
* **Retest Status:** Verified and closed. Incident analysis validated end-to-end via UI incident report generation (Incident #29).