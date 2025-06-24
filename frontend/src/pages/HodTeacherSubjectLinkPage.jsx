import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiLink, FiEdit, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../style/HodTeacherSubjectLinkPage.css";

const HodTeacherSubjectLinkPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [year, setYear] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [links, setLinks] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teacherRes, subjectRes, linksRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE}/api/teacher-subjects/teachers`, { headers: { Authorization: token } }),
        axios.get(`${process.env.REACT_APP_API_BASE}/api/teacher-subjects/subjects`, { headers: { Authorization: token } }),
        axios.get(`${process.env.REACT_APP_API_BASE}/api/teacher-subjects/list`, { headers: { Authorization: token } }),
      ]);
      setTeachers(teacherRes.data.teachers || []);
      setSubjects(subjectRes.data.subjects || []);
      setLinks(linksRes.data.links || []);
    } catch (err) {
      console.error("Error fetching data", err);
      setMessage("Failed to fetch data.");
    }
  };

  const generateAcademicYears = () => {
    const start = 2024;
    const end = new Date().getFullYear() + 4;
    const years = [];
    for (let y = start; y <= end; y++) {
      years.push(`${y}-${y + 1}`);
    }
    return years;
  };

  const handleSubmit = async () => {
    if (!teacherId || !subjectId || !year || !academicYear || !semester) {
      setMessage("Please fill all fields.");
      return;
    }

    const payload = {
      teacher_id: teacherId,
      subject_id: subjectId,
      year: parseInt(year),
      academic_year: academicYear,
      semester: parseInt(semester),
    };

    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_BASE}/api/teacher-subjects/update/${editingId}`, payload, {
          headers: { Authorization: token },
        });
        setMessage("Link updated successfully!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE}/api/teacher-subjects/link`, payload, {
          headers: { Authorization: token },
        });
        setMessage("Link created successfully!");
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error("Error submitting form", err);
      setMessage(err.response?.data?.message || "Failed to process request.");
    }
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setTeacherId(teachers.find((t) => t.name === link.teacher_name)?.id || "");
    setSubjectId(subjects.find((s) => s.name === link.subject_name)?.id || "");
    setYear(link.year);
    setSemester(link.semester);
    setAcademicYear(link.academic_year);
  };

  const resetForm = () => {
    setTeacherId("");
    setSubjectId("");
    setYear("");
    setAcademicYear("");
    setSemester("");
    setEditingId(null);
    setMessage("");
  };

  return (
    <div className="link-page">
      <header className="link-header">
        <h1>
          <FiLink className="header-icon" /> Teacher-Subject Assignment
        </h1>
        <p>Assign teachers to theory and practical subjects for your department</p>
      </header>

      <div className="link-container">
        <div className="link-card link-form-card">
          <h2>{editingId ? "Update Assignment" : "Create New Assignment"}</h2>
          <div className="form-group">
            <label htmlFor="teacher">Teacher</label>
            <select
              id="teacher"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              title="Select a teacher"
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              title="Select a theory or practical subject"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type.charAt(0).toUpperCase() + s.type.slice(1)})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="year">Student Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              title="Select student year"
            >
              <option value="">Select Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="academic-year">Academic Year</label>
            <select
              id="academic-year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              title="Select academic year"
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
              title="Select semester"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <button className="add-button" onClick={handleSubmit}>
            {editingId ? <FiEdit /> : <FiLink />}
            {editingId ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>

        {message && (
          <div className={`link-card message-card ${message.includes("successfully") ? "success" : "error"}`}>
            {message.includes("successfully") ? <FiCheckCircle /> : <FiXCircle />}
            <p>{message}</p>
          </div>
        )}

        <div className="link-card link-list-card">
          <h2>Existing Assignments</h2>
          {links.length === 0 ? (
            <p className="no-data">No assignments found</p>
          ) : (
            <div className="link-table-wrapper">
              <table className="link-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Year</th>
                    <th>Academic Year</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className={editingId === link.id ? "highlight-row" : ""}>
                      <td>{link.teacher_name}</td>
                      <td>{link.subject_name}</td>
                      <td>{link.subject_type.charAt(0).toUpperCase() + link.subject_type.slice(1)}</td>
                      <td>{link.year}</td>
                      <td>{link.academic_year}</td>
                      <td>{link.semester}</td>
                      <td>
                        <button className="edit-button" onClick={() => handleEdit(link)}>
                          <FiEdit /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="link-mobile-list">
                {links.map((link) => (
                  <div key={link.id} className={`link-mobile-card ${editingId === link.id ? "highlight-card" : ""}`}>
                    <h3>{link.teacher_name}</h3>
                    <p>Subject: {link.subject_name}</p>
                    <p>Type: {link.subject_type.charAt(0).toUpperCase() + link.subject_type.slice(1)}</p>
                    <p>Year: {link.year}</p>
                    <p>Academic Year: {link.academic_year}</p>
                    <p>Semester: {link.semester}</p>
                    <button className="edit-button" onClick={() => handleEdit(link)}>
                      <FiEdit /> Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="back-button" onClick={() => navigate("/hod")}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default HodTeacherSubjectLinkPage;