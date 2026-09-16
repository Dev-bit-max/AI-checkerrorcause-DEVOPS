import React, { useState } from "react";
import { analyzeLogs } from "../api/client";

function Navbar() {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-white/60 bg-white/75 px-8 py-4 shadow-sm backdrop-blur-xl">
      <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
        RootCause AI
      </h1>
      <div className="flex gap-8 text-sm">
        <a href="/" className="text-gray-600 transition-colors hover:text-blue-600">Overview</a>
        <a href="/incidents" className="text-gray-600 transition-colors hover:text-blue-600">Incidents</a>
        <a href="/analyze" className="font-medium text-blue-600">Analyze Logs</a>
        <a href="/reports" className="text-gray-600 transition-colors hover:text-blue-600">Reports</a>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-blue-700 text-sm font-bold text-white shadow-md">
        K
      </div>
    </nav>
  );
}

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
  const [serviceId, setServiceId] = useState("");
  const [logs, setLogs] = useState([emptyLog()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const addLog = () => setLogs((prev) => [...prev, emptyLog()]);

  const removeLog = (index) =>
    setLogs((prev) => prev.filter((_, i) => i !== index));

  const updateLog = (index, field, value) =>
    setLogs((prev) =>
      prev.map((log, i) => (i === index ? { ...log, [field]: value } : log))
    );


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);


    const payload = {
      serviceId: serviceId ? Number(serviceId) : null,
      logs: logs.map((log) => ({
        incidentId: log.incidentId ? Number(log.incidentId) : null,
        serviceId: log.serviceId ? Number(log.serviceId) : (serviceId ? Number(serviceId) : null),
        metricName: log.metricName || null,
        metricValue: log.metricValue || null,
        message: log.message,
        eventType: log.eventType,
        eventTimestamp: log.eventTimestamp ? new Date(log.eventTimestamp).toISOString() : null,
      })),
    };

    try {
      setLoading(true);
      const data = await analyzeLogs(payload);
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to analyze logs. Is the backend running at http://localhost:8081?"
      );
    } finally {
      setLoading(false);
    }
  };


  const loadSample = () => {
    setServiceId("1");
    setLogs([
      {
        incidentId: "",
        serviceId: "1",
        metricName: "CPUUtilization",
        metricValue: "98.5",
        message: "CPU usage spiked to 98.5% on production server",
        eventType: "METRIC_ALERT",
        eventTimestamp: new Date(Date.now() - 3600000).toISOString().slice(0, 16),
      },
      {
        incidentId: "",
        serviceId: "1",
        metricName: "MemoryUtilization",
        metricValue: "89.2",
        message: "Memory pressure detected, potential OOM condition",
        eventType: "METRIC_ALERT",
        eventTimestamp: new Date(Date.now() - 3000000).toISOString().slice(0, 16),
      },
      {
        incidentId: "",
        serviceId: "1",
        metricName: "ErrorRate",
        metricValue: "12.4",
        message: "HTTP 500 error rate exceeded threshold at 12.4%",
        eventType: "ERROR",
        eventTimestamp: new Date(Date.now() - 1800000).toISOString().slice(0, 16),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      <Navbar />

      <main className="relative mx-auto max-w-5xl px-8 py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

  
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Analyze Logs</h2>
            <p className="mt-1 text-gray-500">
              Submit AWS log entries for AI-powered root cause analysis
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            Load Sample
          </button>
        </div>




        {error && (
          <div className="mt-5 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
         



          <div className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <h3 className="font-semibold text-slate-900">Service Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">Optional: the service that triggered these logs</p>
            <div className="mt-4">
              <label className="block text-sm text-gray-600 mb-1">Service ID</label>
              <input
                type="number"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="e.g. 1"
                className="w-48 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

         
          <div className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Log Entries</h3>
                <p className="mt-1 text-sm text-gray-500">Add the AWS log events to analyze</p>
              </div>
              <button
                type="button"
                onClick={addLog}
                className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2 text-sm text-blue-600 hover:bg-blue-100/70 transition"
              >
                + Add Entry
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-white/50 p-5 relative"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">Entry #{index + 1}</span>
                    {logs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLog(index)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>




                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Message <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        required
                        value={log.message}
                        onChange={(e) => updateLog(index, "message", e.target.value)}
                        placeholder="Log message or error description"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>






                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Event Type <span className="text-red-400">*</span></label>
                      <select
                        required
                        value={log.eventType}
                        onChange={(e) => updateLog(index, "eventType", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Select type...</option>
                        <option value="ERROR">ERROR</option>
                        <option value="METRIC_ALERT">METRIC_ALERT</option>
                        <option value="WARNING">WARNING</option>
                        <option value="INFO">INFO</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Metric Name</label>
                      <input
                        type="text"
                        value={log.metricName}
                        onChange={(e) => updateLog(index, "metricName", e.target.value)}
                        placeholder="e.g. CPUUtilization"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Metric Value</label>
                      <input
                        type="text"
                        value={log.metricValue}
                        onChange={(e) => updateLog(index, "metricValue", e.target.value)}
                        placeholder="e.g. 98.5"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Event Timestamp</label>
                      <input
                        type="datetime-local"
                        value={log.eventTimestamp}
                        onChange={(e) => updateLog(index, "eventTimestamp", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Service ID (override)</label>
                      <input
                        type="number"
                        value={log.serviceId}
                        onChange={(e) => updateLog(index, "serviceId", e.target.value)}
                        placeholder={serviceId || "Inherits from above"}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Analyzing logs with AI..." : `Analyze ${logs.length} Log ${logs.length === 1 ? "Entry" : "Entries"}`}
          </button>
        </form>

       



        {result && (
          <section className="mt-8 rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl overflow-hidden">
            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Analysis Complete</p>
              <h2 className="mt-2 text-xl font-semibold">AI Incident Report Generated</h2>
              {result.incidentId && (
                <p className="mt-1 text-slate-300 text-sm">Incident ID: {result.incidentId}</p>
              )}
            </div>




            <div className="p-6 space-y-5">
              {result.summary && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Summary</p>
                  <p className="mt-2 text-sm text-slate-700 leading-6">{result.summary}</p>
                </div>
              )}
              {result.rootCause && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Root Cause</p>
                  <p className="mt-2 text-sm text-slate-700 leading-6">{result.rootCause}</p>
                </div>
              )}
              {result.recommendation && (
                <div className="rounded-xl border border-slate-200 bg-white/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Recommended Fix</p>
                  <p className="mt-2 text-sm text-slate-700 leading-6">{result.recommendation}</p>
                </div>
              )}
              {result.aiModelUsed && (
                <p className="text-xs text-gray-400">AI Model: {result.aiModelUsed}</p>
              )}

              <div className="flex gap-3 pt-2">
                <a
                  href="/incidents"
                  className="rounded-xl border border-blue-400/70 bg-blue-50/50 text-blue-600 px-4 py-2 text-sm hover:bg-blue-100/70 transition"
                >
                  View Incidents
                </a>
                {result.incidentId && (
                  <a
                    href="/reports"
                    className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm hover:bg-white transition"
                  >
                    View Full Report
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AnalyzeLogs;
