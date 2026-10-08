import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeLogs, createLogsBatch, getAllIncidents } from "../api/client";
import Navbar from "./Navbar";

const KNOWN_SERVICES = [
  { id: 1, name: "ec2-app-server", type: "EC2", region: "us-east-1" },
  { id: 2, name: "rds-mysql-primary", type: "RDS", region: "us-east-1" },
  { id: 3, name: "app-load-balancer", type: "ALB", region: "us-east-1" },
];

const EVENT_TYPES = ["ERROR", "WARNING", "METRIC_ALERT", "CRITICAL", "INFO"];

const METRIC_SUGGESTIONS = [
  "CPUUtilization",
  "MemoryUtilization",
  "ErrorRate",
  "ConnectionCount",
  "Latency",
  "DiskReadOps",
];

const getNowLocalDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatTimestampForBackend = (ts) => {
  if (!ts) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  if (ts.length === 16) return `${ts}:00`;
  return ts;
};

const createEmptyLogEntry = (defaultServiceId = "1") => ({
  serviceId: defaultServiceId,
  eventType: "ERROR",
  message: "",
  metricName: "CPUUtilization",
  metricValue: "",
  eventTimestamp: getNowLocalDateTime(),
});

function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL: "bg-red-600 text-white",
    HIGH: "bg-orange-500 text-white",
    MEDIUM: "bg-amber-400 text-slate-900",
    LOW: "bg-green-500 text-white",
  };
  const key = severity?.toUpperCase();
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[key] || "bg-slate-200 text-slate-700"}`}>
      {severity || "Unknown"}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-red-100 text-red-700 border border-red-300",
    INVESTIGATING: "bg-blue-100 text-blue-700 border border-blue-300",
    RESOLVED: "bg-green-100 text-green-700 border border-green-300",
    MONITORING: "bg-purple-100 text-purple-700 border border-purple-300",
    OPEN: "bg-orange-100 text-orange-700 border border-orange-300",
  };
  const key = status?.toUpperCase();
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[key] || "bg-slate-100 text-slate-600 border border-slate-300"}`}>
      {status || "Unknown"}
    </span>
  );
}

function AnalyzeLogs() {
  const navigate = useNavigate();

  // Target Incident state
  const [incidentId, setIncidentId] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);

  // Global default service
  const [defaultServiceId, setDefaultServiceId] = useState("1");

  // Log entries array
  const [logs, setLogs] = useState([createEmptyLogEntry("1")]);

  // Status & execution states
  const [submittingLogs, setSubmittingLogs] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submittedEvents, setSubmittedEvents] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Load existing incidents on mount
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setIncidentsLoading(true);
        const data = await getAllIncidents();
        const list = Array.isArray(data) ? data : [];
        setIncidents(list);
        if (list.length > 0 && !incidentId) {
          setIncidentId(String(list[0].incidentId));
        }
      } catch (err) {
        console.warn("Could not load incidents list:", err);
      } finally {
        setIncidentsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const selectedIncident = incidents.find((i) => String(i.incidentId) === String(incidentId));

  // Add / Remove / Update Log Entries
  const handleAddEntry = () => {
    setLogs((prev) => [...prev, createEmptyLogEntry(defaultServiceId)]);
  };

  const handleRemoveEntry = (index) => {
    if (logs.length <= 1) return;
    setLogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogChange = (index, field, value) => {
    setLogs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Pre-fill realistic sample failure telemetry
  const loadSample = () => {
    const sampleTargetId = incidentId || (incidents.length > 0 ? String(incidents[0].incidentId) : "1");
    setIncidentId(sampleTargetId);
    setDefaultServiceId("1");
    setLogs([
      {
        serviceId: "1",
        eventType: "METRIC_ALERT",
        metricName: "CPUUtilization",
        metricValue: "98.5",
        message: "CPU utilization spiked to 98.5% on production server (EC2 instance)",
        eventTimestamp: getNowLocalDateTime(),
      },
      {
        serviceId: "2",
        eventType: "ERROR",
        metricName: "ConnectionCount",
        metricValue: "150",
        message: "RDS MySQL connection pool exhausted, max_connections limit (150) reached",
        eventTimestamp: getNowLocalDateTime(),
      },
      {
        serviceId: "3",
        eventType: "ERROR",
        metricName: "ErrorRate",
        metricValue: "14.2",
        message: "ALB returned HTTP 503 Service Unavailable: No healthy targets in target group",
        eventTimestamp: getNowLocalDateTime(),
      },
    ]);
    setSuccessMsg("Loaded sample DevOps incident failure telemetry.");
  };

  const resetForm = () => {
    setLogs([createEmptyLogEntry(defaultServiceId)]);
    setError("");
    setSuccessMsg("");
    setSubmittedEvents([]);
  };

  // Validate log entries before submitting
  const validateForm = () => {
    if (!incidentId || isNaN(Number(incidentId)) || Number(incidentId) <= 0) {
      setError("Please select or enter a valid positive numeric Incident ID.");
      return false;
    }
    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];
      if (!entry.message || !entry.message.trim()) {
        setError(`Log Entry #${i + 1} is missing a required Message.`);
        return false;
      }
      const sId = entry.serviceId || defaultServiceId;
      if (!sId || isNaN(Number(sId))) {
        setError(`Log Entry #${i + 1} has an invalid Service ID.`);
        return false;
      }
    }
    return true;
  };

  // Format payload for POST /api/logs
  const preparePayloads = () => {
    return logs.map((entry) => ({
      incidentId: Number(incidentId),
      serviceId: Number(entry.serviceId || defaultServiceId),
      eventType: entry.eventType || "ERROR",
      message: entry.message.trim(),
      metricName: entry.metricName ? entry.metricName.trim() : null,
      metricValue:
        entry.metricValue !== "" && entry.metricValue !== null && !isNaN(Number(entry.metricValue))
          ? Number(entry.metricValue)
          : null,
      eventTimestamp: formatTimestampForBackend(entry.eventTimestamp),
    }));
  };

  // Submit Incident Details/Logs only (POST /api/logs)
  const handleSubmitLogsOnly = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmittedEvents([]);

    if (!validateForm()) return;

    try {
      setSubmittingLogs(true);
      const payloads = preparePayloads();
      const responses = await createLogsBatch(payloads);

      setSubmittedEvents(responses);
      setSuccessMsg(`Successfully submitted ${responses.length} incident log event(s) to Incident #${incidentId} via POST /api/logs.`);
    } catch (err) {
      console.error("Failed to submit incident logs:", err);
      const backendMsg = err?.response?.data?.message || err?.message;
      setError(backendMsg || "Failed to submit incident logs. Ensure the incident ID exists in the database.");
    } finally {
      setSubmittingLogs(false);
    }
  };

  // Submit Incident Logs and immediately Trigger AI Analysis
  const handleSubmitAndAnalyze = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setResult(null);

    if (!validateForm()) return;

    try {
      setSubmittingLogs(true);
      const payloads = preparePayloads();
      const responses = await createLogsBatch(payloads);
      setSubmittedEvents(responses);
      setSubmittingLogs(false);

      // Now trigger AI analysis
      setAnalyzing(true);
      const analysisData = await analyzeLogs({ incidentId: Number(incidentId) });
      setResult(analysisData);
      setSuccessMsg(`Ingested ${responses.length} event(s) and completed AI Root Cause Analysis for Incident #${incidentId}!`);

      if (analysisData?.incidentId) {
        navigate(`/?incidentId=${analysisData.incidentId}`, {
          state: { justAnalyzed: true, incidentId: analysisData.incidentId, report: analysisData },
        });
      }
    } catch (err) {
      console.error("Submission or analysis failed:", err);
      const backendMsg = err?.response?.data?.message || err?.message;
      setError(backendMsg || "Operation failed. Check backend connectivity at http://localhost:8081.");
    } finally {
      setSubmittingLogs(false);
      setAnalyzing(false);
    }
  };

  // Analyze existing incident logs directly (POST /api/analyze)
  const handleAnalyzeExisting = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setResult(null);

    if (!incidentId || isNaN(Number(incidentId)) || Number(incidentId) <= 0) {
      setError("Please select or enter an Incident ID to analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      const data = await analyzeLogs({ incidentId: Number(incidentId) });
      setResult(data);

      if (data?.incidentId) {
        navigate(`/?incidentId=${data.incidentId}`, {
          state: { justAnalyzed: true, incidentId: data.incidentId, report: data },
        });
      }
    } catch (err) {
      console.error("Direct analysis failed:", err);
      const backendMsg = err?.response?.data?.message || err?.message;
      setError(backendMsg || "Failed to analyze incident logs. Make sure the incident has recorded logs.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-8 py-8">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analyze Logs & Submit Incident Telemetry</h2>
            <p className="text-slate-500 mt-1 text-sm">
              Submit incident event telemetry to the database via <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-700">POST /api/logs</code> and trigger AI root cause diagnosis via <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-700">POST /api/analyze</code>.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className="border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            ⚡ Load Sample Telemetry
          </button>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-600">✓</span>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2 py-1">Dismiss</button>
          </div>
        )}

        {/* Ingested Events Confirmation Card */}
        {submittedEvents.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Ingested Incident Events</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {submittedEvents.map((ev, idx) => (
                <div key={ev?.eventId || idx} className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                  <div>
                    <span className="font-semibold text-slate-800">Event #{ev?.eventId || (idx + 1)}</span>
                    <span className="text-slate-500 ml-2">Service ID: {ev?.serviceId} · Type: {ev?.eventType}</span>
                    <p className="text-slate-700 mt-0.5">{ev?.message}</p>
                  </div>
                  <span className="font-mono text-slate-400">{ev?.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString() : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmitAndAnalyze} className="space-y-6">

          {/* Section 1: Incident & Service Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 text-base mb-1">1. Incident & Service Configuration</h3>
            <p className="text-sm text-slate-500 mb-5">
              Select or specify the incident record to receive the event logs, and choose the AWS service.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Incident Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="incidentSelect">
                  Target Incident <span className="text-red-500">*</span>
                </label>
                {incidents.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      id="incidentSelect"
                      value={incidentId}
                      onChange={(e) => setIncidentId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                    >
                      {incidents.map((inc) => (
                        <option key={inc.incidentId} value={inc.incidentId}>
                          #{inc.incidentId} - {inc.title} ({inc.severity})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Or enter manual ID:</span>
                      <input
                        type="number"
                        min="1"
                        value={incidentId}
                        onChange={(e) => setIncidentId(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-24 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      id="incidentIdInput"
                      type="number"
                      min="1"
                      required
                      value={incidentId}
                      onChange={(e) => setIncidentId(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {incidentsLoading ? "Loading incidents from database…" : "Enter the numerical Incident ID"}
                    </p>
                  </div>
                )}

                {selectedIncident && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-800">{selectedIncident.title}</p>
                      <p className="text-slate-500">{selectedIncident.incidentType || "Infrastructure event"}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <SeverityBadge severity={selectedIncident.severity} />
                      <StatusBadge status={selectedIncident.status} />
                    </div>
                  </div>
                )}
              </div>

              {/* Service Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="serviceSelect">
                  Default Service Configuration <span className="text-red-500">*</span>
                </label>
                <select
                  id="serviceSelect"
                  value={defaultServiceId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setDefaultServiceId(newId);
                    setLogs((prev) => prev.map((l) => ({ ...l, serviceId: newId })));
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                >
                  {KNOWN_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      Service #{s.id} - {s.name} ({s.type} · {s.region})
                    </option>
                  ))}
                  <option value="custom">Custom Service ID</option>
                </select>

                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                  <p className="font-medium text-slate-700">Monitored Cloud Resource</p>
                  <p className="mt-0.5">
                    {KNOWN_SERVICES.find((s) => String(s.id) === String(defaultServiceId))
                      ? `Target service ID #${defaultServiceId} maps to ${KNOWN_SERVICES.find((s) => String(s.id) === String(defaultServiceId)).name}.`
                      : `Using custom Service ID #${defaultServiceId}.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Log Entries / Incident Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">2. Incident Log Entries ({logs.length})</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Provide operational error logs, telemetry warnings, and metrics associated with this incident.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                >
                  <span>+</span> Add Log Entry
                </button>
              </div>
            </div>

            {/* Datalist for Metric Suggestions */}
            <datalist id="metric-suggestions">
              {METRIC_SUGGESTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>

            {/* Log Entry Cards */}
            <div className="space-y-4">
              {logs.map((entry, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 relative hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      Log Event #{index + 1}
                    </span>
                    {logs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(index)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition"
                      >
                        Remove Event
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Log Message */}
                    <div className="md:col-span-8">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Log Message / Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Connection pool exhausted, max_connections limit reached"
                        value={entry.message}
                        onChange={(e) => handleLogChange(index, "message", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>

                    {/* Event Type */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={entry.eventType}
                        onChange={(e) => handleLogChange(index, "eventType", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Metric Name */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Metric Name (Optional)
                      </label>
                      <input
                        type="text"
                        list="metric-suggestions"
                        placeholder="e.g. CPUUtilization"
                        value={entry.metricName}
                        onChange={(e) => handleLogChange(index, "metricName", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>

                    {/* Metric Value */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Value (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 98.5"
                        value={entry.metricValue}
                        onChange={(e) => handleLogChange(index, "metricValue", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>

                    {/* Event Timestamp */}
                    <div className="md:col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-700">Timestamp</label>
                        <button
                          type="button"
                          onClick={() => handleLogChange(index, "eventTimestamp", getNowLocalDateTime())}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Set to Now
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        value={entry.eventTimestamp}
                        onChange={(e) => handleLogChange(index, "eventTimestamp", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>

                    {/* Service Override */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Service ID
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={entry.serviceId}
                        onChange={(e) => handleLogChange(index, "serviceId", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Submission & AI Analysis Actions</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingest to backend MySQL database or immediately run full AI root-cause analysis
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Button 1: Submit Logs Only (POST /api/logs) */}
              <button
                type="button"
                onClick={handleSubmitLogsOnly}
                disabled={submittingLogs || analyzing}
                className="flex-1 md:flex-none border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
              >
                {submittingLogs ? "Ingesting Logs…" : `Submit ${logs.length} Log Event(s)`}
              </button>

              {/* Button 2: Submit & Analyze with AI (POST /api/logs -> POST /api/analyze) */}
              <button
                type="submit"
                disabled={submittingLogs || analyzing}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <span>Analyzing with AI…</span>
                ) : submittingLogs ? (
                  <span>Ingesting Logs…</span>
                ) : (
                  <span>Submit & Run AI Analysis</span>
                )}
              </button>

              {/* Button 3: Analyze Existing Logs Only (POST /api/analyze) */}
              <button
                type="button"
                onClick={handleAnalyzeExisting}
                disabled={submittingLogs || analyzing || !incidentId}
                className="flex-1 md:flex-none border border-blue-200 bg-blue-50/70 hover:bg-blue-100 disabled:opacity-50 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {analyzing ? "Analyzing…" : "Analyze Incident Logs Only"}
              </button>
            </div>
          </div>
        </form>

        {/* AI Analysis Result Report */}
        {result && (
          <section className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Analysis Complete</p>
              <h2 className="mt-2 text-xl font-semibold">AI Incident Root Cause Report Generated</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                {result.incidentId && <span>Incident ID: #{result.incidentId}</span>}
                {result.reportId && <span>Report ID: #{result.reportId}</span>}
                {result.aiModelUsed && <span>Model: {result.aiModelUsed}</span>}
              </div>
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

              <div className="flex gap-3 pt-2">
                <a
                  href="/incidents"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  View Incidents
                </a>
                {result.incidentId && (
                  <a
                    href={`/reports?incidentId=${result.incidentId}`}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm transition"
                  >
                    View Full Report
                  </a>
                )}
                <a
                  href="/"
                  className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm transition"
                >
                  Overview Dashboard
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AnalyzeLogs;
