// src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/common/navbar/Navbar";
import Footer from "./components/common/footer/Footer";
import "./styles/global.css";
import Reports from "./components/admin/reports/Reports";

// Lazy loading pages
const Home = lazy(() => import("./components/common/home/Home"));
const Login = lazy(() => import("./components/common/login/Login"));
const Signup = lazy(() => import("./components/common/signUp/Signup"));
const AdminDashboard = lazy(() => import("./components/admin/dashboard/AdminDashboard"));
const UserDashboard = lazy(() => import("./components/user/dashboard/UserDashboard"));
const UserManagement = lazy(() => import("./components/admin/userManagement/UserManagement"));
const UserSettings = lazy(() => import("./components/common/userSettings/UserSettings"));
const HolidayManagement = lazy(() => import("./components/admin/holiday/HolidayManagement")); // admin
const LeavePolicyManagement = lazy(() => import("./components/admin/leavePolicyManagement/LeavePolicyManagement"));
const UserHolidayTracker = lazy(() => import("./components/user/holiday/UserHolidayTracker")); // user tracker
const LeavePolicy = lazy(() => import("./components/user/leavePolicy/LeavePolicy"));
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
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Home (marketing / cover page) */}
            <Route path="/" element={<Layout><Home /></Layout>} />

            {/* Authentication pages */}
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/signup" element={<Layout><Signup /></Layout>} />

            {/* Static pages */}
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />

            {/* Dashboards (protected) */}
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute role="ADMIN">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/user-dashboard"
              element={
                <PrivateRoute role="USER">
                  <Layout>
                    <UserDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* User Management - ADMIN only */}
            <Route
              path="/user-management"
              element={
                <PrivateRoute role="ADMIN">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Holiday Management - ADMIN only (new) */}
            <Route
              path="/holiday-management"
              element={
                <PrivateRoute role="ADMIN">
                  <Layout>
                    <HolidayManagement />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Leave Policy Management - ADMIN only (new) */}
            <Route
              path="/leave-policies"
              element={
                <PrivateRoute role="ADMIN">
                  <Layout>
                    <LeavePolicyManagement />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* User Settings - any authenticated user (no role restriction) */}
            <Route
              path="/user-settings"
              element={
                <PrivateRoute>
                  <Layout>
                    <UserSettings />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/user-analytics"
              element={
                <PrivateRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* User Holiday Tracker (read-only) */}
            <Route
              path="/holiday-tracker"
              element={
                <PrivateRoute role="USER">
                  <Layout>
                    <UserHolidayTracker />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/leave-policy"
              element={
                <PrivateRoute role="USER">
                  <Layout><LeavePolicy /></Layout>
                </PrivateRoute>
              }
            />

            {/* 404 Page */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
