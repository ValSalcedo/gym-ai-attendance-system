import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  height: "",
  weight: "",
  membership_type: "Monthly",
  membership_start: "",
  membership_end: "",
  status: "active",
  payment_status: "paid",
};

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/members");
      setMembers(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    const payload = {
      ...form,
      height: form.height ? parseInt(form.height, 10) : null,
      weight: form.weight ? parseInt(form.weight, 10) : null,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/members/${editingId}`,
          payload
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/members", payload);
      }

      resetForm();
      fetchMembers();
    } catch (error) {
      console.error(
        editingId ? "Update member failed" : "Create member failed",
        error
      );

      if (error.response?.data?.errors) {
        console.log("Validation errors:", error.response.data.errors);
      }

      alert(editingId ? "Failed to update member." : "Failed to create member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      height: member.height || "",
      weight: member.weight || "",
      membership_type: member.membership_type || "Monthly",
      membership_start: member.membership_start || "",
      membership_end: member.membership_end || "",
      status: member.status || "active",
      payment_status: member.payment_status || "paid",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMember = async (id) => {
    const confirmDelete = window.confirm("Delete this member?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/members/${id}`);
      fetchMembers();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete member failed", error);
      alert("Failed to delete member.");
    }
  };

  const enrollFace = async (memberId) => {
  try {
    const res = await axios.post("http://127.0.0.1:5000/camera/enroll-multiple", {
      member_id: memberId,
      sample_count: 5,
    });

    if (res.data?.status === "error") {
      alert(res.data.message || "Face enrollment failed.");
      return;
    }

    alert(res.data?.message || "Face enrollment started.");
  } catch (error) {
    console.error("Enrollment failed:", error);
    alert(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Face enrollment failed."
    );
  }
};

  return (
    <div>
      <h2 className="page-title">Members</h2>

      <div className="card">
        <div className="section-heading">
          <div>
            <h3>{editingId ? "Edit Member" : "Add Member"}</h3>
            <p className="section-subtext">
              {editingId
                ? `Updating member #${editingId}`
                : "Create a new gym member profile."}
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div>
            <label className="form-label">Name</label>
            <input
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Phone</label>
            <input
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Membership Type</label>
            <select
              value={form.membership_type}
              onChange={(e) => handleChange("membership_type", e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="form-label">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 170"
              value={form.height}
              onChange={(e) => handleChange("height", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 65"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <div>
            <label className="form-label">Payment Status</label>
            <select
              value={form.payment_status}
              onChange={(e) => handleChange("payment_status", e.target.value)}
            >
              <option value="paid">paid</option>
              <option value="unpaid">unpaid</option>
              <option value="pending">pending</option>
            </select>
          </div>

          <div>
            <label className="form-label">Membership Start</label>
            <input
              type="date"
              value={form.membership_start}
              onChange={(e) => handleChange("membership_start", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Membership End</label>
            <input
              type="date"
              value={form.membership_end}
              onChange={(e) => handleChange("membership_end", e.target.value)}
            />
          </div>
        </div>

        <div className="action-row form-actions">
          <button
            className="button button-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? editingId
                ? "Updating..."
                : "Creating..."
              : editingId
              ? "Update Member"
              : "Create Member"}
          </button>

          {editingId && (
            <button className="button button-ghost" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <div>
            <h3>Member List</h3>
            <p className="section-subtext">Manage registered gym members.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Membership</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state-cell">
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.id}</td>
                    <td>{member.name}</td>
                    <td>{member.membership_type || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          member.status === "active"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {member.status || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {member.payment_status || "-"}
                      </span>
                    </td>
                    <td>{member.height || "-"}</td>
                    <td>{member.weight || "-"}</td>
                    <td>
                      <div className="action-row">
                        <button
                          className="button button-secondary"
                          onClick={() => navigate(`/members/${member.id}`)}
                        >
                          View
                        </button>

                        <button
                          className="button button-ghost"
                          onClick={() => handleEdit(member)}
                        >
                          Edit
                        </button>

                        <button
                          className="button button-secondary"
                          onClick={() => enrollFace(member.id)}
                        >
                          Enroll Face
                        </button>

                        <button
                          className="button button-danger"
                          onClick={() => deleteMember(member.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}