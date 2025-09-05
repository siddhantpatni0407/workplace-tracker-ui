import React from "react";

const About: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="card shadow-lg p-4 rounded-4">
        <h2 className="fw-bold text-primary mb-3">About Workplace Tracker</h2>
        <p className="text-muted">
          Workplace Tracker is a smart application designed to help employees and administrators
          efficiently track workplace attendance, work-from-home schedules, and office visits.
        </p>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">✅ Track daily work location (Office / WFH / Holiday)</li>
          <li className="list-group-item">✅ View monthly and yearly attendance reports</li>
          <li className="list-group-item">✅ Role-based dashboards for Admins & Users</li>
          <li className="list-group-item">✅ Simple and secure login/signup process</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
