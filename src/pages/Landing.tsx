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
    mobile: "",
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
    if (isSignup && (!form.name || !form.mobile)) {
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
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "450px", width: "100%" }}>
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
                <label htmlFor="name" className="form-label fw-semibold">Full Name</label>
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
                <label htmlFor="mobile" className="form-label fw-semibold">Mobile Number</label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  className="form-control"
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
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
            <label htmlFor="password" className="form-label fw-semibold">Password</label>
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
            <label htmlFor="role" className="form-label fw-semibold">Select Role</label>
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

          {error && <p className="text-danger text-center fw-semibold">{error}</p>}

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
          {isSignup ? "Already have an account? Login" : "New here? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default Landing;
