// AboutUs.jsx
import React from "react";
import "./AboutUs.css"; // optional CSS file

export default function AboutUs() {
  // Project features dynamically
  const features = [
    "Create and manage timetables easily",
    "Track schedule history",
    "Support multiple users",
    "Responsive design for all devices",
  ];

  // ✅ Team members updated (6 members)
  const team = [
    { name: "kusuma", role: "Frontend Developer" },
    { name: "raghuram", role: "Frontend Developer" },
    { name: "ganesh", role: "Backend Developer" },
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        <h2>About Us</h2>
        <p>
          Welcome to the Timetable Scheduler project! This app is built using React
          to help users create, manage, and track their schedules efficiently.
        </p>

        <h3>Project Features:</h3>
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>

        <h3>Meet Our Team:</h3>
        <div className="team-container">
          {team.map((member, index) => (
            <div key={index} className="team-member">
              <div className="avatar">{member.name[0]}</div>
              <p><b>{member.name}</b></p>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
