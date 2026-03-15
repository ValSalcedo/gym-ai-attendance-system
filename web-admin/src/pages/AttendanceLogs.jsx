import { useEffect, useState } from "react";
import axios from "axios";

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/attendance/logs");
      setLogs(res.data.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch attendance logs:", err);
      setError("Failed to load attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Attendance Logs</h2>

      {loading && <p>Loading attendance logs...</p>}

      {!loading && error && (
        <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>
      )}

      {!loading && !error && logs.length === 0 && (
        <p>No attendance logs found yet.</p>
      )}

      {!loading && !error && logs.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            width="100%"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Type</th>
                <th>Confidence</th>
                <th>Camera</th>
                <th>Recognized At</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.member?.name || `Member #${log.member_id}`}</td>
                  <td>{log.type || "-"}</td>
                  <td>
                    {log.confidence !== null && log.confidence !== undefined
                      ? Number(log.confidence).toFixed(1)
                      : "-"}
                  </td>
                  <td>{log.camera_name || "-"}</td>
                  <td>{formatDateTime(log.recognized_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}