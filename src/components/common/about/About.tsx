import React from "react";
import "./About.css";

const About: React.FC = () => {
  const features = [
    {
      title: "Attendance Tracking",
      desc: "Mark presence, WFO/WFH and view daily logs with timestamps.",
      icon: "bi-calendar-check",
    },
    {
      title: "Office Visit Tracker",
      desc: "Log office entries & exits, useful for on-site audits.",
      icon: "bi-building",
    },
    {
      title: "Leave Management",
      desc: "Apply, track and get approval status for leaves easily.",
      icon: "bi-envelope-check",
    },
    {
      title: "Holiday Calendar",
      desc: "Company holiday list with filtering by team/location.",
      icon: "bi-sun",
    },
    {
      title: "Notes & Reminders",
      desc: "Personal notes and quick reminders tied to your profile.",
      icon: "bi-journal-text",
    },
    {
      title: "Role-Based Dashboards",
      desc: "Different views & controls for Admins and Users.",
      icon: "bi-people",
    },
  ];

  return (
    <div className="about-page container py-5">
      <div className="card about-card shadow-sm rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-lg-5 about-hero d-flex align-items-center justify-content-center p-4">
            <div className="hero-inner text-center text-white">
              <h2 className="fw-bold mb-2">Workplace Tracker</h2>
              <p className="mb-3 lead">Smart attendance & office management for modern teams</p>
              <div className="d-flex gap-2 justify-content-center">
                <a href="/dashboard" className="btn btn-light btn-sm">Open Dashboard</a>
                <a href="/docs" className="btn btn-outline-light btn-sm">Docs</a>
              </div>
            </div>
          </div>

          <div className="col-lg-7 p-4">
            <h3 className="mb-2">About the app</h3>
            <p className="text-muted mb-4">
              Workplace Tracker helps employees and admins efficiently track attendance,
              office visits, leaves and more — packaged in a lightweight, responsive UI.
              Designed to reduce manual effort and give quick insights at a glance.
            </p>

            <div className="features-grid mb-3">
              {features.map((f) => (
                <div key={f.title} className="feature-item card p-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="feature-icon rounded-2">
                      <i className={`bi ${f.icon}`} aria-hidden />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">{f.title}</h6>
                      <p className="mb-0 small text-muted">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mt-4">
              <div>
                <small className="text-muted">Version</small>
                <div className="fw-bold">v1.0.0</div>
              </div>

              <div>
                <small className="text-muted">Contact</small>
                <div>
                  <a href="mailto:siddhant4patni@gmail.com" className="link-primary">siddhant4patni@gmail.com</a>
                </div>
              </div>

              <div className="text-end">
                <small className="text-muted">Developed by</small>
                <div className="fw-bold">Siddhant Patni</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
