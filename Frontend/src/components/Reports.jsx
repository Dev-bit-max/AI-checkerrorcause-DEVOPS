import React, { useState } from "react";
import { getReportByIncidentId, getAllIncidents } from "../api/client";


function Navbar() {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-white/60 bg-white/75 px-8 py-4 shadow-sm backdrop-blur-xl">
      <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
        RootCause AI
      </h1>
      <div className="flex gap-8 text-sm">
        <a href="/" className="text-gray-600 transition-colors hover:text-blue-600">Overview</a>
        <a href="/incidents" className="text-gray-600 transition-colors hover:text-blue-600">Incidents</a>
        <a href="/analyze" className="text-gray-600 transition-colors hover:text-blue-600">Analyze Logs</a>
        <a href="/reports" className="font-medium text-blue-600">Reports</a>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-blue-700 text-sm font-bold text-white shadow-md">
        K
      </div>
    </nav>
  );
}


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


  const fetchReport = async (id) => {
    const targetId = id || incidentIdInput;
    if (!targetId) {
      setError("Please enter an Incident ID.");
      return;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      <Navbar />

      <main className="relative mx-auto max-w-4xl px-8 py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

    
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">AI Reports</h2>
          <p className="mt-1 text-gray-500">
            Retrieve AI-generated root cause analysis and recommendations by incident ID
          </p>
        </div>

    
        {error && (
          <div className="mt-5 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        )}

   
        <div className="mt-6 rounded-2xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <h3 className="font-semibold text-slate-900">Fetch Report</h3>
          <p className="mt-1 text-sm text-gray-500">Enter an Incident ID to load its AI-generated report</p>

          <div className="mt-4 flex gap-3">
            <input
              type="number"
              value={incidentIdInput}
              onChange={(e) => setIncidentIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchReport()}
              placeholder="Enter Incident ID (e.g. 1)"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() => fetchReport()}
              disabled={loading || !incidentIdInput}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>
            <button
              onClick={loadIncidents}
              disabled={incidentsLoading}
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm hover:bg-white transition disabled:opacity-60"
            >
              {incidentsLoading ? "Loading..." : "Browse Incidents"}
            </button>
          </div>
        </div>



        {showIncidentPicker && (
          <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 p-4">
              <h3 className="font-semibold text-slate-900 text-sm">Select an Incident</h3>
              <button onClick={() => setShowIncidentPicker(false)} className="text-xs text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>
            {allIncidents.length ? (
              <div className="divide-y divide-slate-200/70 max-h-72 overflow-y-auto">
                {allIncidents.map((incident) => (
                  <button
                    key={incident.incidentId}
                    onClick={() => selectIncident(incident)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50/40 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{incident.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">ID: {incident.incidentId} · {incident.incidentType || "Unknown type"}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      incident.severity?.toUpperCase() === "CRITICAL" ? "bg-red-100 text-red-700 border-red-200" :
                      incident.severity?.toUpperCase() === "HIGH" ? "bg-orange-100 text-orange-700 border-orange-200" :
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      {incident.severity}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-4 text-sm text-gray-400">No incidents found.</p>
            )}
          </div>
        )}

        {/* Report Display */}
        {report && (
          <section className="mt-6 rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">AI Root Cause Analysis</p>
              <h2 className="mt-2 text-xl font-semibold">Incident Report #{report.incidentId}</h2>
              <div className="mt-2 flex gap-4 text-sm text-slate-300">
                <span>Report ID: {report.reportId}</span>
                {report.aiModelUsed && <span>Model: {report.aiModelUsed}</span>}
                <span>Generated: {formatDateTime(report.generatedAt)}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary */}
              {report.summary && (
                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Summary</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.summary}</p>
                </div>
              )}

              {/* Root Cause */}
              {report.rootCause && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Root Cause</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.rootCause}</p>
                </div>
              )}

              {/* Recommendation */}
              {report.recommendation && (
                <div className="rounded-xl border border-slate-200 bg-white/60 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Recommended Actions</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.recommendation}</p>
                </div>
              )}

              {/* Meta footer */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 px-5 py-3">
                <div>
                  <p className="text-xs text-gray-400">Incident ID</p>
                  <p className="font-mono text-xs text-slate-600 mt-0.5">{report.incidentId}</p>
                </div>
                {report.aiModelUsed && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">AI Model</p>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{report.aiModelUsed}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <a
                  href="/incidents"
                  className="rounded-xl border border-blue-400/70 bg-blue-50/50 text-blue-600 px-4 py-2 text-sm hover:bg-blue-100/70 transition"
                >
                  View Incidents
                </a>
                <a
                  href="/analyze"
                  className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm hover:bg-white transition"
                >
                  Analyze More Logs
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Reports;
