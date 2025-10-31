import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setProfile(JSON.parse(storedUser)); // ✅ directly use saved user
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); // ✅ clear only on logout
    window.location.href = "/login";
  };

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p className="no-user">No user logged in. Please log in first.</p>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">User Profile</h1>

      <div className="profile-grid">
        {/* LEFT SECTION → User Info */}
        <div className="user-card">
          <div className="user-avatar">
            <User />
          </div>
          <h2>{profile?.name}</h2>
          <p>
            Profession: <span>{profile?.profession}</span>
          </p>
          <p>{profile?.email}</p>
          <p>{profile?.phone || "N/A"}</p>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        {/* RIGHT SECTION → Navigation */}
        <div className="history-card">
          <h2>Next Step</h2>
          {profile.profession === "Student" ? (
            <button
              className="theme-btn"
              onClick={() => navigate("/personal")}
            >
              Go to Student Timetable
            </button>
          ) : profile.profession === "Faculty" ? (
            <button
              className="theme-btn"
              onClick={() => navigate("/weeks")}
            >
              Go to Faculty Timetable
            </button>
          ) : (
            <p>No specific navigation available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
