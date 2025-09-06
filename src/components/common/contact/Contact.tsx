import React, { useEffect, useState } from "react";
import "./Contact.css";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => setSubmitted(false), 3500);
      return () => clearTimeout(t);
    }
  }, [submitted]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.phone.trim() && !/^[0-9+\s()-]{6,20}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (!form.message.trim()) errs.message = "Please write your message";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      // simulate API call
      await new Promise((res) => setTimeout(res, 900));
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setErrors({ message: "Failed to send. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="contact-card card shadow-lg p-4 rounded-4">
        <div className="d-flex align-items-center justify-content-center mb-3">
          <div className="brand-icon me-2">
            <i className="bi bi-chat-dots-fill" aria-hidden />
          </div>
          <h2 className="fw-bold mb-0 text-center">Contact Us</h2>
        </div>
        <p className="text-muted text-center mb-4">
          Questions, feedback, or support — we’re here to help.
        </p>

        {submitted && (
          <div className="alert alert-success d-flex align-items-center gap-2" role="alert" aria-live="polite">
            <span className="success-check" aria-hidden>✓</span>
            <div>
              <div className="fw-semibold">Message sent</div>
              <div className="small text-muted">We’ll get back to you shortly.</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label fw-semibold">Your Name</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person" /></span>
                <input
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope" /></span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <label htmlFor="phone" className="form-label fw-semibold">Phone (optional)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone" /></span>
                <input
                  id="phone"
                  name="phone"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <label htmlFor="subject" className="form-label fw-semibold">Subject</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-card-text" /></span>
                <input
                  id="subject"
                  name="subject"
                  className="form-control"
                  placeholder="Subject (e.g., Billing, Support, Feedback)"
                  value={form.subject}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="col-12">
              <label htmlFor="message" className="form-label fw-semibold">Message</label>
              <textarea
                id="message"
                name="message"
                className={`form-control ${errors.message ? "is-invalid" : ""}`}
                rows={5}
                placeholder="Write your message..."
                value={form.message}
                onChange={handleChange}
                disabled={submitting}
                required
              />
              {errors.message && <div className="invalid-feedback">{errors.message}</div>}
            </div>

            <div className="col-12 d-grid">
              <button
                type="submit"
                className="btn btn-primary fw-semibold py-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <i className="bi bi-send ms-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
