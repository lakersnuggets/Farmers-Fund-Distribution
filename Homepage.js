import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar'; 
import './App.css';

function Homepage() {
  const location = useLocation();
  const userName = location.state?.userName || "User";

  return (
    <>
      <Navbar /> 
      <div className="homepage">
        <h1>Welcome, {userName}!</h1>
        <p>Your agricultural funds application is in Progress.....</p>
      </div>
    </>
  );
}

export default Homepage;

