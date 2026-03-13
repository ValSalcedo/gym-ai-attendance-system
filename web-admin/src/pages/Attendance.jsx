export default function Attendance() {
  return (
    <div>
      <h2 className="page-title">Attendance</h2>

      <div className="card-grid">
        <div className="card">
          <h3>CCTV Camera Feed</h3>
          <p>Live Python OpenCV camera stream will appear here.</p>

          <div className="camera-feed" style={{ marginTop: "16px" }}>
            <img
              src="http://127.0.0.1:5000/camera/stream"
              alt="Live Camera"
              style={{
                width: "100%",
                borderRadius: "12px",
                display: "block"
              }}
            />
          </div>
        </div>

        <div className="card">
          <h3>Recognized Member</h3>
          <p>Name: Juan Dela Cruz</p>
          <p>Membership: Active</p>
          <p>Time In: 5:21 PM</p>
        </div>

        <div className="card">
          <h3>Validation Status</h3>
          <p className="card-value success">Recognized</p>
        </div>

        <div className="card">
          <h3>Camera Status</h3>
          <p className="card-value success">Online</p>
        </div>
      </div>

      <div className="card">
        <h3>Attendance Logs</h3>
        <p>
          This section will display auto-attendance data from CCTV face recognition,
          including member name, timestamp, membership status, and workout validation.
        </p>
      </div>
    </div>
  );
}