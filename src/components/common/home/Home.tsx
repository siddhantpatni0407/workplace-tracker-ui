import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import bg from "../../../assets/workplace-tracker-background.jpg"; // adjust path if needed

const Home: React.FC = () => {
  useEffect(() => {
    // save previous body inline styles so we restore them later
    const prev = {
      overflow: document.body.style.overflow,
      backgroundImage: document.body.style.backgroundImage,
      backgroundSize: document.body.style.backgroundSize,
      backgroundPosition: document.body.style.backgroundPosition,
      backgroundRepeat: document.body.style.backgroundRepeat,
      backgroundAttachment: document.body.style.backgroundAttachment,
      paddingBottom: document.body.style.paddingBottom,
    };

    // Apply full-bleed background (use scroll attachment to avoid layout issues)
    document.body.style.backgroundImage = `url("${bg}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "scroll";

    // add non-blocking overlay helper class (visual only)
    document.body.classList.add("home-body-overlay");

    const footerSelectorCandidates = ["footer", ".site-footer", "#site-footer"];
    const findFooter = () =>
      footerSelectorCandidates.reduce<HTMLElement | null>((acc, sel) => {
        if (acc) return acc;
        const el = document.querySelector<HTMLElement>(sel);
        return el ?? null;
      }, null);

    const applyFooterGap = () => {
      const footer = findFooter();
      // If multiple footers exist warn (helps catch duplicate-footer problems)
      const footers = document.querySelectorAll("footer, .site-footer, #site-footer");
      if (footers.length > 1) {
        // do not throw - just log so you can remove the duplicate in layout
        // eslint-disable-next-line no-console
        console.warn(`Multiple footer elements found (${footers.length}). Remove duplicates to avoid layout issues.`);
      }

      const footerHeight = footer ? footer.offsetHeight : 72;
      const buffer = 12;
      const gap = footerHeight + buffer;

      // expose as CSS var and also add padding so content doesn't overlap the footer
      document.body.style.setProperty("--home-footer-gap", `${gap}px`);
      document.body.style.paddingBottom = `${gap}px`;

      // ensure footer renders above background / content
      if (footer) {
        // only bump z-index, don't force position change (safer)
        footer.style.zIndex = footer.style.zIndex || "1200";
      }
    };

    applyFooterGap();
    window.addEventListener("resize", applyFooterGap);

    // Observe footer size changes
    let ro: ResizeObserver | null = null;
    const footerEl = findFooter();
    if (footerEl && (window as any).ResizeObserver) {
      ro = new ResizeObserver(() => applyFooterGap());
      ro.observe(footerEl);
    }

    return () => {
      window.removeEventListener("resize", applyFooterGap);
      if (ro && footerEl) ro.unobserve(footerEl);
      document.body.classList.remove("home-body-overlay");

      // restore previous body styles & cleanup
      document.body.style.backgroundImage = prev.backgroundImage;
      document.body.style.backgroundSize = prev.backgroundSize;
      document.body.style.backgroundPosition = prev.backgroundPosition;
      document.body.style.backgroundRepeat = prev.backgroundRepeat;
      document.body.style.backgroundAttachment = prev.backgroundAttachment;
      document.body.style.paddingBottom = prev.paddingBottom;
      document.body.style.overflow = prev.overflow;
      document.body.style.removeProperty("--home-footer-gap");
    };
  }, []);

  return (
    <main className="home-root" role="main" aria-labelledby="home-heading">
      <div className="home-card shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6 home-left d-flex align-items-center">
            <div className="p-4 p-md-5 home-left-inner">
              <h1 id="home-heading" className="home-title">
                Welcome to <span className="home-highlight">Workplace Tracker</span>
              </h1>
              <p className="home-sub">
                Track attendance, office visits and work-from-home days — all in one place.
                Role-based dashboards, reports and a clean UI to simplify daily operations.
              </p>

              <ul className="home-features list-unstyled" aria-hidden="false">
                <li><span className="dot" aria-hidden="true" /> Track WFO &amp; WFH days</li>
                <li><span className="dot" aria-hidden="true" /> Monthly &amp; yearly reports</li>
                <li><span className="dot" aria-hidden="true" /> Admin &amp; user dashboards</li>
                <li><span className="dot" aria-hidden="true" /> Attendance, tasks, leaves &amp; holidays</li>
              </ul>

              <div className="mt-3 small text-white-75">
                <small>Built for teams — sign up or log in to connect your organization.</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 home-right d-flex align-items-center justify-content-center">
            <div className="cta-wrap p-4 p-md-5">
              <h2 className="cta-title">Get Started</h2>
              <p className="cta-sub text-muted">Use your workspace account or create one to begin.</p>

              <div className="d-grid gap-3 w-100">
                <Link to="/login" className="btn btn-solid btn-lg" aria-label="Go to Login Page">Login</Link>
                <Link to="/signup" className="btn btn-outline btn-lg" aria-label="Go to Signup Page">Sign Up</Link>
                <Link to="/about" className="btn btn-link-muted btn-sm mt-2" aria-label="Learn more">Learn more</Link>
              </div>

              <div className="small-meta mt-4 text-muted text-center">
                <small>Secure · Lightweight · Team-focused</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
