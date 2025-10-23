// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import ProtectedRoute from './components/ProtectedRoute';
import TeacherAnalysisPage from "./pages/TeacherAnalysisPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />

        {/* 🌟 HOD Routes */}
        <Route path="/hod" element={
          <ProtectedRoute allowedRole="hod">
            <HodPage />
          </ProtectedRoute>
        } />
        <Route path="/hod/*" element={
          <ProtectedRoute allowedRole="hod">
            <Routes>
              <Route path="graphs" element={<HodGraphsPage />} />
              <Route path="semester-control" element={<HodSemesterControlPage />} />
              <Route path="teacher-link" element={<HodTeacherSubjectLinkPage />} />
              <Route path="manage-subjects" element={<ManageSubjectsPage />} />
              <Route path="generate-login" element={<HodGenerateLoginPage />} />
              <Route path="manage-teachers" element={<ManageTeachersPage />} />
              <Route path="feedback-Report" element={<HodFeedbackReportPage />} />
              <Route path="teacher-analysis" element={<TeacherAnalysisPage />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* 🌟 Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <StudentFeedbackPage />
          </ProtectedRoute>
        } />
        <Route path="/student/*" element={
          <ProtectedRoute allowedRole="student">
            <Routes>
              {/* Add student sub-routes here */}
            </Routes>
          </ProtectedRoute>
        } />

        {/* 🌟 Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/*" element={
          <ProtectedRoute allowedRole="teacher">
            <Routes>
              {/* Add teacher sub-routes here */}
            </Routes>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
