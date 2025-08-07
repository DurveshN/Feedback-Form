import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/HodPage.css";

const HodPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    // Replace the current history state instead of pushing a new one
    navigate("/", { replace: true });
  };

  return (
    <div className="hod-dashboard">
      <div className="hod-header">
        <div className="header-space"></div>
        <h1 className="hod-title">Welcome, HOD!</h1>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>

      <div className="dashboard-guide">
        <h2 className="guide-title">
          <span className="guide-icon">📋</span>
          Getting Started Guide
        </h2>
        <div className="guide-cards">
          <div className="guide-card">
            <div className="step-number">1</div>
            <div className="step-icon">👥</div>
            <h4>Initial Setup</h4>
            <p>Set up your department by managing teachers and subjects in the system</p>
          </div>
          <div className="guide-card">
            <div className="step-number">2</div>
            <div className="step-icon">🔗</div>
            <h4>Link Resources</h4>
            <p>Connect teachers with their respective subjects for the semester</p>
          </div>
          <div className="guide-card">
            <div className="step-number">3</div>
            <div className="step-icon">📅</div>
            <h4>Configure Semester</h4>
            <p>Set the current semester and academic year for feedback collection</p>
          </div>
          <div className="guide-card">
            <div className="step-number">4</div>
            <div className="step-icon">🔑</div>
            <h4>Student Access</h4>
            <p>Generate student login credentials and after taking all feedback, delete old logins</p>
          </div>
          <div className="guide-card">
            <div className="step-number">5</div>
            <div className="step-icon">📊</div>
            <h4>View Results</h4>
            <p>Access and analyze the collected feedback data</p>
          </div>
        </div>
      </div>

      <div className="workflow-sections">
        <div className="workflow-card">
          <div className="workflow-header">
            <span className="section-icon">🎯</span>
            <h3>Initial Setup</h3>
          </div>
          <div className="workflow-content">
            <button onClick={() => handleNavigate("/hod/manage-teachers")} className="workflow-btn">
              <span className="btn-icon">👩‍🏫</span>
              <div className="btn-content">
                <span className="btn-title">Manage Teachers</span>
                <span className="btn-description">Add or modify teacher profiles</span>
              </div>
            </button>
            <button onClick={() => handleNavigate("/hod/manage-subjects")} className="workflow-btn">
              <span className="btn-icon">📚</span>
              <div className="btn-content">
                <span className="btn-title">Manage Subjects</span>
                <span className="btn-description">Configure department subjects</span>
              </div>
            </button>
            <button onClick={() => handleNavigate("/hod/teacher-link")} className="workflow-btn">
              <span className="btn-icon">🔗</span>
              <div className="btn-content">
                <span className="btn-title">Teacher-Subject Linking</span>
                <span className="btn-description">Connect teachers to subjects</span>
              </div>
            </button>
          </div>
        </div>

        <div className="workflow-card">
          <div className="workflow-header">
            <span className="section-icon">⚙️</span>
            <h3>Feedback Management</h3>
          </div>
          <div className="workflow-content">
            <button onClick={() => handleNavigate("/hod/semester-control")} className="workflow-btn">
              <span className="btn-icon">🕐</span>
              <div className="btn-content">
                <span className="btn-title">Semester Control</span>
                <span className="btn-description">Set active semester period</span>
              </div>
            </button>
            <button onClick={() => handleNavigate("/hod/generate-login")} className="workflow-btn">
              <span className="btn-icon">🔐</span>
              <div className="btn-content">
                <span className="btn-title">Generate Student Logins</span>
                <span className="btn-description">Create student access credentials</span>
              </div>
            </button>
          </div>
        </div>

        <div className="workflow-card">
          <div className="workflow-header">
            <span className="section-icon">📈</span>
            <h3>Reports & Analysis</h3>
          </div>
          <div className="workflow-content">
            <button onClick={() => handleNavigate("/hod/feedback-Report")} className="workflow-btn">
              <span className="btn-icon">📥</span>
              <div className="btn-content">
                <span className="btn-title">Download Feedback</span>
                <span className="btn-description">Export feedback reports</span>
              </div>
            </button>
            <button onClick={() => handleNavigate("/hod/graphs")} className="workflow-btn">
              <span className="btn-icon">📊</span>
              <div className="btn-content">
                <span className="btn-title">View Feedback Analysis</span>
                <span className="btn-description">Analyze feedback data</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodPage;