import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.login(formData.email, formData.password);

      if (resp.status === "SUCCESS" && resp.token) {
        // Save token/session so AuthProvider can pick it up
        authService.saveSession(resp);

        // Navigate to role-based dashboard and reload so AuthProvider initialises with saved session
        const role = resp.role || "USER";
        navigate(role === "ADMIN" ? "/admin" : "/user");
        window.location.reload(); // reload to let AuthProvider read localStorage
      } else {
        // handle special messages
        if (resp.message && resp.message.toLowerCase().includes("locked")) {
          setError(
            "⚠️ Your account is locked due to multiple failed login attempts. Please reset your password or contact admin."
          );
        } else {
          setError(resp.message || "Invalid credentials. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // If backend provides an error response body, show that if available
      const msg = err?.response?.data?.message || err?.message || "Something went wrong. Please try again later.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: 480 }}>
        <h2 className="text-center mb-4">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
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
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
