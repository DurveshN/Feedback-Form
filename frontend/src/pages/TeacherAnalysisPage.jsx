import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "../style/TeacherAnalysisPage.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TeacherAnalysisPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [analysis, setAnalysis] = useState({
    barCharts: { theory: [], practical: [] },
    questionReviews: [],
    overallReview: { review: "", improvement: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for chart export
  const theoryBarRef = useRef(null);
  const practicalBarRef = useRef(null);

  // Load Academic Years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/teacher-analysis/academic-years`,
          { headers: { Authorization: token } }
        );
        setAcademicYears(res.data.years || []);
      } catch (err) {
        setError("Failed to load academic years.");
        console.error(err);
      }
    };
    fetchYears();
  }, [token]);

  // Load Teachers when year changes
  useEffect(() => {
    if (!selectedYear) {
      setTeachers([]);
      setSelectedTeacher("");
      return;
    }
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/teacher-analysis/teachers`,
          {
            params: { academic_year: selectedYear },
            headers: { Authorization: token },
          }
        );
        setTeachers(res.data.teachers || []);
        setSelectedTeacher("");
      } catch (err) {
        setError("Failed to load teachers.");
        console.error(err);
      }
    };
    fetchTeachers();
  }, [selectedYear, token]);

  // Load Subjects when teacher changes
  useEffect(() => {
    if (!selectedTeacher || !selectedYear) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/teacher-analysis/subjects`,
          {
            params: { teacher_id: selectedTeacher, academic_year: selectedYear },
            headers: { Authorization: token },
          }
        );
        setSubjects(res.data.subjects || []);
        setSelectedSubject("");
      } catch (err) {
        setError("Failed to load subjects.");
        console.error(err);
      }
    };
    fetchSubjects();
  }, [selectedTeacher, selectedYear, token]);

  // Load Analysis Data when subject changes
  useEffect(() => {
    if (!selectedTeacher || !selectedYear || !selectedSubject) {
      setAnalysis({
        barCharts: { theory: [], practical: [] },
        questionReviews: [],
        overallReview: { review: "", improvement: "" },
      });
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/teacher-analysis/data`,
          {
            params: {
              teacher_id: selectedTeacher,
              academic_year: selectedYear,
              teacher_subject_id: selectedSubject,
            },
            headers: { Authorization: token },
          }
        );
        setAnalysis(res.data.data || {
          barCharts: { theory: [], practical: [] },
          questionReviews: [],
          overallReview: { review: "", improvement: "" },
        });
      } catch (err) {
        setError("Failed to load analysis data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [selectedTeacher, selectedYear, selectedSubject, token]);

  // Helper: Prepare data for bar chart
  const prepareBarDataset = (data) => ({
    labels: data.map((d) => d.question_text.split('.')[0] || d.question_text), // Use question number or text
    datasets: [
      {
        label: "Average Rating",
        data: data.map((d) => d.avg_rating),
        backgroundColor: "#3b82f6",
        borderColor: "#1d4ed8",
        borderWidth: 1,
      },
    ],
  });

  // Export chart as PNG
  const exportChart = (chartRef, type) => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement("a");
      a.href = url;
      a.download = `TeacherAnalysis_${type}_${selectedYear}.png`;
      a.click();
    }
  };

  // Render
  return (
    <div className="teacher-analysis-page">
      <header className="analysis-header">
        <h1>
          <FiBarChart2 className="header-icon" /> Individual Teacher Analysis
        </h1>
        <p>Select filters to view performance charts and reviews.</p>
      </header>

      <div className="analysis-container">
        {/* Filters */}
        <div className="analysis-card filter-card">
          <h2>Filters</h2>
          {error && (
            <div className="message-card error">
              <FiXCircle /> <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="academic-year">Academic Year</label>
            <select
              id="academic-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="teacher">Teacher</label>
            <select
              id="teacher"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              disabled={!selectedYear}
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teacher_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedTeacher}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.teacher_subject_id} value={s.teacher_subject_id}>
                  {s.subject_name} {s.semester ? `(Sem ${s.semester})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="analysis-card">
            <p className="loading-text">
              <FiLoader className="spinning" /> Loading analysis…
            </p>
          </div>
        )}

        {/* Charts & Reviews */}
        {!loading && (analysis.barCharts.theory.length > 0 || analysis.barCharts.practical.length > 0) && (
          <>
            {/* Theory Bar Chart */}
            {analysis.barCharts.theory.length > 0 && (
              <div className="analysis-card chart-card">
                <h2>
                  <FiBarChart2 /> Theory Questions - Average Ratings
                </h2>
                <div className="chart-container">
                  <Bar
                    ref={theoryBarRef}
                    data={prepareBarDataset(analysis.barCharts.theory)}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            title: (context) => analysis.barCharts.theory[context[0].dataIndex].question_text,
                          },
                        },
                      },
                      scales: {
                        y: { beginAtZero: true, max: 5, title: { display: true, text: "Average Rating" } },
                        x: { title: { display: true, text: "Question Number" } },
                      },
                    }}
                  />
                </div>
                <button
                  className="export-button"
                  onClick={() => exportChart(theoryBarRef, "Theory")}
                >
                  Export Chart
                </button>
              </div>
            )}

            {/* Practical Bar Chart */}
            {analysis.barCharts.practical.length > 0 && (
              <div className="analysis-card chart-card">
                <h2>
                  <FiBarChart2 /> Practical Questions - Average Ratings
                </h2>
                <div className="chart-container">
                  <Bar
                    ref={practicalBarRef}
                    data={prepareBarDataset(analysis.barCharts.practical)}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            title: (context) => analysis.barCharts.practical[context[0].dataIndex].question_text,
                          },
                        },
                      },
                      scales: {
                        y: { beginAtZero: true, max: 5, title: { display: true, text: "Average Rating" } },
                        x: { title: { display: true, text: "Question Number" } },
                      },
                    }}
                  />
                </div>
                <button
                  className="export-button"
                  onClick={() => exportChart(practicalBarRef, "Practical")}
                >
                  Export Chart
                </button>
              </div>
            )}

            {/* Question-wise Reviews */}
            {analysis.questionReviews.length > 0 && (
              <div className="analysis-card review-card">
                <h2>Question-wise Improvement Suggestions</h2>
                {analysis.questionReviews.map((rev, idx) => (
                  <div key={idx} className="review-item">
                    <p className="review-text">{rev.review}</p>
                    <p className="improvement-text">
                      <strong>Suggestion:</strong> {rev.improvement}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Overall Review */}
            <div className="analysis-card overall-review-card">
              <h2>Overall Performance Review</h2>
              <p className="review-text">{analysis.overallReview.review}</p>
              <p className="improvement-text">
                <strong>Improvement Recommendation:</strong> {analysis.overallReview.improvement}
              </p>
            </div>
          </>
        )}

        {/* No data message */}
        {!loading && selectedSubject && analysis.barCharts.theory.length === 0 && analysis.barCharts.practical.length === 0 && (
          <div className="analysis-card">
            <p>No feedback data available for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        className="back-button"
        onClick={() => navigate("/hod")}
        title="Return to dashboard"
      >
        <FiArrowLeft /> Back to Dashboard
      </button>
    </div>
  );
};

export default TeacherAnalysisPage;