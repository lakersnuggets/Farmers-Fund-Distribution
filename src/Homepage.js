import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { db } from './firebase';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import './App.css';

function Homepage() {
  const location = useLocation();
  const userName = location.state?.userName || "User";

  // State for storing schemes
  const [schemes, setSchemes] = useState([]);
  // States for application status
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  // Fetch schemes from Firestore on component mount
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'schemes'));
        const schemesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchemes(schemesData);
      } catch (error) {
        console.error('Error fetching schemes:', error);
      }
    };

    fetchSchemes();
  }, []);

  // Check application status
  useEffect(() => {
    const checkApplicationStatus = async () => {
      const userId = userName; // Replace with actual user ID logic
      const schemeIds = schemes.map(scheme => scheme.id);

      for (let schemeId of schemeIds) {
        const applicationRef = doc(db, 'applications', `${userId}_${schemeId}`);
        const applicationDoc = await getDoc(applicationRef);
        if (applicationDoc.exists()) {
          const appData = applicationDoc.data();
          setApplicationStatus(appData.status);

          // Check for admin reviews at each stage
          const stages = ['state', 'district', 'grampanchayat'];
          for (let stage of stages) {
            const reviewRef = doc(db, 'adminReviews', `${userId}_${schemeId}_${stage}`);
            const reviewDoc = await getDoc(reviewRef);
            if (reviewDoc.exists()) {
              const reviewData = reviewDoc.data();
              if (reviewData.status === 'Rejected') {
                setApplicationMessage(reviewData.message);
                break;
              } else if (reviewData.status === 'Approved' && stage === 'grampanchayat') {
                setApplicationMessage('Application Completed');
                break;
              }
            }
          }
        }
      }
    };

    checkApplicationStatus();
  }, [schemes]);

  // Handle Apply button click
  const handleApplyClick = async (scheme) => {
    const userId = userName // Replace with actual user ID logic
    const schemeId = scheme.id;

    try {
      // Create a new application document in Firestore
      const applicationRef = doc(db, 'applications', `${userId}_${schemeId}`);
      await setDoc(applicationRef, {
        userId,
        schemeId,
        status: "Pending", // Status will be "Pending" initially
        appliedAt: new Date(),
      });

      alert("Your application has been submitted successfully!");

    } catch (error) {
      console.error('Error applying for the scheme:', error);
      alert("Failed to apply for the scheme.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="homepage">
        <h1>Welcome, {userName}!</h1>
        <p>Your agricultural funds application is in Progress.....</p>

        

        <div className="schemes-table">
          <h2>All Schemes</h2>
          {schemes.length > 0 ? (
            <table className="schemes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Documents Required</th>
                  <th>Registered Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme) => (
                  <tr key={scheme.id}>
                    <td>{scheme.id}</td>
                    <td>{scheme.title}</td>
                    <td>{scheme.description}</td>
                    <td>{scheme.amount}</td>
                    <td>{scheme.documents}</td>
                    <td>{scheme.registeredCount}</td>
                    <td>
                      <button onClick={() => handleApplyClick(scheme)}>Apply</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No schemes available at the moment.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Homepage;
