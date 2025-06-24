import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiUsers, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../style/ManageTeachersPage.css";

const ManageTeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const parseToken = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        hod_id: payload.id,
        departmentId: payload.department_id,
      };
    } catch (err) {
      console.error("Invalid token", err);
      return {};
    }
  };

  const { departmentId } = parseToken();

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/teachers`, {
        headers: { Authorization: token },
      });
      setTeachers(res.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setMessage("Failed to fetch teachers.");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) {
      setMessage("Teacher name cannot be empty.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/teachers`,
        {
          name: newTeacherName,
          department_id: parseInt(departmentId),
        },
        { headers: { Authorization: token } }
      );
      setMessage("Teacher added successfully!");
      setNewTeacherName("");
      fetchTeachers();
    } catch (error) {
      console.error("Error adding teacher:", error);
      setMessage(error.response?.data?.message || "Failed to add teacher.");
    }
  };

  return (
    <div className="teachers-page">
      <header className="teachers-header">
        <h1>
          <FiUsers className="header-icon" /> Department Teacher Management
        </h1>
        <p>Manage teachers for your department</p>
      </header>

      <div className="teachers-container">
        <div className="teachers-card teachers-form-card">
          <h2>Add New Teacher</h2>
          {message && (
            <div className={`message-card ${message.includes("successfully") ? "success" : "error"}`}>
              {message.includes("successfully") ? <FiCheckCircle /> : <FiXCircle />}
              <p>{message}</p>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="teacher-name">Teacher Name</label>
            <input
              id="teacher-name"
              type="text"
              placeholder="Enter Teacher Name"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              title="Enter the teacher's full name"
            />
          </div>
          <button className="add-button" onClick={handleAddTeacher} title="Add new teacher">
            <FiUserPlus /> Add Teacher
          </button>
        </div>

        <div className="teachers-card teachers-list-card">
          <h2>Existing Teachers</h2>
          {teachers.length === 0 ? (
            <p className="no-data">No teachers found</p>
          ) : (
            <div className="teachers-table-wrapper">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="teachers-mobile-list">
                {teachers.map((t) => (
                  <div key={t.id} className="teacher-mobile-card">
                    <h3>{t.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="back-button" onClick={() => navigate("/hod")} title="Return to dashboard">
        Back to Dashboard
      </button>
    </div>
  );
};

export default ManageTeachersPage;