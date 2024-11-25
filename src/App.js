import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Authentication from './Authentication';
import Homepage from './Homepage';
import AdminHomePage from './AdminHomePage';
import StateHomepage from './StateHomepage';
import TalukaHomepage from './TalukaHomepage';
import DistrictHomepage from './DistrictHomepage';
import GrampanchayatHomepage from './GrampanchayatHomepage';
import BankHomepage from './BankHomepage';
import ApplicationStatus from './ApplicationStatus';

function App() {
  // Initialize state with localStorage values or defaults
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || '';
  });

  // Update localStorage whenever isAdmin or userRole changes
  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin);
    localStorage.setItem('userRole', userRole);
  }, [isAdmin, userRole]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Route */}
          <Route
            path="/"
            element={<Authentication setIsAdmin={setIsAdmin} setUserRole={setUserRole} />}
          />

          {/* Homepage Route */}
          <Route
            path="/homepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} adminOnly={false}>
                <Homepage />
              </ProtectedRoute>
            }
          />

          {/* Admin Route */}
          <Route
            path="/adminhomepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} userRole={userRole} role="Admin" adminOnly={true}>
                <AdminHomePage />
              </ProtectedRoute>
            }
          />

          {/* State Route */}
          <Route
            path="/statehomepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} userRole={userRole} role="State Gov" adminOnly={false}>
                <StateHomepage />
              </ProtectedRoute>
            }
          />

          {/* Taluka Route */}
          <Route
            path="/talukahomepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} userRole={userRole} role="Taluka" adminOnly={true}>
                <TalukaHomepage />
              </ProtectedRoute>
            }
          />

          {/* District Route */}
          <Route
            path="/districthomepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} userRole={userRole} role="District" adminOnly={false}>
                <DistrictHomepage />
              </ProtectedRoute>
            }
          />

          {/* Grampanchayat Route */}
          <Route
            path="/grampanchayathomepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} userRole={userRole} role="Grampanchayat" adminOnly={false}>
                <GrampanchayatHomepage />
              </ProtectedRoute>
            }
          />

          

          {/* Bank Route */}
          <Route
            path="/bankhomepage"
            element={
              <ProtectedRoute isAdmin={isAdmin} userRole={userRole} role="Bank" adminOnly={false}>
                <BankHomepage />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

// ProtectedRoute component to handle role-based or admin-only access
function ProtectedRoute({ children, isAdmin, userRole, role, adminOnly }) {
  const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
  const storedUserRole = localStorage.getItem('userRole');

  const adminStatus = isAdmin || storedIsAdmin;
  const userRoleStatus = userRole || storedUserRole;

  // Redirect if the user doesn't have the correct role
  if (role && userRoleStatus !== role) {
    return <Navigate to="/" />;
  }

  // Redirect if it's admin-only and the user is not an admin
  if (adminOnly && !adminStatus) {
    return <Navigate to="/" />;
  }

  return children;
}

export default App;
