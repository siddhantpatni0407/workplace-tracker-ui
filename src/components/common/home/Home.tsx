import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import bg from "../../../assets/workplace-tracker.png"; 

const Home: React.FC = () => {
  useEffect(() => {
    // Save previous inline styles so we can restore them
    const prev = {
      overflowX: document.documentElement.style.overflowX,
      backgroundImage: document.body.style.backgroundImage,
      backgroundSize: document.body.style.backgroundSize,
      backgroundPosition: document.body.style.backgroundPosition,
      backgroundRepeat: document.body.style.backgroundRepeat,
      backgroundAttachment: document.body.style.backgroundAttachment,
      paddingBottom: document.body.style.paddingBottom,
    };

    // Apply full-bleed background on body (keeps natural scrolling)
    document.body.style.backgroundImage = `url("${bg}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";

    // Keep horizontal scrolling prevented, but allow vertical scrolling if needed
    document.documentElement.style.overflowX = "hidden";

    // add a non-invasive overlay class (css provides ::before)
    document.body.classList.add("home-body-overlay");

    // pin footer to bottom (adds a helper class) and set body padding-bottom so card not hidden
    const footer = document.querySelector("footer");
    const applyFooterGap = () => {
      const footerEl = footer as HTMLElement | null;
      const footerHeight = footerEl ? footerEl.offsetHeight : 72;
      const buffer = 12;
      const gap = footerHeight + buffer;
      document.body.style.paddingBottom = `${gap}px`;
      // expose CSS var in case css needs it
      document.documentElement.style.setProperty("--home-footer-gap", `${gap}px`);
      if (footerEl) footerEl.classList.add("home-footer-fixed");
    };

    applyFooterGap();
    window.addEventListener("resize", applyFooterGap);

    // If ResizeObserver available, watch footer height changes
    let ro: ResizeObserver | null = null;
    if (footer && (window as any).ResizeObserver) {
      ro = new ResizeObserver(applyFooterGap);
      ro.observe(footer);
    }

    return () => {
      // cleanup
      window.removeEventListener("resize", applyFooterGap);
      if (ro && footer) ro.unobserve(footer);
      if (footer) (footer as HTMLElement).classList.remove("home-footer-fixed");

      document.body.classList.remove("home-body-overlay");

      document.documentElement.style.overflowX = prev.overflowX;
      document.body.style.backgroundImage = prev.backgroundImage;
      document.body.style.backgroundSize = prev.backgroundSize;
      document.body.style.backgroundPosition = prev.backgroundPosition;
      document.body.style.backgroundRepeat = prev.backgroundRepeat;
      document.body.style.backgroundAttachment = prev.backgroundAttachment;
      document.body.style.paddingBottom = prev.paddingBottom || "";
      document.documentElement.style.removeProperty("--home-footer-gap");
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
