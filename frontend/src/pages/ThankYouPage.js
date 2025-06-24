import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/ThankYouPage.css";

const ThankYouPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Replace current history entry to prevent back navigation
    window.history.replaceState(null, "", "/thankyou");

    // Add event listener to prevent back navigation
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", "/thankyou");
    };

    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", "/thankyou");

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="thankyou-container">
      <div className="thankyou-card">
        <div className="celebration-emoji">🎉</div>

        <h1 className="thankyou-title">Thank You!</h1>
        <p className="thankyou-message">
          Your feedback has been successfully submitted.
        </p>

        <div className="thankyou-buttons">
          <button
            className="btn logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;