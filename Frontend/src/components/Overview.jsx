import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllIncidents, getIncidentById, getReportByIncidentId } from "../api/client";
import Navbar from "./Navbar";
import IncidentCharts from "./IncidentCharts";

function StatCard({ title, number, subtitle, accent }) {
  const accents = {
    blue:   { border: "border-l-blue-500",   num: "text-blue-600" },
    red:    { border: "border-l-red-500",    num: "text-red-600" },
    orange: { border: "border-l-orange-500", num: "text-orange-600" },
    green:  { border: "border-l-green-500",  num: "text-green-600" },
  };
  const a = accents[accent] || accents.blue;
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${a.border} shadow-sm p-5`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${a.num}`}>{number}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL: "bg-red-600 text-white",
    HIGH:     "bg-orange-500 text-white",
    MEDIUM:   "bg-amber-400 text-slate-900",
    LOW:      "bg-green-500 text-white",
  };
  const key = severity?.toUpperCase();
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${styles[key] || "bg-slate-200 text-slate-700"}`}>
      {severity || "Unknown"}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE:        "bg-red-100 text-red-700 border border-red-300",
    INVESTIGATING: "bg-blue-100 text-blue-700 border border-blue-300",
    RESOLVED:      "bg-green-100 text-green-700 border border-green-300",
    MONITORING:    "bg-purple-100 text-purple-700 border border-purple-300",
    OPEN:          "bg-orange-100 text-orange-700 border border-orange-300",
  };
  const key = status?.toUpperCase();
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${styles[key] || "bg-slate-100 text-slate-600 border border-slate-300"}`}>
      {status || "Unknown"}
    </span>
  );
}

function severityBar(severity) {
  const c = { CRITICAL: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-amber-400", LOW: "bg-green-500" };
  return c[severity?.toUpperCase()] || "bg-slate-300";
}

function formatDateTime(dt) {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString();
}

function IncidentDetailPanel({ incident, report, reportLoading, onClose }) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-900 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex gap-2 mb-3">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h2 className="text-xl font-semibold">{incident.title}</h2>
            <p className="text-slate-400 mt-1 text-sm">{incident.incidentType || "—"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm transition"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 p-5 border-b border-slate-200 bg-slate-50">
        {[
          { label: "Incident ID", value: incident.incidentId },
          { label: "Type",        value: incident.incidentType || "N/A" },
          { label: "Started",     value: formatDateTime(incident.startedAt) },
          { label: "Ended",       value: formatDateTime(incident.endedAt) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="mt-1 font-medium text-slate-800 text-sm">{value}</p>
          </div>
        ))}
      </div>

      <div className="p-6">
        {reportLoading ? (
          <p className="text-sm text-slate-400 animate-pulse">Loading AI report…</p>
        ) : report ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-1.5 h-4 rounded bg-blue-500"></span>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">AI Root Cause Analysis</p>
              <span className="ml-auto text-xs text-slate-400">
                {report.aiModelUsed || ""} · {formatDateTime(report.generatedAt)}
              </span>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Summary</p>
              <p className="mt-2 text-sm text-slate-700 leading-6">{report.summary || "No summary available."}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Root Cause</p>
              <p className="mt-2 text-sm text-slate-700 leading-6">{report.rootCause || "Analysis unavailable."}</p>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Recommended Fix</p>
              <p className="mt-2 text-sm text-slate-700 leading-6">{report.recommendation || "No recommendation available."}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 p-4 border border-dashed border-slate-300 rounded-lg text-center">
            No AI report found for this incident.{" "}
            <a href="/analyze" className="text-blue-500 hover:underline">Analyze logs</a> to generate one.
          </div>
        )}
      </div>
    </section>
  );
}

function Overview() {
  const location = useLocation();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [report, setReport] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");
  const [justAnalyzed, setJustAnalyzed] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setError("Unable to load incident data. Is the backend running at http://localhost:8081?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("incidentId");
    const idFromState = location.state?.incidentId;
    const targetId = idFromUrl || idFromState;

    if (location.state?.justAnalyzed || idFromUrl) {
      setJustAnalyzed(Boolean(location.state?.justAnalyzed || idFromUrl));
    }

    if (targetId) {
      openIncidentDetails(targetId);
    }
  }, [location.search, location.state]);

  const openIncidentDetails = async (incidentId) => {
    try {
      setDetailsLoading(true);
      setReport(null);
      setSelectedIncident(null);
      const incidentData = await getIncidentById(incidentId);
      setSelectedIncident(incidentData);
      setReportLoading(true);
      try {
        const reportData = await getReportByIncidentId(incidentId);
        setReport(reportData);
      } catch {
        setReport(null);
      } finally {
        setReportLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch incident details:", err);
      setError("Unable to load incident details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const stats = {
    critical: incidents.filter((i) => i.severity?.toUpperCase() === "CRITICAL").length,
    active:   incidents.filter((i) => ["ACTIVE", "INVESTIGATING", "OPEN"].includes(i.status?.toUpperCase())).length,
    resolved: incidents.filter((i) => i.status?.toUpperCase() === "RESOLVED").length,
    total:    incidents.length,
  };

  const topIncident =
    incidents.find((i) => ["ACTIVE", "INVESTIGATING", "OPEN"].includes(i.status?.toUpperCase())) ||
    incidents[0];

  const filteredIncidents = incidents.filter((incident) => {
    const sevMatch = severityFilter === "All" || incident.severity?.toUpperCase() === severityFilter.toUpperCase();
    const stMatch  = statusFilter  === "All" || incident.status?.toUpperCase()   === statusFilter.toUpperCase();
    return sevMatch && stMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-8 py-10">
          <p className="text-slate-400 animate-pulse">Loading dashboard…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-8">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Incident Overview</h2>
            <p className="text-slate-500 mt-1 text-sm">Monitor your cloud infrastructure and analyze incidents</p>
          </div>
          <button
            onClick={fetchIncidents}
            className="border border-slate-300 bg-white px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {justAnalyzed && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">✓</span>
              <div>
                <p className="font-semibold text-emerald-900">Logs Analyzed Successfully</p>
                <p className="text-emerald-700 text-xs mt-0.5">AI incident report has been generated and loaded below for your review.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setJustAnalyzed(false);
                if (window.location.search) {
                  window.history.replaceState({}, "", window.location.pathname);
                }
              }}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded hover:bg-emerald-100 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Incidents"    number={stats.total}    subtitle="All recorded incidents"       accent="blue"   />
          <StatCard title="Critical Incidents" number={stats.critical} subtitle="Require immediate attention"  accent="red"    />
          <StatCard title="Active Incidents"   number={stats.active}   subtitle="Currently being investigated" accent="orange" />
          <StatCard title="Resolved"           number={stats.resolved} subtitle="Successfully resolved"        accent="green"  />
        </div>

        {selectedIncident && (
          <IncidentDetailPanel
            incident={selectedIncident}
            report={report}
            reportLoading={reportLoading}
            onClose={() => {
              setSelectedIncident(null);
              setReport(null);
              setJustAnalyzed(false);
              if (window.location.search) {
                window.history.replaceState({}, "", window.location.pathname);
              }
            }}
          />
        )}

        {!selectedIncident && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-900">Top Active Incident</h3>
                <p className="text-sm text-slate-500 mt-0.5">Highest priority incident requiring attention</p>
              </div>
              {topIncident && (
                <div className="flex gap-2">
                  <SeverityBadge severity={topIncident.severity} />
                  <StatusBadge   status={topIncident.status} />
                </div>
              )}
            </div>
            {topIncident ? (
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{topIncident.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">{topIncident.incidentType || "—"}</p>
                  </div>
                  <button
                    onClick={() => openIncidentDetails(topIncident.incidentId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {detailsLoading ? "Loading…" : "View Details"}
                  </button>
                </div>
                <div className="grid grid-cols-4 mt-5 pt-5 border-t border-slate-100">
                  <div><p className="text-xs text-slate-400">Incident ID</p><p className="mt-1 text-sm font-medium">{topIncident.incidentId}</p></div>
                  <div><p className="text-xs text-slate-400">Type</p><p className="mt-1 text-sm font-medium">{topIncident.incidentType || "N/A"}</p></div>
                  <div><p className="text-xs text-slate-400">Started</p><p className="mt-1 text-sm font-medium">{formatDateTime(topIncident.startedAt)}</p></div>
                  <div><p className="text-xs text-slate-400">Ended</p><p className="mt-1 text-sm font-medium">{formatDateTime(topIncident.endedAt)}</p></div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-400">No active incidents.</div>
            )}
          </div>
        )}

        <IncidentCharts incidents={incidents} />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Incidents</h3>
              <p className="text-sm text-slate-500 mt-0.5">Filter and inspect recent infrastructure incidents</p>
            </div>
            <div className="flex gap-2">
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
                className="border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300">
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {filteredIncidents.length ? (
            <div className="divide-y divide-slate-100">
              {filteredIncidents.map((incident) => (
                <div key={incident.incidentId}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${severityBar(incident.severity)}`} />
                    <div>
                      <p className="font-medium text-slate-900">{incident.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{incident.incidentType || "Unknown type"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge   status={incident.status} />
                    <button onClick={() => openIncidentDetails(incident.incidentId)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              No incidents match the selected filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Overview;
