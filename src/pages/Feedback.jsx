import React, { useState } from "react";
import "./Feedback.css";

const Feedback = () => {
  const [formData, setFormData] = useState({
    userName: "",
    rating: 0,
    language: "",
    experience: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      rating: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log("Form submitted:", formData);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        userName: "",
        rating: 0,
        language: "",
        experience: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="success-container">
          <div className="success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="success-title">Thank You!</h2>
          <p className="success-message">
            Your feedback has been submitted successfully.
          </p>
          <div className="pulse-animation">Redirecting back to form...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h1>Feedback Form</h1>
          <p>
            We value your feedback. Please take a moment to share your
            experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* User Name Field */}
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter your name"
            />
          </div>

          {/* Rating Field */}
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`rating-button ${
                    formData.rating >= star ? "active" : "inactive"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="rating-description">
              {formData.rating === 0
                ? "Select a rating"
                : `${formData.rating} ${
                    formData.rating === 1 ? "star" : "stars"
                  }`}
            </p>
          </div>

          {/* Experience Textbox */}
          <div className="form-group">
            <label htmlFor="experience" className="form-label">
              Share Your Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              required
              maxLength={500}
              className="form-textarea"
              placeholder="Tell us about your experience..."
            />
            <p className="rating-description">
              {formData.experience.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
