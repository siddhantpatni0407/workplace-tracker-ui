import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../context/AuthContext";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <Navbar />
      <Header title="Admin Dashboard" subtitle="Manage users and reports" />
      <p>Welcome, {user?.name} (Admin)</p>
      <div className="card">
        Here you can manage users, view reports, etc.
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
