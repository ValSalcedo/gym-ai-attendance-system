import { useEffect, useState } from "react";
import axios from "axios";

export default function Settings() {
  const [settings, setSettings] = useState({
    camera_url: "",
    recognition_threshold: "70",
    auto_refresh_interval: "3000",
    attendance_cooldown: "10",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/settings");

      setSettings({
        camera_url: res.data.data?.camera_url || "",
        recognition_threshold: res.data.data?.recognition_threshold || "70",
        auto_refresh_interval: res.data.data?.auto_refresh_interval || "3000",
        attendance_cooldown: res.data.data?.attendance_cooldown || "10",
      });

      setError("");
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await axios.post("http://127.0.0.1:8000/api/settings", settings);

      setMessage("Settings saved successfully.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Settings</h2>

      {loading ? (
        <div className="card">
          <p>Loading settings...</p>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: "720px" }}>
          <div className="message-stack">
            {message && <div className="badge badge-success">{message}</div>}
            {error && <div className="badge badge-danger">{error}</div>}
          </div>

          <form onSubmit={handleSave} className="form-grid single-column">
            <div>
              <label className="form-label">Camera URL</label>
              <input
                type="text"
                value={settings.camera_url}
                onChange={(e) => handleChange("camera_url", e.target.value)}
                placeholder="rtsp:// or http://camera-url"
              />
            </div>

            <div>
              <label className="form-label">Recognition Threshold</label>
              <input
                type="number"
                value={settings.recognition_threshold}
                onChange={(e) =>
                  handleChange("recognition_threshold", e.target.value)
                }
              />
            </div>

            <div>
              <label className="form-label">Auto Refresh Interval (ms)</label>
              <input
                type="number"
                value={settings.auto_refresh_interval}
                onChange={(e) =>
                  handleChange("auto_refresh_interval", e.target.value)
                }
              />
            </div>

            <div>
              <label className="form-label">
                Attendance Cooldown (minutes)
              </label>
              <input
                type="number"
                value={settings.attendance_cooldown}
                onChange={(e) =>
                  handleChange("attendance_cooldown", e.target.value)
                }
              />
            </div>

            <div style={{ marginTop: "8px" }}>
              <button
                type="submit"
                disabled={saving}
                className="button button-primary"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}