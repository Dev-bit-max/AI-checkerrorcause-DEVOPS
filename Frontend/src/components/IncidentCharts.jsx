import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const SEVERITY_COLORS = {
  CRITICAL: "#DC2626",
  HIGH:     "#F97316",
  MEDIUM:   "#F59E0B",
  LOW:      "#10B981",
};

export default function IncidentCharts({ incidents = [] }) {
  if (!incidents || incidents.length === 0) {
    return null;
  }

  // 1. Prepare Severity Data
  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  incidents.forEach((inc) => {
    const s = inc.severity?.toUpperCase() || "LOW";
    if (severityCounts[s] !== undefined) {
      severityCounts[s]++;
    } else {
      severityCounts.LOW++;
    }
  });

  const severityData = [
    { name: "Critical", value: severityCounts.CRITICAL, color: SEVERITY_COLORS.CRITICAL },
    { name: "High",     value: severityCounts.HIGH,     color: SEVERITY_COLORS.HIGH },
    { name: "Medium",   value: severityCounts.MEDIUM,   color: SEVERITY_COLORS.MEDIUM },
    { name: "Low",      value: severityCounts.LOW,      color: SEVERITY_COLORS.LOW },
  ].filter((item) => item.value > 0);

  // 2. Prepare Type Data
  const typeMap = {};
  incidents.forEach((inc) => {
    const t = inc.incidentType || "System Alert";
    const label = t.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    typeMap[label] = (typeMap[label] || 0) + 1;
  });

  const typeData = Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
          <p className="font-semibold">{data.name || data.payload?.type}</p>
          <p className="text-slate-300 mt-0.5">{data.value} {data.value === 1 ? "Incident" : "Incidents"}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Severity Breakdown Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Severity Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Active and historical incidents by severity</p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {incidents.length} Total
          </span>
        </div>

        <div className="h-56 flex items-center justify-center">
          {severityData.length === 0 ? (
            <p className="text-xs text-slate-400">No severity data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          {[
            { label: "Critical", count: severityCounts.CRITICAL, color: "bg-red-600" },
            { label: "High",     count: severityCounts.HIGH,     color: "bg-orange-500" },
            { label: "Medium",   count: severityCounts.MEDIUM,   color: "bg-amber-500" },
            { label: "Low",      count: severityCounts.LOW,      color: "bg-emerald-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="font-medium text-slate-700">{item.label}:</span>
              <span className="text-slate-500">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Incidents by Type Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Incidents by Type</h3>
            <p className="text-xs text-slate-400 mt-0.5">Classification of alerts and failures</p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {typeData.length} Types
          </span>
        </div>

        <div className="h-56">
          {typeData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-slate-400">No type data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Highest alert category: <strong className="text-slate-700 font-semibold">{typeData[0]?.type || "N/A"}</strong></span>
          <span>{typeData[0]?.count || 0} incidents</span>
        </div>
      </div>
    </div>
  );
}
