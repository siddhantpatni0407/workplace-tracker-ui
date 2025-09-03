import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../context/AuthContext";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <Navbar />
      <Header title="User Dashboard" subtitle="Track your work and attendance" />
      <p>Welcome, {user?.name} (User)</p>
      <div className="card">
        Here you can view your attendance, tasks, and leave.
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
