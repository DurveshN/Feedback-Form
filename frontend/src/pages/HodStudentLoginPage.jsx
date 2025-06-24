import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/HodStudentLoginPage.css"; // New clean CSS

const HodStudentLoginPage = () => {
  const [students, setStudents] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/student-login/list`, {
        headers: { Authorization: token }
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  const handleSubmit = async () => {
    if (!username || !password || !year) {
      alert("Please fill all fields!");
      return;
    }

    try {
      if (editId) {
        // Update Mode
        await axios.put(`${process.env.REACT_APP_API_BASE}/api/student-login/update/${editId}`, {
          username, password, year: parseInt(year)
        }, {
          headers: { Authorization: token }
        });
        setMessage("✅ Student updated successfully!");
      } else {
        // Add Mode
        await axios.post(`${process.env.REACT_APP_API_BASE}/api/student-login/add`, {
          username, password, year: parseInt(year)
        }, {
          headers: { Authorization: token }
        });
        setMessage("✅ Student added successfully!");
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error("Error saving student", err);
      setMessage("❌ Failed to save student.");
    }
  };

  const handleEdit = (student) => {
    setUsername(student.username);
    setPassword(student.password);
    setYear(student.year);
    setEditId(student.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student login?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/student-login/delete/${id}`, {
        headers: { Authorization: token }
      });
      setMessage("✅ Student deleted successfully!");
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student", err);
      setMessage("❌ Failed to delete student.");
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setYear("");
    setEditId(null);
  };

  return (
    <div className="student-login-dashboard">
      <h1 className="student-login-title">Manage Student Logins</h1>

      <div className="student-login-form">
        <h3>{editId ? "✏️ Update Student Login" : "➕ Add New Student Login"}</h3>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">-- Select Year --</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>

        <button className="student-login-btn" onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {message && <p className="student-login-message">{message}</p>}

      <h3>📋 Existing Student Logins</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="student-login-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="4">No Students Found</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.username}</td>
                  <td>{student.password}</td>
                  <td>{student.year}</td>
                  <td>
                    <button onClick={() => handleEdit(student)} className="edit-btn">✏️ Edit</button>
                    <button onClick={() => handleDelete(student.id)} className="delete-btn">❌ Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        className="student-login-btn"
        style={{ marginTop: "30px" }}
        onClick={() => navigate("/hod")}
      >
        🔙 Back to Dashboard
      </button>
    </div>
  );
};

export default HodStudentLoginPage;
