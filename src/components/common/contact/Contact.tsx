import React, { useState } from "react";
import "./Contact.css";

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="contact-card card shadow-lg p-4 rounded-4">
        <h2 className="fw-bold text-primary mb-3 text-center">Contact Us</h2>
        <p className="text-muted text-center mb-4">
          Have questions, feedback, or need support? We’d love to hear from you.
        </p>

        {submitted && (
          <div className="alert alert-success text-center fw-semibold" role="alert">
            ✅ Your message has been sent!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">Your Name</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input type="text" className="form-control" id="name" placeholder="Enter your name" required />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" className="form-control" id="email" placeholder="Enter your email" required />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label fw-semibold">Message</label>
            <textarea className="form-control" id="message" rows={4} placeholder="Write your message..." required></textarea>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary fw-semibold">
              Send Message <i className="bi bi-send ms-1"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
