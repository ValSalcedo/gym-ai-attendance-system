export default function Dashboard() {
  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      <div className="card-grid">
        <div className="card">
          <h3>Total Members</h3>
          <p className="card-value">248</p>
        </div>

        <div className="card">
          <h3>Today Attendance</h3>
          <p className="card-value">91</p>
        </div>

        <div className="card">
          <h3>Active Plans</h3>
          <p className="card-value">173</p>
        </div>

        <div className="card">
          <h3>CCTV Status</h3>
          <p className="card-value success">Online</p>
        </div>
      </div>

      <div className="card">
        <h3>System Overview</h3>
        <p>
          This dashboard will show member analytics, payments, schedules, and
          real-time face recognition attendance logs.
        </p>
      </div>
    </div>
  );
}