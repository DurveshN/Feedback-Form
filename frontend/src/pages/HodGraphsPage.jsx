import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBarChart2, FiPieChart, FiXCircle } from "react-icons/fi";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "../style/HodGraphsPage.css";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const HodGraphsPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [semester, setSemester] = useState("1");
  const [pieData, setPieData] = useState({ theory: [], practical: [] });
  const [barData, setBarData] = useState({ theory: [], practical: [] });
  const [loading, setLoading] = useState(false);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [error, setError] = useState("");

  const theoryPieRef = useRef();
  const practicalPieRef = useRef();
  const theoryBarRef = useRef();
  const practicalBarRef = useRef();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/analytics/years`, {
          headers: { Authorization: token },
        });
        console.log("Fetched academic years:", res.data); // Debug log
        setAcademicYears(res.data.years || []);
      } catch (err) {
        console.error("Failed to fetch years:", err);
        setError("Failed to load academic years.");
      }
    };
    fetchYears();
  }, [token]);

  useEffect(() => {
    if (academicYear && studentYear && semester) {
      fetchPieData();
      fetchBarData();
      fetchTotalFeedback();
    }
  }, [academicYear, studentYear, semester]);

  const fetchPieData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/analytics/pie`, {
        params: { academic_year: academicYear, student_year: studentYear, semester },
        headers: { Authorization: token },
      });
      setPieData(res.data.data || { theory: [], practical: [] });
    } catch (err) {
      console.error("Failed to fetch pie data:", err);
      setError("Failed to load pie chart data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBarData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/analytics/bar`, {
        params: { academic_year: academicYear, student_year: studentYear },
        headers: { Authorization: token },
      });
      setBarData(res.data.data || { theory: [], practical: [] });
    } catch (err) {
      console.error("Failed to fetch bar data:", err);
      setError("Failed to load bar chart data.");
    }
  };

  const fetchTotalFeedback = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/analytics/department-feedback-count`, {
        params: { academic_year: academicYear, student_year: studentYear, semester },
        headers: { Authorization: token },
      });
      setTotalFeedback(res.data.total_feedback || 0);
    } catch (err) {
      console.error("Failed to fetch total feedback count:", err);
      setError("Failed to load feedback count.");
    }
  };

  const preparePieDataset = (data) => ({
    labels: data.map((d) => d.teacher_name),
    datasets: [{
      data: data.map((d) => d.avg_rating),
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0", "#00BCD4"
      ],
      borderWidth: 2,
      hoverOffset: 20,
    }],
  });

  const prepareBarDataset = (data) => {
    const semester1 = data.filter(d => d.semester === 1);
    const semester2 = data.filter(d => d.semester === 2);
    const teachers = [...new Set([...semester1.map(d => d.teacher_name), ...semester2.map(d => d.teacher_name)])];

    return {
      labels: teachers,
      datasets: [
        {
          label: "Semester 1",
          data: teachers.map(t => {
            const d = semester1.find(d => d.teacher_name === t);
            return d ? d.avg_rating : 0;
          }),
          backgroundColor: "#42A5F5",
        },
        {
          label: "Semester 2",
          data: teachers.map(t => {
            const d = semester2.find(d => d.teacher_name === t);
            return d ? d.avg_rating : 0;
          }),
          backgroundColor: "#66BB6A",
        },
      ],
    };
  };

  const exportChart = (chartRef, name) => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.png`;
      a.click();
    }
  };

  return (
    <div className="graphs-page">
      <header className="graphs-header">
        <h1>
          <FiBarChart2 className="header-icon" /> Department Feedback Analytics
        </h1>
        <p>Visualize feedback data for theory and practical subjects</p>
      </header>

      <div className="graphs-container">
        <div className="graphs-card filter-card">
          <h2>Filter Options</h2>
          {error && (
            <div className="message-card error">
              <FiXCircle /> <p>{error}</p>
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
              {academicYears.length > 0 ? (
                academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option disabled>No academic years available</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="student-year">Student Year</label>
            <select
              id="student-year"
              value={studentYear}
              onChange={(e) => setStudentYear(e.target.value)}
              title="Select the student year"
            >
              <option value="">Select Student Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
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
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        {academicYear && studentYear && (
          <div className="graphs-card feedback-count-card">
            <h2>Total Feedback Collected</h2>
            <p className="feedback-count">{totalFeedback}</p>
          </div>
        )}

        {academicYear && studentYear ? (
          <>
            <div className="graphs-card chart-card">
              <h2>
                <FiPieChart /> Theory Subjects - Pie Chart (Semester {semester})
              </h2>
              {loading ? (
                <p>Loading...</p>
              ) : pieData.theory.length > 0 ? (
                <>
                  <div className="chart-container">
                    <Pie
                      ref={theoryPieRef}
                      data={preparePieDataset(pieData.theory)}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: { enabled: true },
                        },
                      }}
                    />
                  </div>
                  <button
                    className="export-button"
                    onClick={() => exportChart(theoryPieRef, `theory_pie_${academicYear}_${semester}`)}
                    title="Export theory pie chart"
                  >
                    Export Chart
                  </button>
                </>
              ) : (
                <p>No theory data available.</p>
              )}
            </div>

            <div className="graphs-card chart-card">
              <h2>
                <FiPieChart /> Practical Subjects - Pie Chart (Semester {semester})
              </h2>
              {loading ? (
                <p>Loading...</p>
              ) : pieData.practical.length > 0 ? (
                <>
                  <div className="chart-container">
                    <Pie
                      ref={practicalPieRef}
                      data={preparePieDataset(pieData.practical)}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: { enabled: true },
                        },
                      }}
                    />
                  </div>
                  <button
                    className="export-button"
                    onClick={() => exportChart(practicalPieRef, `practical_pie_${academicYear}_${semester}`)}
                    title="Export practical pie chart"
                  >
                    Export Chart
                  </button>
                </>
              ) : (
                <p>No practical data available.</p>
              )}
            </div>

            <div className="graphs-card chart-card">
              <h2>
                <FiBarChart2 /> Theory Subjects - Semester Comparison
              </h2>
              {barData.theory.length > 0 ? (
                <>
                  <div className="chart-container">
                    <Bar
                      ref={theoryBarRef}
                      data={prepareBarDataset(barData.theory)}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: { enabled: true },
                        },
                        scales: {
                          y: { beginAtZero: true, max: 5 },
                        },
                      }}
                    />
                  </div>
                  <button
                    className="export-button"
                    onClick={() => exportChart(theoryBarRef, `theory_bar_${academicYear}`)}
                    title="Export theory bar chart"
                  >
                    Export Chart
                  </button>
                </>
              ) : (
                <p>No theory comparison data available.</p>
              )}
            </div>

            <div className="graphs-card chart-card">
              <h2>
                <FiBarChart2 /> Practical Subjects - Semester Comparison
              </h2>
              {barData.practical.length > 0 ? (
                <>
                  <div className="chart-container">
                    <Bar
                      ref={practicalBarRef}
                      data={prepareBarDataset(barData.practical)}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: { enabled: true },
                        },
                        scales: {
                          y: { beginAtZero: true, max: 5 },
                        },
                      }}
                    />
                  </div>
                  <button
                    className="export-button"
                    onClick={() => exportChart(practicalBarRef, `practical_bar_${academicYear}`)}
                    title="Export practical bar chart"
                  >
                    Export Chart
                  </button>
                </>
              ) : (
                <p>No practical comparison data available.</p>
              )}
            </div>
          </>
        ) : (
          <div className="graphs-card">
            <p>Please select Academic Year and Student Year to view analytics.</p>
          </div>
        )}
      </div>

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

export default HodGraphsPage;