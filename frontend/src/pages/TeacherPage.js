// src/pages/TeacherPage.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../style/TeacherPage.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TeacherPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [subjectName, setSubjectName] = useState("");

  const chartRef = useRef();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback/assignments`, {
          headers: { Authorization: token },
        });
        console.log("Assignments response:", res.data.assignments);
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error("Error fetching assignments", err);
      }
    };

    fetchAssignments();
  }, [token]);

  // Filter subjects based on selected filters
  useEffect(() => {
    if (academicYear && studentYear && semester) {
      const filtered = assignments.filter(
        (a) =>
          a.academic_year === academicYear &&
          String(a.year) === String(studentYear) &&
          String(a.semester) === String(semester)
      );
      console.log("Filtered subjects:", filtered);
      setSubjects(filtered);
    } else {
      setSubjects([]);
    }
  }, [academicYear, studentYear, semester, assignments]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchFeedbackCount();
      fetchRatings();
      const subject = subjects.find((s) => s.teacher_subject_id === parseInt(selectedSubjectId));
      setSubjectName(subject?.subject_name || "");
    } else {
      setFeedbackCount(0);
      setRatings([]);
      setSubjectName("");
    }
  }, [selectedSubjectId]);

  const fetchFeedbackCount = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/teacher-analytics/subject-feedback-count`, {
        headers: { Authorization: token },
        params: {
          teacher_subject_id: selectedSubjectId,
          academic_year: academicYear,
          student_year: studentYear,
          semester: semester,
        },
      });
      setFeedbackCount(res.data.feedback_count || 0);
    } catch (err) {
      console.error("Error fetching feedback count", err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/teacher-analytics/teacher-subject-graph`, {
        headers: { Authorization: token },
        params: {
          teacher_subject_id: selectedSubjectId,
          academic_year: academicYear,
          student_year: studentYear,
          semester: semester,
        },
      });
      setRatings(res.data.data || []);
    } catch (err) {
      console.error("Error fetching ratings", err);
    }
  };

  const downloadExcel = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback/download-excel`, {
        headers: { Authorization: token },
        responseType: "blob",
        params: {
          teacher_subject_id: selectedSubjectId,
          academic_year: academicYear,
          student_year: studentYear,
          semester: semester,
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `feedback_${subjectName}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Excel download failed", err);
    }
  };

  const downloadPNG = () => {
    if (!chartRef.current) return;
    const link = document.createElement("a");
    link.download = `feedback_chart_${subjectName}.png`;
    link.href = chartRef.current.toBase64Image();
    link.click();
  };

  const downloadPDF = async () => {
    try {
      const canvas = chartRef.current.canvas;
      const image = await html2canvas(canvas);
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width + 100, canvas.height + 150] });
      pdf.text(`Subject: ${subjectName}`, 40, 40);
      const imgData = image.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 40, 80, image.width * 0.9, image.height * 0.9);
      pdf.save(`feedback_chart_${subjectName}.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  const prepareBarData = () => ({
    labels: ratings.map((r) => r.question_text),
    datasets: [
      {
        label: "Average Rating",
        backgroundColor: "#42A5F5",
        data: ratings.map((r) => r.average_rating),
      },
    ],
  });

  return (
    <div className="teacher-container">
      <div className="teacher-card">
        <h2 className="title">📊 Feedback Analysis & Downloads</h2>

        <div className="filters">
          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            <option value="">-- Academic Year --</option>
            {[...new Set(assignments.map((a) => a.academic_year))].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select value={studentYear} onChange={(e) => setStudentYear(e.target.value)}>
            <option value="">-- Student Year --</option>
            {[...new Set(assignments.map((a) => a.year))].map((year) => (
              <option key={year} value={year}>
                {year} Year
              </option>
            ))}
          </select>

          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">-- Semester --</option>
            {[1, 2].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {subjects.length > 0 && (
          <select
            className="dropdown"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s.teacher_subject_id} value={s.teacher_subject_id}>
                {s.subject_name} ({s.teacher_name})
              </option>
            ))}
          </select>
        )}

        {subjects.length === 0 && academicYear && studentYear && semester && (
          <p className="no-data">No subjects found for selected filters.</p>
        )}

        {selectedSubjectId && (
          <>
            <p className="feedback-info">📋 Feedbacks Submitted: {feedbackCount}</p>

            <button className="download-btn" onClick={downloadExcel}>📥 Download Excel</button>

            {ratings.length > 0 && (
              <>
                <div className="chart-container">
                  <Bar ref={chartRef} data={prepareBarData()} />
                </div>

                <button className="download-chart-btn" onClick={downloadPNG}>🖼️ Download PNG</button>
                <button className="download-pdf-btn" onClick={downloadPDF}>📄 Download PDF</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;
