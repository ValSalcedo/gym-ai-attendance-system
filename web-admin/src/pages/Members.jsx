import { useEffect, useState } from "react";
import axios from "axios";

export default function Members() {

  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
    membership_type: "Monthly",
    membership_start: "",
    membership_end: "",
    status: "active",
    payment_status: "paid"
  });

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/members");
      setMembers(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const createMember = async () => {
    if (!form.name) return alert("Name is required");

    try {
      await axios.post("http://127.0.0.1:8000/api/members", form);

      setForm({
        name: "",
        email: "",
        phone: "",
        height: "",
        weight: "",
        membership_type: "Monthly",
        membership_start: "",
        membership_end: "",
        status: "active",
        payment_status: "paid"
      });

      fetchMembers();

    } catch (error) {
      console.error("Create member failed", error);
    }
  };

    const deleteMember = async (id) => {

    const confirmDelete = window.confirm("Delete this member?");
    if (!confirmDelete) return;

    try {

      await axios.delete(`http://127.0.0.1:8000/api/members/${id}`);

      fetchMembers();

    } catch (error) {

      console.error("Delete member failed", error);

    }

  };

  const enrollFace = async (memberId) => {
    try {
      await axios.post("http://127.0.0.1:5000/camera/enroll-multiple", {
        member_id: memberId,
        sample_count: 5
      });

      alert("Face enrollment started. Please look at the camera.");

    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div>

      <h2 className="page-title">Members</h2>

      <div className="card">

        <h3>Add Member</h3>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e)=>handleChange("name", e.target.value)}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e)=>handleChange("email", e.target.value)}
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e)=>handleChange("phone", e.target.value)}
        />

        <input
          placeholder="Height (cm)"
          value={form.height}
          onChange={(e)=>handleChange("height", e.target.value)}
        />

        <input
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={(e)=>handleChange("weight", e.target.value)}
        />

        <select
          value={form.membership_type}
          onChange={(e)=>handleChange("membership_type", e.target.value)}
        >
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Annual</option>
        </select>

        <label>Membership Start</label>
        <input
          type="date"
          value={form.membership_start}
          onChange={(e)=>handleChange("membership_start", e.target.value)}
        />

        <label>Membership End</label>
        <input
          type="date"
          value={form.membership_end}
          onChange={(e)=>handleChange("membership_end", e.target.value)}
        />

        <button onClick={createMember}>
          Create Member
        </button>

      </div>


      <div className="card">

        <h3>Member List</h3>

        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Membership</th>
              <th>Status</th>
              <th>Enroll Face</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {members.map(member => (

              <tr key={member.id}>

                <td>{member.id}</td>
                <td>{member.name}</td>

                <td>{member.height || "-"}</td>

                <td>{member.weight || "-"}</td>

                <td>{member.membership_type || "-"}</td>

                <td>
                  {member.status === "active"
                    ? "🟢 Active"
                    : "🔴 Inactive"}
                </td>

                <td>
                  <button onClick={()=>enrollFace(member.id)}>
                    Enroll Face
                  </button>
                </td>

                <td>
                  <button
                    style={{ background: "#ff4d4d", color: "white", marginLeft: "8px" }}
                    onClick={() => deleteMember(member.id)}
                  >
                    Delete
                  </button>
                </td>

              </tr>

            ))}

          </tbody>
        </table>

      </div>

    </div>
  );
}