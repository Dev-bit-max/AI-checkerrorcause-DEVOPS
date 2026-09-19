# Project Bug & Issue Tracker
**Project:** AI-Powered Root Cause Analyzer for Cloud Failures  
**Module Owner (Testing & Documentation):** Malhar  

---

### **Active Defects & Issue Log**

| Bug ID | Endpoint / Module | Description | Severity | Assigned To | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | `POST /api/analyze` (AI) | HTTP 500: AI analysis failed due to upstream OpenRouter rejection (401/404) | High | Soham | Open |
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