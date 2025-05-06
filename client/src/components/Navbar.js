import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div className="nav-brand">
        <Link to="/">Blood Bank</Link>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.name}</span>
            {user?.role === 'admin' && (
              <>
                <Link to="/admin">Admin Dashboard</Link>
                <Link to="/donors">Donor Management</Link>
                <Link to="/inventory">Inventory Management</Link>
                <Link to="/request-approval">Request Approval</Link>
              </>
            )}
            {user?.role !== 'admin' && (
              <>
                <Link to="/my-requests">My Requests</Link>
                <Link to="/request-blood">Request Blood</Link>
                {user?.role === 'donor' && <Link to="/my-donations">My Donations</Link>}
                {user?.role === 'donor' && <Link to="/donate-blood">Donate Blood</Link>}
              </>
            )}
            <Link to="/notifications">Notifications</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 