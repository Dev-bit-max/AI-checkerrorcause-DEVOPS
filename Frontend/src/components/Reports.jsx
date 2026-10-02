import React, { useState, useEffect } from "react";
import { getReportByIncidentId, getAllIncidents, deleteAllIncidents } from "../api/client";
import Navbar from "./Navbar";

function formatDateTime(dt) {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString();
}

function Reports() {
  const [incidentIdInput, setIncidentIdInput] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allIncidents, setAllIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [showIncidentPicker, setShowIncidentPicker] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleDeleteAll = async () => {
    const confirmed = window.confirm("Are you sure you want to permanently delete ALL incidents and reports from the database? This cannot be undone.");
    if (!confirmed) return;
    try {
      setDeleting(true);
      setError("");
      setSuccessMsg("");
      await deleteAllIncidents();
      setReport(null);
      setIncidentIdInput("");
      setAllIncidents([]);
      setShowIncidentPicker(false);
      setSuccessMsg("All incidents, reports, and events were deleted successfully from the database.");
    } catch (err) {
      console.error("Failed to delete all incidents:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to delete incidents from database.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("incidentId");
    if (id) {
      setIncidentIdInput(id);
      fetchReport(id);
    }
  }, []);

  const fetchReport = async (id) => {
    const targetId = id || incidentIdInput;
    if (!targetId) { setError("Please enter an Incident ID."); return; }
    try {
      setLoading(true);
      setError("");
      setReport(null);
      const data = await getReportByIncidentId(targetId);
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      const msg = err?.response?.data?.message;
      setError(msg || `No report found for Incident ID: ${targetId}. Analyze logs first to generate one.`);
    } finally {
      setLoading(false);
    }
  };

  const loadIncidents = async () => {
    try {
      setIncidentsLoading(true);
      const data = await getAllIncidents();
      setAllIncidents(Array.isArray(data) ? data : []);
      setShowIncidentPicker(true);
    } catch {
      setError("Failed to load incidents list.");
    } finally {
      setIncidentsLoading(false);
    }
  };

  const selectIncident = (incident) => {
    setIncidentIdInput(String(incident.incidentId));
    setShowIncidentPicker(false);
    fetchReport(incident.incidentId);
  };

  const severityBadgeCls = (sev) => {
    const s = sev?.toUpperCase();
    if (s === "CRITICAL") return "bg-red-600 text-white";
    if (s === "HIGH")     return "bg-orange-500 text-white";
    if (s === "MEDIUM")   return "bg-amber-400 text-slate-900";
    return "bg-green-500 text-white";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 py-8">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI Reports</h2>
            <p className="text-slate-500 mt-1 text-sm">Retrieve AI-generated root cause analysis and recommendations by incident ID</p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={deleting}
            className="border border-red-300 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            {deleting ? "Deleting…" : "Delete All Incidents"}
          </button>
        </div>

        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-600">✓</span>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2 py-1">Dismiss</button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-slate-900 mb-1">Fetch Report</h3>
          <p className="text-sm text-slate-500 mb-4">Enter an Incident ID to load its AI-generated report</p>
          <div className="flex gap-3">
            <input
              type="number"
              value={incidentIdInput}
              onChange={(e) => setIncidentIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchReport()}
              placeholder="Enter Incident ID (e.g. 1)"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
            <button onClick={() => fetchReport()} disabled={loading || !incidentIdInput}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition">
              {loading ? "Loading…" : "Get Report"}
            </button>
            <button onClick={loadIncidents} disabled={incidentsLoading}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm transition disabled:opacity-60">
              {incidentsLoading ? "Loading…" : "Browse Incidents"}
            </button>
          </div>
        </div>

        {showIncidentPicker && (
          <div className="mb-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900 text-sm">Select an Incident</h3>
              <button onClick={() => setShowIncidentPicker(false)} className="text-xs text-slate-400 hover:text-slate-600 transition">Close</button>
            </div>
            {allIncidents.length ? (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {allIncidents.map((incident) => (
                  <button key={incident.incidentId} onClick={() => selectIncident(incident)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{incident.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {incident.incidentId} · {incident.incidentType || "Unknown type"}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${severityBadgeCls(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-4 text-sm text-slate-400">No incidents found.</p>
            )}
          </div>
        )}

        {report && (
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Root Cause Analysis</p>
              <h2 className="mt-2 text-xl font-semibold">Incident Report #{report.incidentId}</h2>
              <div className="mt-2 flex gap-4 text-sm text-slate-400">
                <span>Report ID: {report.reportId}</span>
                {report.aiModelUsed && <span>Model: {report.aiModelUsed}</span>}
                <span>Generated: {formatDateTime(report.generatedAt)}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {report.summary && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Summary</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.summary}</p>
                </div>
              )}
              {report.rootCause && (
                <div className="rounded-lg border border-orange-100 bg-orange-50 p-5">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Root Cause</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.rootCause}</p>
                </div>
              )}
              {report.recommendation && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-5">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Recommended Actions</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.recommendation}</p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-5 py-3">
                <div>
                  <p className="text-xs text-slate-400">Incident ID</p>
                  <p className="font-mono text-xs text-slate-600 mt-0.5">{report.incidentId}</p>
                </div>
                {report.aiModelUsed && (
                  <div className="text-right">
                    <p className="text-xs text-slate-400">AI Model</p>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{report.aiModelUsed}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <a href="/incidents" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">View Incidents</a>
                <a href="/analyze" className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm transition">Analyze More Logs</a>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Reports;
