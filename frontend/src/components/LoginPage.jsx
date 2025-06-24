import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import "../style/LoginPage.css";
import logoLeft from '../assets/left_header.jpg';
import logoRight from '../assets/right_header.jpg';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE}/api/auth/login`, {
        username,
        password,
      });

      const { token, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "student") {
        navigate("/student");
      } else if (role === "teacher") {
        navigate("/teacher");
      } else if (role === "hod") {
        navigate("/hod");
      } else {
        setError("Unsupported role.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${shake ? "shake" : ""}`}>
        <div className="pdf-header">
          <img src={logoLeft} alt="Left Logo" className="header-logo left-logo" />
          <div className="header-text">
            <div className="institute-name">
              Akhil Bharatiya Maratha Shikshan Parishad's<br />
              Anantrao Pawar College of Engineering & Research
            </div>
            <div className="header-title">
              SIGN IN
            </div>
          </div>
          <img src={logoRight} alt="Right Logo" className="header-logo right-logo" />
        </div>
        <p className="login-subtitle">
          Welcome to the Feedback System
        </p>
        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="message-card error">
              <FiXCircle /> <p>{error}</p>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              title="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              title="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            title="Sign in to your account"
          >
            {loading ? <FiLoader className="spinning" /> : <FiCheckCircle />}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="team-credits">
          <p className="created-by">Created by:</p>
          <p className="team-members">
            Durvesh Narkhede, Nigam Roy, Prasad Dhanade, Pratiksha Ovhal, Saniya Jadhav
          </p>
          {/* <div className="team-members">
            <p>Durvesh Narkhede</p>
            <p>Nigam Roy</p>
            <p>Prasad Dhanade</p>
            <p>Pratiksha Ovhal</p>
            <p>Saniya Jadhav</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;