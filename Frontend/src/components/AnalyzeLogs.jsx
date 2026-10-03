import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeLogs } from "../api/client";
import Navbar from "./Navbar";

function AnalyzeLogs() {
  const navigate = useNavigate();
  const [incidentId, setIncidentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      setLoading(true);
      const data = await analyzeLogs({ incidentId: Number(incidentId) });
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

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-8 py-8">

        <div className="mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analyze Logs</h2>
            <p className="text-slate-500 mt-1 text-sm">Run AI analysis on the logs already saved for an incident</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Incident</h3>
            <p className="text-sm text-slate-500 mb-4">Enter an existing incident ID. The backend analyzes its saved log entries.</p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="incidentId">Incident ID <span className="text-red-500">*</span></label>
              <input id="incidentId" type="number" min="1" required value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)} placeholder="e.g. 1" className="w-48 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 transition" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition shadow-md">
            {loading ? "Analyzing logs with AI…" : "Analyze Incident"}
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
