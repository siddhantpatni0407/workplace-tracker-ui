import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../hooks/useTranslation";
import { ROUTES } from "../../../constants";
import "./home.css";
import bgImage from "../../../assets/workplace-tracker-background.jpg"; 

const Home: React.FC = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Set background image as CSS custom property for reliable loading
    document.documentElement.style.setProperty('--home-bg-image', `url("${bgImage}")`);
    
    // Disable body scrolling and remove any default spacing
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyMargin = document.body.style.margin;
    const prevBodyPadding = document.body.style.padding;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    // Add home-active class to body
    document.body.classList.add('home-active');
    
    return () => {
      // cleanup - restore original styles
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.margin = prevBodyMargin;
      document.body.style.padding = prevBodyPadding;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.classList.remove('home-active');
      document.documentElement.style.removeProperty("--home-bg-image");
    };
  }, []);

  return (
    <main className="home-root" role="main" aria-labelledby="home-heading">
      <div className="home-card shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6 home-left d-flex align-items-center">
            <div className="p-4 p-md-5 home-left-inner">
              <h1 id="home-heading" className="home-title">
                {t("home.welcomeTo")} <span className="home-highlight">{t("home.workplaceTracker")}</span>
              </h1>
              <p className="home-sub">
                {t("home.subtitle")}
              </p>

              <ul className="home-features list-unstyled" aria-hidden="false">
                <li><span className="dot" aria-hidden="true" /> {t("home.features.trackWfoWfh")}</li>
                <li><span className="dot" aria-hidden="true" /> {t("home.features.monthlyReports")}</li>
                <li><span className="dot" aria-hidden="true" /> {t("home.features.adminUserDashboards")}</li>
                <li><span className="dot" aria-hidden="true" /> {t("home.features.attendanceTasks")}</li>
              </ul>

              <div className="mt-3 small text-white-75">
                <small>{t("home.builtForTeams")}</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 home-right d-flex align-items-center justify-content-center">
            <div className="cta-wrap p-4 p-md-5">
              <h2 className="cta-title">{t("home.getStarted")}</h2>
              <p className="cta-sub text-muted">{t("home.getStartedSubtitle")}</p>

              <div className="d-grid gap-3 w-100">
                <Link 
                  to={ROUTES.PUBLIC.LOGIN} 
                  className="btn btn-solid btn-lg" 
                  aria-label={t("home.gotoLoginPage")}
                >
                  <i className="bi bi-box-arrow-in-right me-2" />
                  {t("auth.login")}
                </Link>
                <Link 
                  to={ROUTES.PUBLIC.SIGNUP} 
                  className="btn btn-outline btn-lg" 
                  aria-label={t("home.gotoSignupPage")}
                >
                  <i className="bi bi-person-plus me-2" />
                  {t("auth.signup")}
                </Link>
                <Link 
                  to={ROUTES.PUBLIC.ABOUT} 
                  className="btn btn-link-muted btn-sm mt-2" 
                  aria-label={t("home.learnMore")}
                >
                  <i className="bi bi-info-circle me-1" />
                  {t("home.learnMore")}
                </Link>
              </div>

              <div className="small-meta mt-4 text-muted text-center">
                <small>{t("home.tagline")}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
