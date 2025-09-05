import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="card shadow-lg p-4 rounded-4">
        <h2 className="fw-bold text-primary mb-3">Contact Us</h2>
        <p className="text-muted">
          Have questions, feedback, or need support? We’d love to hear from you.
        </p>
        <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">Your Name</label>
            <input type="text" className="form-control" id="name" placeholder="Enter your name" />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <input type="email" className="form-control" id="email" placeholder="Enter your email" />
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="form-label fw-semibold">Message</label>
            <textarea className="form-control" id="message" rows={4} placeholder="Write your message..."></textarea>
          </div>
          <button type="submit" className="btn btn-primary fw-semibold">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
