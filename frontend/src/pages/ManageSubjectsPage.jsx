import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiBook, FiPlus, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../style/ManageSubjectsPage.css";

const HodSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("theory");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/hod/subjects`, {
        headers: { Authorization: token },
      });
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error("Error fetching subjects", err);
      setMessage("Failed to fetch subjects.");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setMessage("Subject name cannot be empty");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/hod/subjects`,
        { name, type },
        { headers: { Authorization: token } }
      );
      setMessage("Subject added successfully!");
      setName("");
      setType("theory");
      fetchSubjects();
    } catch (err) {
      console.error("Error adding subject", err);
      setMessage(err.response?.data?.message || "Failed to add subject.");
    }
  };

  return (
    <div className="subjects-page">
      <header className="subjects-header">
        <h1>
          <FiBook className="header-icon" /> Department Subject Management
        </h1>
        <p>Manage theory and practical subjects for your department</p>
      </header>

      <div className="subjects-container">
        <div className="subjects-card subjects-form-card">
          <h2>Add New Subject</h2>
          <div className="form-group">
            <label htmlFor="subject-name">Subject Name</label>
            <input
              id="subject-name"
              type="text"
              placeholder="Subject Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              title="Enter a unique subject name (e.g., Data Structures Lab)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject-type">Subject Type</label>
            <select
              id="subject-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              title="Select whether the subject is theory or practical"
            >
              <option value="theory">Theory</option>
              <option value="practical">Practical</option>
            </select>
          </div>
          <button className="add-button" onClick={handleSubmit}>
            <FiPlus /> Add Subject
          </button>
        </div>

        {message && (
          <div className={`subjects-card message-card ${message.includes("successfully") ? "success" : "error"}`}>
            {message.includes("successfully") ? <FiCheckCircle /> : <FiXCircle />}
            <p>{message}</p>
          </div>
        )}

        <div className="subjects-card subjects-list-card">
          <h2>Existing Subjects</h2>
          {subjects.length === 0 ? (
            <p className="no-data">No subjects found</p>
          ) : (
            <div className="subjects-table-wrapper">
              <table className="subjects-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subj) => (
                    <tr key={subj.id}>
                      <td>{subj.name}</td>
                      <td>{subj.type.charAt(0).toUpperCase() + subj.type.slice(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="subjects-mobile-list">
                {subjects.map((subj) => (
                  <div key={subj.id} className="subject-mobile-card">
                    <h3>{subj.name}</h3>
                    <p>Type: {subj.type.charAt(0).toUpperCase() + subj.type.slice(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="back-button" onClick={() => navigate("/hod")}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default HodSubjectsPage;