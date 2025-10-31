import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Welcome to Timetable Scheduler</h1>
        <p>
          Organize your weekly schedule with ease! Create a timetable by selecting
          days, periods, subjects, faculty, and available rooms. Generate a complete
          timetable in just a few steps.
        </p>
        <button className="get-started-btn" onClick={() => navigate("/login")}>
          Get Started
        </button>
      </div>
    </div>
  );
}
