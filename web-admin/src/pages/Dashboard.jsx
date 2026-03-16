import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRecognition, setLastRecognition] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, memberRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/attendance/logs"),
        axios.get("http://127.0.0.1:8000/api/members"),
      ]);

      const attendanceData = attendanceRes.data.data || [];
      const memberData = memberRes.data.data || [];

      setLogs(attendanceData);
      setMembers(memberData);

      const today = new Date().toDateString();

      const todayLogs = attendanceData.filter((log) => {
        if (!log.recognized_at) return false;
        return new Date(log.recognized_at).toDateString() === today;
      });

      setTodayCount(todayLogs.length);
      setError("");
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastRecognition = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/camera/recognize");
      setLastRecognition(res.data);
    } catch (err) {
      console.error("Failed to fetch recognition result:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchLastRecognition();

    const dashboardInterval = setInterval(fetchDashboardData, 3000);
    const recognitionInterval = setInterval(fetchLastRecognition, 5000);

    return () => {
      clearInterval(dashboardInterval);
      clearInterval(recognitionInterval);
    };
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: "20px",
            border: "1px solid #ffb3b3",
            backgroundColor: "#fff5f5",
            color: "#cc0000",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      <div className="card-grid">
        <div className="card">
          <h3>Total Members</h3>
          <p className="card-value">{members.length}</p>
        </div>

        <div className="card">
          <h3>Today Attendance</h3>
          <p className="card-value">{todayCount}</p>
        </div>

        <div className="card">
          <h3>Recent Logs</h3>
          <p className="card-value">{logs.length}</p>
        </div>

        <div className="card">
          <h3>CCTV Status</h3>
          <p className="card-value success">Online</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <h3>Last Recognition Result</h3>

        {!lastRecognition ? (
          <p>No recognition result yet.</p>
        ) : (
          <div>
            <p>
              <strong>Member:</strong>{" "}
              {lastRecognition.recognized?.member_id ?? "Unknown"}
            </p>
            <p>
              <strong>Confidence:</strong>{" "}
              {lastRecognition.recognized?.confidence ?? "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {lastRecognition.attendance_message || "No attendance action"}
            </p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <h3>Live CCTV Camera</h3>

        <img
          src="http://127.0.0.1:5000/camera/stream"
          alt="Live CCTV Stream"
          style={{
            width: "100%",
            maxWidth: "800px",
            borderRadius: "12px",
            border: "1px solid #ddd",
          }}
        />
      </div>

      <div className="card">
        <h3>Recent Attendance Logs</h3>

        {loading ? (
          <p>Loading dashboard data...</p>
        ) : logs.length === 0 ? (
          <p>No attendance logs yet.</p>
        ) : (
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
                {logs.slice(0, 5).map((log) => (
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
    </div>
  );
}