import { useEffect, useState } from "react";
import axios from "axios";

export default function Reports() {
  const [summary, setSummary] = useState({
    total_members: 0,
    active_members: 0,
    attendance_today: 0,
    recognition_logs_today: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [membersRes, attendanceRes, logsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/members"),
        axios.get("http://127.0.0.1:8000/api/attendance/logs"),
        axios.get("http://127.0.0.1:8000/api/recognition/logs"),
      ]);

      const members = membersRes.data.data || [];
      const attendance = attendanceRes.data.data || [];
      const logs = logsRes.data.data || [];

      const today = new Date().toISOString().split("T")[0];

      const attendanceToday = attendance.filter((item) => {
        if (!item.recognized_at) return false;
        return item.recognized_at.startsWith(today);
      });

      const recognitionLogsToday = logs.filter((item) => {
        if (!item.recognized_at) return false;
        return item.recognized_at.startsWith(today);
      });

      setSummary({
        total_members: members.length,
        active_members: members.filter(
          (m) => String(m.status).toLowerCase() === "active"
        ).length,
        attendance_today: attendanceToday.length,
        recognition_logs_today: recognitionLogsToday.length,
      });

      setRecentAttendance(attendance.slice(0, 5));
      setRecentLogs(logs.slice(0, 5));
      setError("");
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    minWidth: "220px",
    flex: "1",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Reports</h2>

      {loading && <p>Loading reports...</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={cardStyle}>
              <h4>Total Members</h4>
              <h2>{summary.total_members}</h2>
            </div>

            <div style={cardStyle}>
              <h4>Active Members</h4>
              <h2>{summary.active_members}</h2>
            </div>

            <div style={cardStyle}>
              <h4>Attendance Today</h4>
              <h2>{summary.attendance_today}</h2>
            </div>

            <div style={cardStyle}>
              <h4>Recognition Logs Today</h4>
              <h2>{summary.recognition_logs_today}</h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>Recent Attendance</h3>
              {recentAttendance.length === 0 ? (
                <p>No attendance records yet.</p>
              ) : (
                <table
                  width="100%"
                  border="1"
                  cellPadding="10"
                  cellSpacing="0"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Member</th>
                      <th>Recognized At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.member?.name || `Member #${item.member_id}`}</td>
                        <td>{formatDateTime(item.recognized_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>Recent Recognition Logs</h3>
              {recentLogs.length === 0 ? (
                <p>No recognition logs yet.</p>
              ) : (
                <table
                  width="100%"
                  border="1"
                  cellPadding="10"
                  cellSpacing="0"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Member</th>
                      <th>Confidence</th>
                      <th>Recognized At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.member?.name || `Member #${item.member_id}`}</td>
                        <td>
                          {item.confidence !== null && item.confidence !== undefined
                            ? Number(item.confidence).toFixed(1)
                            : "-"}
                        </td>
                        <td>{formatDateTime(item.recognized_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}