import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function MemberProfile() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMemberProfile = async () => {
    try {
      setLoading(true);

      const [memberRes, attendanceRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/members/${id}`),
        axios.get(`http://127.0.0.1:8000/api/attendance/member/${id}`),
      ]);

      setMember(memberRes.data.data || null);
      setAttendance(attendanceRes.data.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load member profile:", err);
      setError("Failed to load member profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberProfile();
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Member Profile</h2>

      {loading && <p>Loading member profile...</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && member && (
        <>
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>{member.name}</h3>
            <p><strong>Email:</strong> {member.email || "-"}</p>
            <p><strong>Phone:</strong> {member.phone || "-"}</p>
            <p><strong>Height:</strong> {member.height || "-"}</p>
            <p><strong>Weight:</strong> {member.weight || "-"}</p>
            <p><strong>Membership Type:</strong> {member.membership_type || "-"}</p>
            <p><strong>Membership Start:</strong> {formatDate(member.membership_start)}</p>
            <p><strong>Membership End:</strong> {formatDate(member.membership_end)}</p>
            <p><strong>Status:</strong> {member.status || "-"}</p>
            <p><strong>Payment Status:</strong> {member.payment_status || "-"}</p>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>Attendance History</h3>

            {attendance.length === 0 ? (
              <p>No attendance records found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
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
                      <th>Type</th>
                      <th>Confidence</th>
                      <th>Camera</th>
                      <th>Recognized At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
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
        </>
      )}
    </div>
  );
}