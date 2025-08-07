import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiKey, FiCheckCircle, FiXCircle, FiTrash2, FiDownload } from "react-icons/fi";
import "../style/HodGenerateLoginPage.css";

const HodGenerateLoginPage = () => {
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [count, setCount] = useState(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const generateAcademicYears = () => {
    const start = 2024;
    const end = new Date().getFullYear() + 4;
    const years = [];
    for (let y = start; y <= end; y++) {
      years.push(`${y}-${y + 1}`);
    }
    return years;
  };

  const handleGeneratePDF = async () => {
    if (!academicYear || !semester || !year || !count) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/student-login/generate-pdf`,
        { academic_year: academicYear, semester, year, count },
        {
          headers: { Authorization: token },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `student_logins_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("PDF generated and downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF", err);
      setMessage("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsed = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/student-login/delete-login`, {
        headers: { Authorization: token },
      });
      setMessage("All used logins deleted successfully.");
    } catch (err) {
      console.error("Error deleting used logins", err);
      setMessage("Failed to delete used logins.");
    }
  };

  return (
    <div className="generate-login-page">
      <header className="generate-login-header">
        <h1>
          <FiKey className="header-icon" /> Generate Student Login Credentials
        </h1>
        <p>Create and manage student login credentials for your department</p>
      </header>

      <div className="generate-login-container">
        <div className="generate-login-card generate-login-form-card">
          <h2>Generate Login Credentials</h2>
          {message && (
            <div className={`message-card ${message.includes("successfully") ? "success" : "error"}`}>
              {message.includes("successfully") ? <FiCheckCircle /> : <FiXCircle />}
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
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              title="Select the semester"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="year">Student Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              title="Select the student year"
            >
              <option value="">Select Student Year</option>
              <option value="2">2nd Year (SE)</option>
              <option value="3">3rd Year (TE)</option>
              <option value="4">4th Year (BE)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="count">Number of Credentials</label>
            <input
              id="count"
              type="number"
              placeholder="Number of Credentials"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min={1}
              title="Enter the number of credentials to generate"
            />
          </div>
          <button
            className="add-button"
            onClick={handleGeneratePDF}
            disabled={loading}
            title="Generate and download PDF with login credentials"
          >
            {loading ? <FiDownload className="spinning" /> : <FiDownload />}
            {loading ? "Generating..." : "Generate & Download PDF"}
          </button>
          <button
            className="danger-button"
            onClick={handleDeleteUsed}
            title="Delete all login credentials"
          >
            <FiTrash2 /> Delete All Logins
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

export default HodGenerateLoginPage;