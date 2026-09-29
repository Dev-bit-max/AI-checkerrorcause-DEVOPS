import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err)
);

const unwrap = (res) => {
    if (res.data && res.data.data !== undefined) return res.data.data;
    return res.data;
};

// POST /api/analyze
export const analyzeLogs = async ({ logs, serviceId }) => {
    const res = await api.post("/api/analyze", { logs, serviceId });
    return unwrap(res);
};

// GET /api/incidents
export const getAllIncidents = async () => {
    const res = await api.get("/api/incidents");
    return unwrap(res);
};

// GET /api/incidents/{id}
export const getIncidentById = async (id) => {
    const res = await api.get(`/api/incidents/${id}`);
    return unwrap(res);
};

// GET /api/reports/{incidentId}
export const getReportByIncidentId = async (incidentId) => {
    const res = await api.get(`/api/reports/${incidentId}`);
    return unwrap(res);
};

// GET /api/logs
export const getAllLogs = async () => {
    const res = await api.get("/api/logs");
    return unwrap(res);
};

// DELETE /api/incidents
export const deleteAllIncidents = async () => {
    const res = await api.delete("/api/incidents");
    return unwrap(res);
};

export default api;
