import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../style/HodSemesterControlPage.css";

const HodSemesterControlPage = () => {
  const [newSemester, setNewSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const parseToken = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        hod_id: payload.id,
        department_id: payload.department_id,
      };
    } catch (err) {
      console.error("Invalid token", err);
      return {};
    }
  };

  const { hod_id, department_id } = parseToken();

  const generateAcademicYears = () => {
    const years = [];
    const start = 2024;
    const current = new Date().getFullYear();

    for (let i = 0; i < 15; i++) {
      const y1 = start + i;
      const y2 = y1 + 1;
      years.push(`${y1}-${y2}`);
    }

    return years;
  };

  const updateSemester = async () => {
    if (!newSemester || !academicYear) {
      setMessage("Please select both semester and academic year.");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/semester/update`,
        {
          new_semester: parseInt(newSemester),
          academic_year: academicYear,
          department_id,
          hod_id,
        },
        { headers: { Authorization: token } }
      );
      setMessage("Semester & Academic Year updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update semester or academic year.");
    }
  };

  return (
    <div className="semester-control-page">
      <header className="semester-header">
        <h1>
          <FiCalendar className="header-icon" /> Semester Control
        </h1>
        <p>Manage semester settings for your department</p>
      </header>

      <div className="semester-container">
        <div className="semester-card semester-form-card">
          <h2>Update Semester & Academic Year</h2>
          {message && (
            <div className={`message-card ${message.includes("successfully") || message.includes("updated") ? "success" : "error"}`}>
              {message.includes("successfully") || message.includes("updated") ? <FiCheckCircle /> : <FiXCircle />}
              <p>{message}</p>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="academic-year">Academic Year</label>
            <select
              id="academic-year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              title="Select the academic year"
            >
              <option value="">Select Academic Year</option>
              {generateAcademicYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              value={newSemester}
              onChange={(e) => setNewSemester(e.target.value)}
              title="Select the semester"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <button
            className="add-button"
            onClick={updateSemester}
            title="Update semester and academic year"
          >
            <FiCalendar /> Update Semester
          </button>
        </div>
      </div>

      <button
        className="back-button"
        onClick={() => navigate("/hod")}
        title="Return to dashboard"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default HodSemesterControlPage;