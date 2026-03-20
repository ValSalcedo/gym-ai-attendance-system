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

  const recentLogs = logs.slice(0, 5);

  const recognizedMemberId = lastRecognition?.recognized?.member_id;
  const recognizedMember = members.find(
    (member) => String(member.id) === String(recognizedMemberId)
  );

  const recognitionConfidence =
    lastRecognition?.recognized?.confidence !== null &&
    lastRecognition?.recognized?.confidence !== undefined
      ? Number(lastRecognition.recognized.confidence).toFixed(2)
      : "-";

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {error && (
        <div className="card">
          <div className="badge badge-danger">{error}</div>
        </div>
      )}

      <div className="card-grid">
        <div className="card">
          <p className="form-label">Total Members</p>
          <p className="card-value">{members.length}</p>
        </div>

        <div className="card">
          <p className="form-label">Today Attendance</p>
          <p className="card-value">{todayCount}</p>
        </div>

        <div className="card">
          <p className="form-label">Recent Logs</p>
          <p className="card-value">{logs.length}</p>
        </div>

        <div className="card">
          <p className="form-label">CCTV Status</p>
          <p className="card-value success">Online</p>
        </div>
      </div>

      <div className="dashboard-split">
        <div className="card">
          <h3>Live CCTV Camera</h3>
          <div className="camera-feed">
            <img
              src="http://127.0.0.1:5000/camera/stream"
              alt="Live CCTV Stream"
            />
          </div>
        </div>

        <div className="card">
          <h3>Last Recognition Result</h3>

          {!lastRecognition ? (
            <p>No recognition result yet.</p>
          ) : (
            <div className="recognition-stack">
              <div>
                <p className="form-label">Member</p>
                <p>{recognizedMember?.name || `Member #${recognizedMemberId || "Unknown"}`}</p>
              </div>

              <div>
                <p className="form-label">Confidence</p>
                <p>{recognitionConfidence}</p>
              </div>

              <div>
                <p className="form-label">Status</p>
                <p>{lastRecognition.attendance_message || "No attendance action"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Recent Attendance Logs</h3>

        {loading ? (
          <p>Loading dashboard data...</p>
        ) : recentLogs.length === 0 ? (
          <p>No attendance logs yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
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
                {recentLogs.map((log) => (
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