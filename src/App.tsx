// src/App.tsx
import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/routing";
import Navbar from "./components/common/navbar/Navbar";
import Footer from "./components/common/footer/Footer";
import { ErrorBoundary, VersionNotification } from "./components/ui";
import { ROUTES } from "./constants";
import "./styles/global.css";
import Reports from "./components/admin/reports/Reports";
import { ThemeProvider } from "./theme/ThemeContext";
import QueryProvider from "./services/queryClient/QueryProvider";
import { ErrorProvider } from "./utils/errorHandling/ErrorContext";
import { APP_VERSION } from "./constants";
import { createVersionChecker } from "./utils";
// Initialize i18n
import "./i18n";

// Lazy loading pages
const Home = lazy(() => import("./components/common/home/Home"));
const Login = lazy(() => import("./components/common/login/Login"));
const Signup = lazy(() => import("./components/common/signUp/SignUp"));
const AdminDashboard = lazy(() => import("./components/admin/dashboard/AdminDashboard"));
const UserDashboard = lazy(() => import("./components/user/dashboard/UserDashboard"));
const UserManagement = lazy(() => import("./components/admin/userManagement/UserManagement"));
const UserSettings = lazy(() => import("./components/common/userSettings/UserSettings"));
const UserProfile = lazy(() => import("./components/common/userProfile/UserProfile"));
const HolidayManagement = lazy(() => import("./components/admin/holiday/HolidayManagement")); // admin
const LeavePolicyManagement = lazy(() => import("./components/admin/leavePolicyManagement/LeavePolicyManagement"));
const DatabaseBackup = lazy(() => import("./components/admin/databaseBackup/DatabaseBackup"));
const UserHolidayTracker = lazy(() => import("./components/user/holiday/UserHolidayTracker")); // user tracker
const LeavePolicy = lazy(() => import("./components/user/leavePolicy/LeavePolicy"));
const ApplyLeave = lazy(() => import("./components/user/leave/ApplyLeave"));
const OfficeVisit = lazy(() => import("./components/user/officeVisit/OfficeVisit"));
const OfficeVisitAnalytics = lazy(() => import("./components/user/officeVisitAnalytics/OfficeVisitAnalytics"));
const UserTasks = lazy(() => import("./components/user/tasks/UserTasks"));
const UserNotes = lazy(() => import("./components/user/notes/UserNotes"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./components/common/about/About"));
const Contact = lazy(() => import("./components/common/contact/Contact"));

// Layout wrapper (Navbar + Footer)
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    {/* fixed navbar */}
    <Navbar />

    {/* scrollable main content */}
    <main className="page-content">
      <div className="page-wrapper flex-fill container-fluid px-4 py-4">
        {children}
      </div>
    </main>

    {/* fixed footer */}
    <Footer />
  </div>
);

// Loading Spinner for Suspense
const Loader: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary me-2" role="status" />
    <span className="fw-semibold text-muted">Loading, please wait...</span>
  </div>
);

const App: React.FC = () => {
  const [newVersion, setNewVersion] = useState<string | null>(null);
  
  // Set up version checking
  useEffect(() => {
    // We would normally use an actual version API endpoint here
    // This is just for demonstration purposes
    const versionCheckUrl = `${window.location.origin}/api/version`;
    
    // Create but don't start the version checker in development
    // In production, you would uncomment the start() call below
    const checker = createVersionChecker({
      versionUrl: versionCheckUrl,
      checkInterval: 60 * 60 * 1000, // Check every hour
      onNewVersion: (version: string) => {
        setNewVersion(version);
      }
    });
    
    // For demo purposes, simulate a version update after 5 seconds
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        // Simulate receiving a newer version
        // Remove this in production
        const mockNewVersion = '0.2.0';
        if (mockNewVersion !== APP_VERSION.full) {
          setNewVersion(mockNewVersion);
        }
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        checker.stop(); // Use checker to avoid unused variable warning
      };
    }
    
    // In production environments, uncomment these lines:
    // checker.start();
    // return () => checker.stop();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ErrorProvider>
          <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
            <Suspense fallback={<Loader />}>
              {newVersion && (
                <VersionNotification
                  newVersion={newVersion}
                  currentVersion={APP_VERSION.full}
                  onDismiss={() => setNewVersion(null)}
                />
              )}
              <Routes>
              {/* Home (marketing / cover page) */}
              <Route path={ROUTES.PUBLIC.HOME} element={<Layout><Home /></Layout>} />

              {/* Authentication pages */}
              <Route path={ROUTES.PUBLIC.LOGIN} element={<Layout><Login /></Layout>} />
              <Route path={ROUTES.PUBLIC.SIGNUP} element={<Layout><Signup /></Layout>} />

              {/* Static pages */}
              <Route path={ROUTES.PUBLIC.ABOUT} element={<Layout><About /></Layout>} />
              <Route path={ROUTES.PUBLIC.CONTACT} element={<Layout><Contact /></Layout>} />

              {/* Dashboards (protected) */}
              <Route
                path={ROUTES.ADMIN.DASHBOARD}
                element={
                  <PrivateRoute userRole="ADMIN">
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />

              <Route
                path={ROUTES.USER.DASHBOARD}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout>
                      <UserDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* User Management - ADMIN only */}
              <Route
                path={ROUTES.ADMIN.USER_MANAGEMENT}
                element={
                  <PrivateRoute userRole="ADMIN">
                    <Layout>
                      <UserManagement />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Holiday Management - ADMIN only (new) */}
              <Route
                path={ROUTES.ADMIN.HOLIDAY_MANAGEMENT}
                element={
                  <PrivateRoute userRole="ADMIN">
                    <Layout>
                      <HolidayManagement />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Leave Policy Management - ADMIN only (new) */}
              <Route
                path={ROUTES.ADMIN.LEAVE_POLICY_MANAGEMENT}
                element={
                  <PrivateRoute userRole="ADMIN">
                    <Layout>
                      <LeavePolicyManagement />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Reports & Analytics - ADMIN only */}
              <Route
                path={ROUTES.ADMIN.REPORTS}
                element={
                  <PrivateRoute userRole="ADMIN">
                    <Layout>
                      <Reports />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Database Backup - ADMIN only */}
              <Route
                path={ROUTES.ADMIN.BACKUP}
                element={
                  <PrivateRoute userRole="ADMIN">
                    <Layout>
                      <DatabaseBackup />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* User Settings - any authenticated user (no role restriction) */}
              <Route
                path={ROUTES.USER.SETTINGS}
                element={
                  <PrivateRoute>
                    <Layout>
                      <UserSettings />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* User Profile - any authenticated user (no role restriction) */}
              <Route
                path={ROUTES.USER.PROFILE}
                element={
                  <PrivateRoute>
                    <Layout>
                      <UserProfile />
                    </Layout>
                  </PrivateRoute>
                }
              />

              <Route
                path={ROUTES.USER.ANALYTICS}
                element={
                  <PrivateRoute>
                    <Layout>
                      <OfficeVisitAnalytics />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* User Holiday Tracker (read-only) */}
              <Route
                path={ROUTES.USER.HOLIDAY_TRACKER}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout>
                      <UserHolidayTracker />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Leave Policy - USER only (new) */}
              <Route
                path={ROUTES.USER.LEAVE_POLICY}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout><LeavePolicy /></Layout>
                  </PrivateRoute>
                }
              />

              {/* Apply Leave - USER only (new) */}
              <Route
                path={ROUTES.USER.APPLY_LEAVE}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout><ApplyLeave /></Layout>
                  </PrivateRoute>
                }
              />

              {/* Office Visit - USER only (new) */}
              <Route
                path={ROUTES.USER.OFFICE_VISIT}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout>
                      <OfficeVisit />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Office Visit Analytics - USER only (new) */}
              <Route
                path={ROUTES.USER.OFFICE_VISIT_ANALYTICS}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout><OfficeVisitAnalytics /></Layout>
                  </PrivateRoute>
                }
              />

              {/* User Tasks - USER only (new) */}
              <Route
                path={ROUTES.USER.USER_TASKS}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout><UserTasks /></Layout>
                  </PrivateRoute>
                }
              />

              {/* User Notes - USER only (new) */}
              <Route
                path={ROUTES.USER.USER_NOTES}
                element={
                  <PrivateRoute userRole="USER">
                    <Layout><UserNotes /></Layout>
                  </PrivateRoute>
                }
              />

              {/* 404 Page */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
          </AuthProvider>
          </ThemeProvider>
        </ErrorProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
