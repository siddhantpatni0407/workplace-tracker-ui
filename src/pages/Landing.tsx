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

  try {
    if (isSignup) {
      // 🔹 signup flow
      const resp = await signup(form);
      if (resp.status === "SUCCESS") {
        navigate(form.role === "ADMIN" ? "/admin" : "/user");
      } else {
        setError(resp.message || "Signup failed. Please try again.");
      }
    } else {
      // 🔹 login flow
      const resp = await login(form.email, form.password);
      if (resp.status === "SUCCESS") {
        navigate(resp.role === "ADMIN" ? "/admin" : "/user");
      } else {
        if (resp.message?.toLowerCase().includes("locked")) {
          setError(
            "⚠️ Your account is locked due to multiple failed login attempts. Please reset your password or contact admin."
          );
        } else {
          setError(resp.message || "Invalid credentials. Please try again.");
        }
      }
    }
  } catch (err) {
    setError("Something went wrong. Please try again later.");
  }
};


  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="row w-100 shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "1000px" }}
      >
        {/* Left Column: Info */}
        <div className="col-md-6 bg-primary text-white d-flex flex-column justify-content-center p-5 position-relative">
          <h1 className="fw-bold mb-4">
            Welcome to <span className="text-warning">Workplace Tracker</span>
          </h1>
          <p className="lead mb-4">
            Track attendance, office visits, and work-from-home days—all in one place.
          </p>
          <ul className="list-unstyled fs-6">
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i>
              Track Work From Office & Home
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i>
              Monthly & Yearly Reports
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-warning"></i>
              Role-Based Dashboards
            </li>
          </ul>
        </div>

        {/* Right Column: Form */}
        <div className="col-md-6 bg-white d-flex align-items-center justify-content-center p-5">
          <div className="w-100" style={{ maxWidth: "450px" }}>
            <h2 className="text-center mb-3 fw-bold text-primary">
              {isSignup ? "Create Account" : "Login"}
            </h2>
            <p className="text-center text-muted mb-4">
              {isSignup
                ? "Fill details to register"
                : "Enter email and password to login"}
            </p>

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Mobile Number
                    </label>
                    <input
                      name="mobileNumber"
                      type="tel"
                      value={form.mobileNumber}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="10-digit number"
                      minLength={10}
                      maxLength={10}
                      inputMode="numeric"
                      required
                    />
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {isSignup && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}

              {error && (
                <p className="text-danger text-center fw-semibold">{error}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </form>

            <hr className="my-4" />

            <button
              type="button"
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
