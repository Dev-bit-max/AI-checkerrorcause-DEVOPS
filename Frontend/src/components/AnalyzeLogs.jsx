import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeLogs } from "../api/client";
import Navbar from "./Navbar";

const emptyLog = () => ({
  incidentId: "",
  serviceId: "",
  metricName: "",
  metricValue: "",
  message: "",
  eventType: "",
  eventTimestamp: new Date().toISOString().slice(0, 16),
});

function AnalyzeLogs() {
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState("");
  const [logs, setLogs] = useState([emptyLog()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const addLog    = () => setLogs((prev) => [...prev, emptyLog()]);
  const removeLog = (index) => setLogs((prev) => prev.filter((_, i) => i !== index));
  const updateLog = (index, field, value) =>
    setLogs((prev) => prev.map((log, i) => (i === index ? { ...log, [field]: value } : log)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    const payload = {
      serviceId: serviceId ? Number(serviceId) : null,
      logs: logs.map((log) => ({
        incidentId:     log.incidentId     ? Number(log.incidentId)  : null,
        serviceId:      log.serviceId      ? Number(log.serviceId)   : (serviceId ? Number(serviceId) : null),
        metricName:     log.metricName     || null,
        metricValue:    log.metricValue    || null,
        message:        log.message,
        eventType:      log.eventType || "ERROR",
        eventTimestamp: log.eventTimestamp ? new Date(log.eventTimestamp).toISOString() : new Date().toISOString(),
      })),
    };
    try {
      setLoading(true);
      const data = await analyzeLogs(payload);
      setResult(data);
      // Redirect to Dashboard (Overview) with the newly generated incident ID and report
      if (data?.incidentId) {
        navigate(`/?incidentId=${data.incidentId}`, {
          state: { justAnalyzed: true, incidentId: data.incidentId, report: data }
        });
      } else {
        navigate("/", { state: { justAnalyzed: true } });
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to analyze logs. Is the backend running at http://localhost:8081?");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setServiceId("1");
    setLogs([
      { incidentId: "", serviceId: "1", metricName: "CPUUtilization",    metricValue: "98.5", message: "CPU usage spiked to 98.5% on production server",       eventType: "METRIC_ALERT", eventTimestamp: new Date(Date.now() - 3600000).toISOString().slice(0, 16) },
      { incidentId: "", serviceId: "1", metricName: "MemoryUtilization", metricValue: "89.2", message: "Memory pressure detected, potential OOM condition",      eventType: "METRIC_ALERT", eventTimestamp: new Date(Date.now() - 3000000).toISOString().slice(0, 16) },
      { incidentId: "", serviceId: "1", metricName: "ErrorRate",         metricValue: "12.4", message: "HTTP 500 error rate exceeded threshold at 12.4%",        eventType: "ERROR",        eventTimestamp: new Date(Date.now() - 1800000).toISOString().slice(0, 16) },
    ]);
  };

  const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition";

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-8 py-8">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analyze Logs</h2>
            <p className="text-slate-500 mt-1 text-sm">Submit AWS log entries for AI-powered root cause analysis</p>
          </div>
          <button type="button" onClick={loadSample}
            className="border border-slate-300 bg-white px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition shadow-sm">
            Load Sample
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Service Configuration</h3>
            <p className="text-sm text-slate-500 mb-4">Optional: the service that triggered these logs</p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Service ID</label>
              <input type="number" value={serviceId} onChange={(e) => setServiceId(e.target.value)} placeholder="e.g. 1"
                className="w-48 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Log Entries</h3>
                <p className="text-sm text-slate-500 mt-0.5">Add the AWS log events to analyze</p>
              </div>
              <button type="button" onClick={addLog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                + Add Entry
              </button>
            </div>

            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                      Entry #{index + 1}
                    </span>
                    {logs.length > 1 && (
                      <button type="button" onClick={() => removeLog(index)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Message <span className="text-red-500">*</span></label>
                      <input type="text" required value={log.message} onChange={(e) => updateLog(index, "message", e.target.value)} placeholder="Log message or error description" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Event Type <span className="text-red-500">*</span></label>
                      <select required value={log.eventType} onChange={(e) => updateLog(index, "eventType", e.target.value)} className={inputCls}>
                        <option value="">Select type…</option>
                        <option value="ERROR">ERROR</option>
                        <option value="METRIC_ALERT">METRIC_ALERT</option>
                        <option value="WARNING">WARNING</option>
                        <option value="INFO">INFO</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Metric Name</label>
                      <input type="text" value={log.metricName} onChange={(e) => updateLog(index, "metricName", e.target.value)} placeholder="e.g. CPUUtilization" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Metric Value</label>
                      <input type="text" value={log.metricValue} onChange={(e) => updateLog(index, "metricValue", e.target.value)} placeholder="e.g. 98.5" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Event Timestamp</label>
                      <input type="datetime-local" value={log.eventTimestamp} onChange={(e) => updateLog(index, "eventTimestamp", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Service ID (override)</label>
                      <input type="number" value={log.serviceId} onChange={(e) => updateLog(index, "serviceId", e.target.value)} placeholder={serviceId || "Inherits from above"} className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition shadow-md">
            {loading ? "Analyzing logs with AI…" : `Analyze ${logs.length} Log ${logs.length === 1 ? "Entry" : "Entries"}`}
          </button>
        </form>

        {result && (
          <section className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Analysis Complete</p>
              <h2 className="mt-2 text-xl font-semibold">AI Incident Report Generated</h2>
              {result.incidentId && <p className="mt-1 text-slate-400 text-sm">Incident ID: {result.incidentId}</p>}
            </div>
            <div className="p-6 space-y-4">
              {result.summary && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Summary</p>
                  <p className="mt-2 text-sm text-slate-700 leading-6">{result.summary}</p>
                </div>
              )}
              {result.rootCause && (
                <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Root Cause</p>
                  <p className="mt-2 text-sm text-slate-700 leading-6">{result.rootCause}</p>
                </div>
              )}
              {result.recommendation && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Recommended Fix</p>
                  <p className="mt-2 text-sm text-slate-700 leading-6">{result.recommendation}</p>
                </div>
              )}
              {result.aiModelUsed && <p className="text-xs text-slate-400">AI Model: {result.aiModelUsed}</p>}
              <div className="flex gap-3 pt-2">
                <a href="/incidents" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">View Incidents</a>
                {result.incidentId && <a href={`/reports?incidentId=${result.incidentId}`} className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm transition">View Full Report</a>}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AnalyzeLogs;
