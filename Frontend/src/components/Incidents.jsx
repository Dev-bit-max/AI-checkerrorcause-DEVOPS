import React, { useEffect, useMemo, useState } from "react";
import { getAllIncidents, getIncidentById, getReportByIncidentId } from "../api/client";


function Navbar() {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-white/60 bg-white/75 px-8 py-4 shadow-sm backdrop-blur-xl">
      <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
        RootCause AI
      </h1>
      <div className="flex gap-8 text-sm">
        <a href="/" className="text-gray-600 transition-colors hover:text-blue-600">Overview</a>
        <a href="/incidents" className="font-medium text-blue-600">Incidents</a>
        <a href="/analyze" className="text-gray-600 transition-colors hover:text-blue-600">Analyze Logs</a>
        <a href="/reports" className="text-gray-600 transition-colors hover:text-blue-600">Reports</a>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-blue-700 text-white shadow-md text-sm font-bold">
          K
        </div>
      </div>
    </nav>
  );
}


function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL: "bg-red-100/80 text-red-700 border-red-200/80",
    HIGH: "bg-orange-100/80 text-orange-700 border-orange-200/80",
    MEDIUM: "bg-yellow-100/80 text-yellow-700 border-yellow-200/80",
    LOW: "bg-green-100/80 text-green-700 border-green-200/80",
  };
  const key = severity?.toUpperCase();
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${styles[key] || "border-gray-200 bg-gray-100 text-gray-600"}`}>
      {severity || "Unknown"}
    </span>
  );
}


function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-red-50/80 text-red-600 border-red-200/80",
    INVESTIGATING: "bg-blue-50/80 text-blue-600 border-blue-200/80",
    MONITORING: "bg-purple-50/80 text-purple-600 border-purple-200/80",
    RESOLVED: "bg-green-50/80 text-green-600 border-green-200/80",
    OPEN: "bg-orange-50/80 text-orange-600 border-orange-200/80",
  };
  const key = status?.toUpperCase();
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${styles[key] || "border-gray-200 bg-gray-100 text-gray-600"}`}>
      {status || "Unknown"}
    </span>
  );
}


function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}


function formatDateTime(dt) {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString();
}

function IncidentDetails({ incident, report, reportLoading, onClose }) {
  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 flex gap-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h2 className="text-2xl font-semibold">{incident.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{incident.incidentType || "—"}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/20 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-4 gap-5 border-b border-slate-200/70 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Incident ID</p>
          <p className="mt-2 font-medium text-slate-800">{incident.incidentId}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Type</p>
          <p className="mt-2 font-medium text-slate-800">{incident.incidentType || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Started</p>
          <p className="mt-2 font-medium text-slate-800">{formatDateTime(incident.startedAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Ended</p>
          <p className="mt-2 font-medium text-slate-800">{formatDateTime(incident.endedAt)}</p>
        </div>
      </div>

      {/* AI Report */}
      <div className="p-6">
        {reportLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading AI report...</p>
        ) : report ? (
          <div className="space-y-5">
            {/* Root Cause */}
            <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-indigo-50/70 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">AI Analysis</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Root Cause</h3>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-2 text-center shadow-sm">
                  <p className="text-xs text-gray-400">Model</p>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{report.aiModelUsed || "N/A"}</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-blue-100 bg-white/60 p-4">
                <p className="text-sm leading-6 text-slate-700">{report.rootCause || "AI root cause analysis unavailable."}</p>
              </div>
            </div>

           
            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Summary</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{report.summary || "No summary available."}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Suggested Actions</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Recommended Fix</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{report.recommendation || "No recommendation available."}</p>
              <p className="mt-2 text-xs text-gray-400">Generated: {formatDateTime(report.generatedAt)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-gray-400">
            No AI report found for this incident.{" "}
            <a href="/analyze" className="text-blue-500 hover:underline">Analyze logs</a> to generate one.
          </div>
        )}
      </div>

   
      <div className="border-t border-slate-200/70 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Incident ID</p>
            <p className="mt-1 font-mono text-xs text-slate-600">{incident.incidentId}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Current Status</p>
            <div className="mt-1"><StatusBadge status={incident.status} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}


function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [report, setReport] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setError("Unable to load incidents. Is the backend running at http://localhost:8081?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);


  const openDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setReport(null);
      setSelectedIncident(null);
      const incidentData = await getIncidentById(id);
      setSelectedIncident(incidentData);
      setReportLoading(true);
      try {
        const reportData = await getReportByIncidentId(id);
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


  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const sev = incident.severity?.toUpperCase();
      const st = incident.status?.toUpperCase();
      const sevMatch = severityFilter === "All" || sev === severityFilter.toUpperCase();
      const stMatch = statusFilter === "All" || st === statusFilter.toUpperCase();
      const searchMatch =
        !search ||
        incident.title?.toLowerCase().includes(search.toLowerCase()) ||
        incident.incidentType?.toLowerCase().includes(search.toLowerCase());
      return sevMatch && stMatch && searchMatch;
    });
  }, [incidents, severityFilter, statusFilter, search]);

  
  const stats = {
    total: incidents.length,
    critical: incidents.filter((i) => i.severity?.toUpperCase() === "CRITICAL").length,
    active: incidents.filter((i) => ["ACTIVE", "INVESTIGATING", "OPEN"].includes(i.status?.toUpperCase())).length,
    resolved: incidents.filter((i) => i.status?.toUpperCase() === "RESOLVED").length,
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-8 py-10">
          <p className="text-gray-500 animate-pulse">Loading incidents...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-8 py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-[500px] h-72 w-72 rounded-full bg-indigo-300/15 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Incidents</h2>
            <p className="mt-1 text-gray-500">Monitor, investigate and resolve infrastructure incidents</p>
          </div>
          <button
            onClick={fetchIncidents}
            className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-7 grid grid-cols-4 gap-5">
          <StatCard title="Total Incidents" value={stats.total} description="All recorded incidents" />
          <StatCard title="Critical Incidents" value={stats.critical} description="Require immediate attention" />
          <StatCard title="Active Incidents" value={stats.active} description="Currently being investigated" />
          <StatCard title="Resolved Incidents" value={stats.resolved} description="Successfully resolved" />
        </div>

        {/* Incident Details */}
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            report={report}
            reportLoading={reportLoading}
            onClose={() => { setSelectedIncident(null); setReport(null); }}
          />
        )}

        {/* Incident List */}
        {!selectedIncident && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            {/* Filters */}
            <div className="flex items-center justify-between border-b border-slate-200/70 p-5">
              <div>
                <h3 className="font-semibold text-slate-900">All Incidents</h3>
                <p className="mt-1 text-sm text-gray-500">Search, filter and inspect infrastructure incidents</p>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-40 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur-md focus:ring-2 focus:ring-blue-200"
                />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur-md focus:ring-2 focus:ring-blue-200"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur-md focus:ring-2 focus:ring-blue-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Rows */}
            {filteredIncidents.length ? (
              <div className="divide-y divide-slate-200/70">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.incidentId}
                    className="flex items-center justify-between p-5 transition-colors hover:bg-blue-50/40"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-1 rounded-full ${
                          incident.severity?.toUpperCase() === "CRITICAL" ? "bg-red-500" :
                          incident.severity?.toUpperCase() === "HIGH" ? "bg-orange-500" :
                          incident.severity?.toUpperCase() === "MEDIUM" ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-slate-900">{incident.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{incident.incidentType || "Unknown type"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                      <button
                        onClick={() => openDetails(incident.incidentId)}
                        className="font-medium text-sm text-blue-600 hover:underline"
                      >
                        {detailsLoading ? "Loading..." : "Details"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-gray-400">
                No incidents match the selected filters.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Incidents;
