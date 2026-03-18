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
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Settings</h2>

      {loading && <p>Loading settings...</p>}

      {!loading && (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            maxWidth: "700px",
          }}
        >
          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: "16px" }}>
              <label><strong>Camera URL</strong></label>
              <input
                type="text"
                value={settings.camera_url}
                onChange={(e) => handleChange("camera_url", e.target.value)}
                placeholder="rtsp:// or http://camera-url"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label><strong>Recognition Threshold</strong></label>
              <input
                type="number"
                value={settings.recognition_threshold}
                onChange={(e) =>
                  handleChange("recognition_threshold", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label><strong>Auto Refresh Interval (ms)</strong></label>
              <input
                type="number"
                value={settings.auto_refresh_interval}
                onChange={(e) =>
                  handleChange("auto_refresh_interval", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label><strong>Attendance Cooldown (minutes)</strong></label>
              <input
                type="number"
                value={settings.attendance_cooldown}
                onChange={(e) =>
                  handleChange("attendance_cooldown", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}