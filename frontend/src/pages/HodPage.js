import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/HodPage.css";

const HodPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="hod-dashboard">
      <h1 className="hod-title">Welcome, HOD!</h1>

      <div className="hod-buttons">

        <button onClick={() => handleNavigate("/hod/graphs")} className="hod-btn">
          📊 View Feedback Analysis (Graphs)
        </button>

        <button onClick={() => handleNavigate("/hod/semester-control")} className="hod-btn">
          🕐 Semester Control & Feedback Toggle
        </button>

        <button onClick={() => handleNavigate("/hod/teacher-link")} className="hod-btn">
          🔗 Manage Teacher-Subject Linking
        </button>

        {/* <button onClick={() => handleNavigate("/hod/student-login")} className="hod-btn">
          🧑‍🎓 Manage Student Login Credentials
        </button> */}

        <button onClick={() => handleNavigate("/hod/manage-subjects")} className="hod-btn">
          📚 Manage Subjects
        </button>

        <button onClick={() => handleNavigate("/hod/generate-login")} className="hod-btn">
          🔐 Generate Student Logins (PDF)
        </button>
        
        <button onClick={() => handleNavigate("/hod/manage-teachers")} className="hod-btn">
          👩‍🏫 Manage Teachers
        </button>

        <button onClick={() => handleNavigate("/hod/feedback-Report")} className="hod-btn">
          👩‍🏫 Manage Feedback
        </button>
      </div>
    </div>
  );
};

export default HodPage;

