# Project Bug & Issue Tracker
**Project:** AI-Powered Root Cause Analyzer for Cloud Failures  
**Module Owner (Testing & Documentation):** Malhar  

---
### **Active Defects & Issue Log**

| Bug ID | Endpoint / Module | Description | Severity | Assigned To | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | `POST /api/analyze` (AI) | HTTP 500: AI analysis failed due to upstream OpenRouter rejection (401/404) | High | Soham | Open |
| **BUG-002** | `POST /api/logs` (Backend) | HTTP 500 / 405: Request method 'POST' is not supported on /api/logs | Medium | Divyanshu | Open |
| **BUG-003** | `POST /api/analyze` (Backend/DB) | HTTP 500: JPA `The given id must not be null` during incident event persistence | High | Divyanshu / Ketaki | Open |
---

### **Bug Report Template (Copy & paste below for each new bug)**

#### **[BUG-XXX] Short Title of Defect**
* **Module Affected:** Backend (Spring Boot) / AI Layer / Frontend (React) / Cloud Infrastructure  
* **Endpoint / Screen:** (e.g., `POST /api/analyze`)  
* **Date Reported:** YYYY-MM-DD  
* **Reported By:** Malhar  
* **Assigned To:** Divyanshu / Soham / Krutant / Ketaki / Sakshi  
* **Severity:** Critical / High / Medium / Low  

**1. Steps to Reproduce:**
1. Open Postman request `[Request Name]`.
2. Send the payload from `test-failure-datasets.json`.
3. Inspect the returned response status and body.

**2. Expected Result:**
* (e.g., HTTP 200 OK with valid JSON structure containing rootCause and recommendations).

**3. Actual Result:**
* (e.g., Server returned HTTP 500 Internal Server Error / malformed JSON).

**4. Error Response Snippet:**
```json
// Paste error response from Postman here
```
---

#### **[BUG-001] AI Analysis Pipeline Upstream Failure on POST /api/analyze**
* **Module Affected:** AI & Log Intelligence
* **Endpoint / Screen:** `POST /api/analyze`
* **Date Reported:** 2026-09-19
* **Reported By:** Malhar
* **Assigned To:** Soham
* **Severity:** High


**1. Steps to Reproduce:**
1. Start backend server on port 8081.
2. Open Postman request `POST Trigger AI Analysis` (`http://localhost:8081/api/analyze`).
3. Send the 4-event incident payload (EC2 CPU spike -> RDS timeout -> 500 login -> ALB 503).
4. Inspect the returned response status and body.

**2. Expected Result:**
* HTTP 200 OK with structured JSON containing `summary`, `rootCause`, `timeline`, and `recommendations`.

**3. Actual Result:**
* Server returned HTTP 500 Internal Server Error due to upstream model rejection.

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
* The team OpenRouter key was tested via curl.exe https://openrouter.ai/api/v1/auth/key and verified active (50/50 requests available).
* In `LogAnalysisService.java` (line 34), `"model": "openrouter/free"` is hardcoded. OpenRouter rejected this slug as invalid or deprecated.

**6. Required Fix:**
* Soham must update `LogAnalysisService.java` with an active model slug or implement a fallback handler.


---

#### **[BUG-002] Missing POST Mapping for Log Ingestion on /api/logs**
* **Module Affected:** Backend (Spring Boot) / Core REST APIs
* **Endpoint / Screen:** `POST /api/logs`
* **Date Reported:** 2026-09-23
* **Reported By:** Malhar
* **Assigned To:** Divyanshu
* **Severity:** Medium

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
*Divyanshu must implement a @PostMapping handler method in LogController.java to parse and persist incoming log entries to MySQL via JPA.

---

#### **[BUG-003] JPA Entity Persistence Failure on /api/analyze ("The given id must not be null")**
* **Module Affected:** Backend (`AnalysisService.java`) & Database (`IncidentEventService.java`)[cite: 14, 18, 19]
* **Endpoint / Screen:** `POST /api/analyze`
* **Date Reported:** 2026-09-23
* **Reported By:** Malhar (QA)[cite: 19]
* **Assigned To:** Divyanshu & Ketaki[cite: 19]
* **Severity:** High

##### 1. Steps to Reproduce
1. Start backend server on port 8081.
2. In Postman, select `POST Trigger AI Analysis` (`http://localhost:8081/api/analyze`).
3. Provide valid JSON containing `serviceId` and the `logs` array with event messages.
4. Click Send.

##### 2. Expected Result
* HTTP 200 OK returning structured JSON with incident analysis, summary, root cause, and recommendations

##### 3. Actual Result
* Server returned HTTP 500 Internal Server Error.

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
*In AnalysisService.java (line 36), createNewIncident(request) instantiates an Incident entity.
*At line 40, request.getLogs().forEach(log -> incidentEventService.saveEvent(log, incident)); executes while the incident or its referenced Service entity lacks a persisted primary key (id == null).   
*When IncidentEventService or ServiceRepository executes an internal entity lookup on null, Spring Data JPA throws IllegalArgumentException: The given id must not be null.   

#### 6. Required Fix
*Ensure Incident is explicitly saved via incidentRepository.save(incident) so a generated ID exists before associating child events.   
*Verify serviceRepository lookups safely validate log.getServiceId() or use default fallbacks if serviceId is not provided per log item.