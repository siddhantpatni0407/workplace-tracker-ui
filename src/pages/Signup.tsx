import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../types/auth";
import RoleSelect from "../components/RoleSelect";
import { authService } from "../services/authService";

interface FormData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: Role;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const sanitizeMobile = (value: string) => value.replace(/\D/g, "").slice(0, 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobileNumber") {
      setFormData((p) => ({ ...p, mobileNumber: sanitizeMobile(value) }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleRoleChange = (role: Role) => {
    setFormData((p) => ({ ...p, role }));
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return "Name is required";
    if (formData.mobileNumber.length !== 10) return "Mobile number must be 10 digits";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.signup({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Show backend message
      if (resp.status === "SUCCESS") {
        setSuccessMsg(resp.message || "Signup successful. Please login.");
        // Save token/session so AuthProvider can pick it up after reload (if you want auto-login).
        // If you prefer to force user to login manually after signup, comment the next line.
        authService.saveSession(resp);

        // Navigate to landing/login and reload so AuthProvider reads saved session (or show login page)
        navigate("/"); // landing page
        // reload to let AuthProvider pick up user from localStorage (if you saved session)
        window.location.reload();
      } else {
        setError(resp.message || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: 560 }}>
        <h2 className="text-center mb-4">Create an account</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mobile number</label>
            <input
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="form-control"
              placeholder="10-digit number"
              inputMode="numeric"
              pattern="[0-9]{10}"
              required
              disabled={loading}
            />
            <div className="form-text">Numbers only — 10 digits</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Choose a strong password"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <RoleSelect value={formData.role} onChange={handleRoleChange} disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                Creating...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
