import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = true; // Replace with real auth logic

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) navigate("/login");
  };

  return (
    <nav className="navbar flex justify-between items-center p-4 transition-colors duration-500">
      {/* Logo */}
      <div className="navbar-left cursor-pointer" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" className="navbar-logo w-28 h-auto" />
      </div>

      {/* Title */}
      <div className="navbar-center text-lg font-semibold">
        Timetable Scheduler
      </div>

      {/* Right links */}
      <ul className="navbar-right flex items-center space-x-4">
        <li className="cursor-pointer" onClick={() => navigate("/")}>
          Home
        </li>
        <li className="cursor-pointer" onClick={() => navigate("/login")}>
          Login
        </li>
        <li className="cursor-pointer" onClick={() => navigate("/feedback")}>
          Feedback
        </li>
        <li className="cursor-pointer" onClick={() => navigate("/about")}>
          About Us
        </li>

        {isLoggedIn && (
          <>
            <li
              className="cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <FaUserCircle size={28} />
            </li>
            <li className="cursor-pointer" onClick={handleLogout}>
              Logout
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
