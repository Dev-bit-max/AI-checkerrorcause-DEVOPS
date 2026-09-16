import React, { useEffect, useState } from "react";
import { getAllIncidents, getIncidentById, getReportByIncidentId } from "../api/client";


function Navbar() {
  return (
    <nav className="bg-white/75 backdrop-blur-xl border-b border-white/60 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
      <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        RootCause AI
      </h1>
      <div className="flex gap-8 text-sm">
        <a href="/" className="text-blue-600 font-medium">Overview</a>
        <a href="/incidents" className="text-gray-600 hover:text-blue-600 transition-colors">Incidents</a>
        <a href="/analyze" className="text-gray-600 hover:text-blue-600 transition-colors">Analyze Logs</a>
        <a href="/reports" className="text-gray-600 hover:text-blue-600 transition-colors">Reports</a>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search incidents..."
          className="w-44 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
        />
      </div>
    </nav>
  );
}


function StatCard({ title, number, subtitle }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-slate-800">{number}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}


function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
  };
  const key = severity?.toUpperCase();
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[key] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {severity || "Unknown"}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-red-50 text-red-600 border-red-200",
    INVESTIGATING: "bg-blue-50 text-blue-600 border-blue-200",
    RESOLVED: "bg-green-50 text-green-600 border-green-200",
    MONITORING: "bg-purple-50 text-purple-600 border-purple-200",
    OPEN: "bg-orange-50 text-orange-600 border-orange-200",
  };
  const key = status?.toUpperCase();
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[key] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status || "Unknown"}
    </span>
  );
}


function formatDateTime(dt) {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString();
}


function IncidentDetailPanel({ incident, report, reportLoading, onClose }) {
  return (
    <section className="mt-7 bg-white border rounded-xl shadow-sm overflow-hidden">
   



      <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white p-6 overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-3">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h2 className="text-2xl font-semibold">{incident.title}</h2>
            <p className="text-slate-300 mt-2 text-sm">{incident.incidentType || "—"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>

  


      <div className="grid grid-cols-4 gap-5 p-6 border-b">
        <div>
          <p className="text-xs text-gray-400">Incident ID</p>
          <p className="mt-1 font-medium">{incident.incidentId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Type</p>
          <p className="mt-1 font-medium">{incident.incidentType || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Started</p>
          <p className="mt-1 font-medium">{formatDateTime(incident.startedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Ended</p>
          <p className="mt-1 font-medium">{formatDateTime(incident.endedAt)}</p>
        </div>
      </div>

   
      <div className="p-6">
        {reportLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading AI report...</p>
        ) : report ? (
          <div className="relative bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-white/80 border border-blue-200/70 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">AI Root Cause Analysis</p>
            <p className="text-xs text-gray-400 mt-1">
              Model: {report.aiModelUsed || "N/A"} · Generated: {formatDateTime(report.generatedAt)}
            </p>

            <h3 className="text-lg font-semibold mt-4">Summary</h3>
            <p className="text-sm text-gray-700 mt-1">{report.summary || "No summary available."}</p>

            <h3 className="font-semibold mt-5">Root Cause</h3>
            <p className="text-sm text-gray-700 mt-1">{report.rootCause || "Analysis unavailable."}</p>

            <h3 className="font-semibold mt-5">Recommended Fix</h3>
            <p className="text-sm text-gray-700 mt-1">{report.recommendation || "No recommendation available."}</p>
          </div>
        ) : (
          <div className="text-sm text-gray-400 p-4 border border-dashed rounded-xl text-center">
            No AI report found for this incident.{" "}
            <a href="/analyze" className="text-blue-500 hover:underline">Analyze logs</a> to generate one.
          </div>
        )}
      </div>
    </section>
  );
}

function Overview() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [report, setReport] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
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
      setError("Unable to load incident data. Is the backend running at http://localhost:8081?");
    } finally {
      setLoading(false);
    }


  };

  useEffect(() => { fetchIncidents(); }, []);
  

  
  const openIncidentDetails = async (incidentId) => {
    try{
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
    active: incidents.filter((i) => ["ACTIVE", "INVESTIGATING", "OPEN"].includes(i.status?.toUpperCase())).length,
    resolved: incidents.filter((i) => i.status?.toUpperCase() === "RESOLVED").length,
    total: incidents.length,
  };






  const topIncident =
    incidents.find((i) => ["ACTIVE", "INVESTIGATING", "OPEN"].includes(i.status?.toUpperCase())) ||
    incidents[0];

  const filteredIncidents = incidents.filter((incident) => {
    const sev = incident.severity?.toUpperCase();
    const st = incident.status?.toUpperCase();
    const sevMatch = severityFilter === "All" || sev === severityFilter.toUpperCase();
    const stMatch = statusFilter === "All" || st === statusFilter.toUpperCase();
    return sevMatch && stMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-8 py-10">
          <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
        </main>
      </div>
    );
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8 relative">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-130-left-32 w-72 h-72 bg-indigo-300/15 rounded-full blur-3xl" />

      
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">Incident Overview</h2>
            <p className="text-gray-500 mt-1">Monitor your cloud infrastructure and analyze incidents</p>
          </div>
          <button
            onClick={fetchIncidents}
            className="bg-white/70 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-white transition shadow-sm"
          >
            Refresh
          </button>
        </div>



       
        {error && (
          <div className="mt-5 bg-red-50/80 backdrop-blur-md border border-red-200/80 text-red-600 px-4 py-3 rounded-xl text-sm shadow-sm">
            {error}
          </div>
        )}

      

        <div className="grid grid-cols-4 gap-5 mt-7">
          <StatCard title="Total Incidents" number={stats.total} subtitle="All recorded incidents" />
          <StatCard title="Critical Incidents" number={stats.critical} subtitle="Require immediate attention" />
          <StatCard title="Active Incidents" number={stats.active} subtitle="Currently being investigated" />
          <StatCard title="Resolved Incidents" number={stats.resolved} subtitle="Successfully resolved" />
        </div>

       


        {selectedIncident && (
          <IncidentDetailPanel
            incident={selectedIncident}
            report={report}
            reportLoading={reportLoading}
            onClose={() => { setSelectedIncident(null); setReport(null); }}
          />
        )}

       


        {!selectedIncident && (
          <section className="mt-7 bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Top Active Incident</h3>
                  <p className="text-sm text-gray-500 mt-1">Highest priority incident requiring attention</p>
                </div>
                {topIncident && (
                  <div className="flex gap-2">
                    <SeverityBadge severity={topIncident.severity} />
                    <StatusBadge status={topIncident.status} />
                  </div>
                )}
              </div>
            </div>

            {topIncident ? (
              <div className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{topIncident.title}</h2>
                    <p className="text-gray-500 mt-1 text-sm">{topIncident.incidentType || "—"}</p>
                  </div>
                  <button
                    onClick={() => openIncidentDetails(topIncident.incidentId)}
                    className="border border-blue-400/70 bg-blue-50/50 text-blue-600 px-4 py-2 rounded-xl h-fit hover:bg-blue-100/70 transition"
                  >
                    {detailsLoading ? "Loading..." : "View Details"}
                  </button>
                </div>
                <div className="grid grid-cols-4 mt-6 border-t pt-5">
                  <div><p className="text-xs text-gray-400">Incident ID</p><p className="mt-1">{topIncident.incidentId}</p></div>
                  <div><p className="text-xs text-gray-400">Type</p><p className="mt-1">{topIncident.incidentType || "N/A"}</p></div>
                  <div><p className="text-xs text-gray-400">Started</p><p className="mt-1">{formatDateTime(topIncident.startedAt)}</p></div>
                  <div><p className="text-xs text-gray-400">Ended</p><p className="mt-1">{formatDateTime(topIncident.endedAt)}</p></div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-gray-400">No active incidents.</div>
            )}
          </section>
        )}






        <section className="mt-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.07)] overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Recent Incidents</h3>
              <p className="text-sm text-gray-500 mt-1">Filter and inspect recent infrastructure incidents</p>
            </div>
            <div className="flex gap-3">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
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
                className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
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






          {filteredIncidents.length ? (
            <div className="divide-y">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.incidentId}
                  className="p-5 flex justify-between items-center hover:bg-blue-50/40 transition-colors"
                >
                  <div >
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{incident.incidentType || "Unknown type"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                    <button
                      onClick={() => openIncidentDetails(incident.incidentId)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-400">


              No incidents match the selected filters.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Overview;
