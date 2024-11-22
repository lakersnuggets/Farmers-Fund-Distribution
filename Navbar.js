import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

const Navbar = ({ isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); 
  };

  return (
    <nav style={{ ...styles.nav, backgroundColor: isAdmin ? '#555' : '#333' }}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>Home</Link>
        </li>
        <li style={styles.navItem}>
          <Link to={isAdmin ? "/admin-applications" : "/applications"} style={styles.navLink}>
            {isAdmin ? 'Admin Applications' : 'Applications'}
          </Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/notifications" style={styles.navLink}>Notifications</Link>
        </li>
        <li style={styles.navItem}>
          <span onClick={handleLogout} style={styles.navLink}>Logout</span>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    color: '#fff',
    padding: '1rem',
    position: 'sticky',
    top: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '1.5rem',
    margin: 0,
    padding: 0,
  },
  navItem: {
    cursor: 'pointer',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
};

export default Navbar;
