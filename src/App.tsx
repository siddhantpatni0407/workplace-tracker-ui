import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import "./styles/global.css";

// Lazy loading pages
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Layout wrapper (Navbar + Footer)
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="d-flex flex-column min-vh-100">
    <Navbar />
    <main className="flex-fill container py-4 page-wrapper">
      {children}
    </main>
    <Footer />
  </div>
);

// Loading Spinner for Suspense
const Loader: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary me-2" role="status"></div>
    <span className="fw-semibold text-muted">Loading, please wait...</span>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Landing / Login */}
            <Route
              path="/"
              element={
                <Layout>
                  <Landing />
                </Layout>
              }
            />

            {/* Signup */}
            <Route
              path="/signup"
              element={
                <Layout>
                  <Signup />
                </Layout>
              }
            />

            {/* Dashboards */}
            <Route
              path="/admin"
              element={
                <PrivateRoute role="ADMIN">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/user"
              element={
                <PrivateRoute role="USER">
                  <Layout>
                    <UserDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
