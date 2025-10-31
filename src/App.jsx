// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import AboutUs from "./pages/AboutUs";
import Weeks from "./pages/Weeks";
import Timetable from "./pages/Timetable";
import Personal from "./pages/Personal";

import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");

  // Toggle theme: add/remove dark class on <html>
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <Router>
      <Navbar toggleTheme={toggleTheme} theme={theme} />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/weeks" element={<Weeks />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/personal" element={<Personal />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
