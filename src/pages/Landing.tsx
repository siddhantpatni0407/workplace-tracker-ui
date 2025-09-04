// src/pages/Landing.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "../context/AuthContext";

const Landing: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "USER" as Role,
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.email || !form.password) {
      setError("Email and Password are required.");
      return false;
    }
    if (isSignup && (!form.name || !form.mobileNumber)) {
      setError("Name and Mobile are required for signup.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let success = false;
    if (isSignup) {
      success = await signup(form);
    } else {
      success = await login(form.email, form.password);
    }

    if (success) {
      navigate(form.role === "ADMIN" ? "/admin" : "/user");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: "1000px" }}>
        {/* Left Column: App Info */}
        <div className="col-md-6 bg-primary text-white d-flex flex-column justify-content-center p-5 position-relative">
          <h1 className="fw-bold mb-4 animate__animated animate__fadeInDown">
            Welcome to <span className="text-warning">Workplace Tracker</span>
          </h1>
          <p className="lead mb-4 animate__animated animate__fadeIn">
            Simplify your work-life management with our intelligent tracking system.
            Know your attendance, office visits, and work from home days—all in one place.
          </p>
          <ul className="list-unstyled fs-6 animate__animated animate__fadeIn animate__delay-1s">
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i> Track Work From Office & Home
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i> View Monthly & Yearly Reports
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i> Role-Based Dashboards for Admin & Users
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i> Simple & Intuitive UI
            </li>
          </ul>
          <div className="mt-4">
            <img
              src="/assets/workplace-illustration.png"
              alt="Workplace Tracker Illustration"
              className="img-fluid animate__animated animate__zoomIn animate__delay-2s"
            />
          </div>
        </div>

        {/* Right Column: Login/Signup Form */}
        <div className="col-md-6 bg-white d-flex align-items-center justify-content-center p-5">
          <div className="w-100" style={{ maxWidth: "450px" }}>
            <h2 className="text-center mb-3 fw-bold text-primary">
              {isSignup ? "Create a New Account" : "Login to Workplace Tracker"}
            </h2>
            <p className="text-center text-muted mb-4">
              {isSignup
                ? "Fill in the details below to register."
                : "Enter your credentials to continue."}
            </p>

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mobile" className="form-label fw-semibold">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobileNumber"
                      value={form.mobileNumber}
                      onChange={handleChange}
                      required
                      minLength={10}
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="10-digit number"
                    />
                  </div>
                </>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label fw-semibold">
                  Select Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {error && (
                <p className="text-danger text-center fw-semibold">{error}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
              >
                {isSignup ? "Create Account" : "Login Now"}
              </button>
            </form>

            <hr className="my-4" />

            <button
              className="btn btn-outline-secondary w-100 py-2"
              onClick={() => {
                setIsSignup((prev) => !prev);
                setError("");
              }}
            >
              {isSignup
                ? "Already have an account? Login"
                : "New here? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
