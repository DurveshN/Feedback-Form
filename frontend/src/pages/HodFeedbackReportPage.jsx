import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowLeft, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { utils, writeFile } from 'xlsx';
import '../style/FeedbackReportPage.css';

const FeedbackReportPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [selectedTeacherSubject, setSelectedTeacherSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/analytics/years`, {
          headers: { Authorization: ` ${token}` },
        });
        setAcademicYears(res.data.years || []);
      } catch (err) {
        setMessage('Failed to load academic years.');
      }
    };
    fetchAcademicYears();
  }, [token]);

  useEffect(() => {
    if (selectedAcademicYear && selectedYear) {
      const fetchTeacherSubjects = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback-generator/teacher-subjects`, {
            params: { academic_year: selectedAcademicYear, year: selectedYear },
            headers: { Authorization: ` ${token}` },
          });
          setTeacherSubjects(res.data.teacher_subjects || []);
          setSelectedTeacherSubject('');
        } catch (err) {
          setMessage('Failed to load subjects.');
        }
      };
      fetchTeacherSubjects();
    } else {
      setTeacherSubjects([]);
      setSelectedTeacherSubject('');
    }
  }, [selectedAcademicYear, selectedYear, token]);

  const handleDownloadPDF = async () => {
    if (!selectedAcademicYear || !selectedYear || !selectedTeacherSubject) {
      setMessage('Please select all fields.');
      return;
    }

    setIsLoadingPDF(true);
    try {
      const selected = teacherSubjects.find(
        (ts) => ts.teacher_subject_id === parseInt(selectedTeacherSubject)
      );
      if (!selected) {
        setMessage('Invalid subject selection.');
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback-generator/pdf`, {
        params: {
          teacher_subject_id: selectedTeacherSubject,
          academic_year: selectedAcademicYear,
          student_year: selectedYear,
          semester: selected.semester,
        },
        headers: { Authorization: ` ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Feedback_${selected.teacher_name}_${selected.subject_name}_${selectedAcademicYear}_${selected.semester}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('PDF downloaded successfully!');
    } catch (err) {
      setMessage('Failed to download PDF.');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedAcademicYear || !selectedYear || !selectedTeacherSubject) {
      setMessage('Please select all fields.');
      return;
    }

    setIsLoadingExcel(true);
    try {
      const selected = teacherSubjects.find(
        (ts) => ts.teacher_subject_id === parseInt(selectedTeacherSubject)
      );
      if (!selected) {
        setMessage('Invalid subject selection.');
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback-generator/excel`, {
        params: {
          teacher_subject_id: selectedTeacherSubject,
          academic_year: selectedAcademicYear,
          student_year: selectedYear,
          semester: selected.semester,
        },
        headers: { Authorization: ` ${token}` },
      });

      const { questions, feedback } = res.data.data;

      // Prepare worksheet data
      const headers = ['Username', ...questions.map(q => q.text), ...questions.map(q => q.comment_key)];
      const worksheetData = [
        headers,
        ...feedback.map(row => [
          row.username,
          ...questions.map(q => row[q.text] || ''),
          ...questions.map(q => row[q.comment_key] || '')
        ])
      ];

      // Create worksheet and workbook
      const worksheet = utils.aoa_to_sheet(worksheetData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Feedback');

      // Download the Excel file
      writeFile(workbook, `Feedback_Raw_${selected.teacher_name}_${selected.subject_name}_${selectedAcademicYear}_${selected.semester}.xlsx`);

      setMessage('Excel downloaded successfully!');
    } catch (err) {
      console.error('Failed to download Excel:', err);
      setMessage('Failed to download Excel.');
    } finally {
      setIsLoadingExcel(false);
    }
  };

  return (
    <div className="feedback-report-page">
      <header className="report-header">
        <h1>
          <FiDownload className="header-icon" /> Generate Feedback Report
        </h1>
        <p>Select details to download a feedback report.</p>
      </header>

      <div className="report-container">
        <div className="report-card report-form-card">
          <h2>Feedback Report Generator</h2>
          {message && (
            <div className={`message-card ${message.includes('Failed') ? 'error' : 'success'}`}>
              {message.includes('Failed') ? <FiXCircle /> : <FiCheckCircle />}
              <p>{message}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="academic-year">Academic Year</label>
            <select
              id="academic-year"
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              title="Select the academic year"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="student-year">Year</label>
            <select
              id="student-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              title="Select the student year"
            >
              <option value="">Select Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject-teacher">Subject & Teacher</label>
            <select
              id="subject-teacher"
              value={selectedTeacherSubject}
              onChange={(e) => setSelectedTeacherSubject(e.target.value)}
              title="Select subject and teacher"
            >
              <option value="">Select Subject & Teacher</option>
              {teacherSubjects.map((ts) => (
                <option key={ts.teacher_subject_id} value={ts.teacher_subject_id}>
                  {`${ts.subject_name} - ${ts.teacher_name} (Semester ${ts.semester})`}
                </option>
              ))}
            </select>
          </div>

          <button
            className="report-button add-button pdf-button"
            onClick={handleDownloadPDF}
            disabled={isLoadingPDF || isLoadingExcel}
            title="Download the feedback report as PDF"
          >
            {isLoadingPDF ? <FiLoader className="spinning" /> : <FiDownload />}
            {isLoadingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>

          <button
            className="report-button add-button excel-button"
            onClick={handleDownloadExcel}
            disabled={isLoadingPDF || isLoadingExcel}
            title="Download the raw feedback data as Excel"
          >
            {isLoadingExcel ? <FiLoader className="spinning" /> : <FiDownload />}
            {isLoadingExcel ? 'Generating Excel...' : 'Download Excel'}
          </button>

          <button
            className="report-button back-button"
            onClick={() => navigate('/hod')}
            title="Return to dashboard"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReportPage;