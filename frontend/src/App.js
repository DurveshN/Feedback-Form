// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import StudentFeedbackPage from "./pages/StudentFeedbackPage";
import TeacherPage from "./pages/TeacherPage";
import HodPage from "./pages/HodPage";
import HodSemesterControlPage from "./pages/HodSemesterControlPage";
import HodTeacherSubjectLinkPage from "./pages/HodTeacherSubjectLinkPage";
import HodGraphsPage from "./pages/HodGraphsPage";
import ThankYouPage from "./pages/ThankYouPage";
import HodStudentLoginPage from "./pages/HodStudentLoginPage";
import ManageSubjectsPage from "./pages/ManageSubjectsPage";
import ManageTeachersPage from "./pages/ManageTeachersPage";
import HodGenerateLoginPage from "./pages/HodGenerateLoginPage";
import HodFeedbackReportPage from "./pages/HodFeedbackReportPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌟 Common Pages */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />

        {/* 🌟 Student Routes */}
        <Route path="/student" element={<StudentFeedbackPage />} />

        {/* 🌟 Teacher Routes */}
        <Route path="/teacher" element={<TeacherPage />} />

        {/* 🌟 HOD Routes */}
        <Route path="/hod" element={<HodPage />} />
        <Route path="/hod/semester-control" element={<HodSemesterControlPage />} />
        <Route path="/hod/teacher-link" element={<HodTeacherSubjectLinkPage />} />
        <Route path="/hod/graphs" element={<HodGraphsPage />} />
        <Route path="/hod/student-login" element={<HodStudentLoginPage />} />
        <Route path="/hod/manage-subjects" element={<ManageSubjectsPage />} />
        <Route path="/hod/generate-login" element={<HodGenerateLoginPage />} />
        <Route path="/hod/manage-teachers" element={<ManageTeachersPage />} />
        <Route path="/hod/feedback-Report" element={<HodFeedbackReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
