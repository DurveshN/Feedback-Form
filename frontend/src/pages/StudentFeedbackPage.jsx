import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../style/StudentFeedbackPage.css";
import logoLeft from '../assets/left_header.jpg';
import logoRight from '../assets/right_header.jpg';

const StudentFeedbackPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [questions, setQuestions] = useState({});
  const [semesterInfo, setSemesterInfo] = useState(null);
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
  const [feedbackData, setFeedbackData] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [animationClass, setAnimationClass] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentsRes = await axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback/assignments`, {
          headers: { Authorization: token },
        });

        const assignments = assignmentsRes.data.assignments || [];
        setAssignments(assignments);

        const semesterRes = await axios.get(`${process.env.REACT_APP_API_BASE}/api/semester/current`, {
          headers: { Authorization: token },
        });
        setSemesterInfo(semesterRes.data || null);

        const questionPromises = assignments.map((assignment) =>
          axios.get(`${process.env.REACT_APP_API_BASE}/api/feedback/questions?subject_type=${assignment.subject_type}`, {
            headers: { Authorization: token },
          })
        );
        const questionResponses = await Promise.all(questionPromises);
        const questionsByType = {};
        assignments.forEach((assignment, index) => {
          questionsByType[assignment.teacher_subject_id] = questionResponses[index].data.questions.map((q, idx) => ({
            ...q,
            serial: idx + 1,
          }));
        });
        setQuestions(questionsByType);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setMessage("Oops! We couldn't load the feedback form. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleNumberChange = (assignmentId, questionId, value) => {
    const numValue = value === "" ? "" : Number(value);
    if (value === "" || (numValue >= 1 && numValue <= 5)) {
      const key = `${assignmentId}_${questionId}`;
      setFeedbackData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleTextChange = (assignmentId, questionId, value) => {
    const key = `${assignmentId}_${questionId}`;
    setFeedbackData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!semesterInfo) {
      setMessage("Academic year or semester info not available. Please contact support.");
      return;
    }

    const unanswered = [];
    assignments.forEach((assignment) => {
      const currentQuestions = questions[assignment.teacher_subject_id] || [];
      currentQuestions
        .filter((q) => q.type !== "text-answer")
        .forEach((q) => {
          const key = `${assignment.teacher_subject_id}_${q.id}`;
          if (!feedbackData[key] || feedbackData[key] === "") {
            unanswered.push(`${assignment.subject_name} - ${q.serial}. ${q.text}`);
          }
        });
    });

    if (unanswered.length > 0) {
      setMessage(`Please fill these required questions: ${unanswered.join(", ")}`);
      return;
    }

    try {
      const submissionId = uuidv4();
      for (const assignment of assignments) {
        const currentQuestions = questions[assignment.teacher_subject_id] || [];
        for (const question of currentQuestions) {
          const key = `${assignment.teacher_subject_id}_${question.id}`;
          const value = feedbackData[key] || (question.type === "text-answer" ? "" : null);

          const payload = {
            teacher_subject_id: assignment.teacher_subject_id,
            question_id: question.id,
            rating: question.type !== "text-answer" ? Number(value) : null,
            text_answer: question.type === "text-answer" ? value : null,
            submission_id: submissionId,
            academic_year: semesterInfo.academic_year,
          };

          await axios.post(`${process.env.REACT_APP_API_BASE}/api/feedback/submit`, payload, {
            headers: { Authorization: token },
          });
        }
      }

      setMessage("All feedback submitted successfully!");
      navigate("/thankyou");
    } catch (err) {
      console.error("Submission failed", err);
      setMessage("Uh-oh! Something went wrong while submitting. Please try again.");
    }
  };

  const handleNext = () => {
    if (currentAssignmentIndex < assignments.length - 1) {
      setAnimationClass("slide-out-left");
      setTimeout(() => {
        setCurrentAssignmentIndex((prev) => prev + 1);
        setMessage("");
        setAnimationClass("slide-in-right");
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentAssignmentIndex > 0) {
      setAnimationClass("slide-out-right");
      setTimeout(() => {
        setCurrentAssignmentIndex((prev) => prev - 1);
        setMessage("");
        setAnimationClass("slide-in-left");
      }, 300);
    }
  };

  if (loading) return <div className="feedback-loader">Loading your feedback form...</div>;
  if (!assignments.length) return <div className="feedback-loader">No subjects assigned for feedback. Please contact your department.</div>;
  if (!Object.keys(questions).length) return <div className="feedback-loader">No questions available.</div>;

  const currentAssignment = assignments[currentAssignmentIndex];
  const currentQuestions = questions[currentAssignment.teacher_subject_id] || [];

  return (
    <div className="feedback-page">
      <div className="pdf-header">
        <img src={logoLeft} alt="Left Logo" className="header-logo left-logo" />
        <div className="header-text">
          <div className="institute-name">
            Akhil Bharatiya Maratha Shikshan Parishad's<br />
            Anantrao Pawar College of Engineering & Research
          </div>
          <div className="header-title">
            STUDENT FEEDBACK
          </div>
        </div>
        <img src={logoRight} alt="Right Logo" className="header-logo right-logo" />
      </div>
      <p className="feedback-subtitle">
        Share your thoughts on {currentAssignment.subject_name} ({currentAssignment.subject_type.charAt(0).toUpperCase() + currentAssignment.subject_type.slice(1)})
      </p>

      <div className="feedback-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentAssignmentIndex + 1) / assignments.length) * 100}%` }}
          ></div>
        </div>
        <div className={`feedback-card animated ${animationClass}`}>
          <h2>{currentAssignment.subject_name} - {currentAssignment.teacher_name}</h2>
          {message && (
            <div className={`message-card ${message.includes("Please") || message.includes("Uh-oh") ? "error" : "success"}`}>
              {message.includes("Please") || message.includes("Uh-oh") ? <FiXCircle /> : <FiCheckCircle />}
              <p>{message}</p>
            </div>
          )}
          {currentQuestions.map((question) => {
            const key = `${currentAssignment.teacher_subject_id}_${question.id}`;
            return (
              <div key={question.id} className="question-block">
                <div className="question-text">
                  {question.serial}. {question.text}
                  {question.type !== "text-answer" && <span className="mandatory-star">*</span>}
                </div>
                {question.type === "text-answer" ? (
                  <textarea
                    rows={4}
                    placeholder="Share your thoughts (optional)"
                    value={feedbackData[key] || ""}
                    onChange={(e) => handleTextChange(currentAssignment.teacher_subject_id, question.id, e.target.value)}
                  />
                ) : (
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="1-5"
                    value={feedbackData[key] || ""}
                    onChange={(e) => handleNumberChange(currentAssignment.teacher_subject_id, question.id, e.target.value)}
                    required
                  />
                )}
              </div>
            );
          })}
          <div className="feedback-navigation">
            <button onClick={handlePrev} disabled={currentAssignmentIndex === 0}>
              Previous
            </button>
            {currentAssignmentIndex === assignments.length - 1 ? (
              <button onClick={handleSubmit}>Submit Feedback</button>
            ) : (
              <button onClick={handleNext}>Next</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackPage;