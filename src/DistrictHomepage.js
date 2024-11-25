
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';

function DistrictPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for applications pending District approval
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const districtApplications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (app) =>
            app.status_State === 'Approved' && app.status_District === 'Pending'
        );
      setApplications(districtApplications);
      setLoading(false); // Set loading to false after fetching
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleApprove = async (applicationId) => {
    try {
      const appRef = doc(db, 'applications', applicationId);
      await updateDoc(appRef, { status_District: 'Approved' });
      alert('Application approved by District!');
    } catch (error) {
      console.error('Error approving application: ', error);
      alert('Failed to approve application.');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const appRef = doc(db, 'applications', applicationId);
      await updateDoc(appRef, { status_District: 'Rejected' });
      alert('Application rejected by District!');
    } catch (error) {
      console.error('Error rejecting application: ', error);
      alert('Failed to reject application.');
    }
  };

  return (
    <div>
      <h1>District Admin Page</h1>
      <h3>Applications Pending for District Approval</h3>
      {loading ? (
        <p>Loading applications...</p>
      ) : (
        <ul>
          {applications.length === 0 ? (
            <p>No applications pending for District approval.</p>
          ) : (
            applications.map((app) => (
              <li key={app.id}>
                <div>
                  <strong>User ID:</strong> {app.userId} <br />
                  <strong>Scheme:</strong> {app.schemeId} <br />
                  <strong>Status:</strong> {app.status_District} <br />
                  <button onClick={() => handleApprove(app.id)}>Approve</button>
                  <button onClick={() => handleReject(app.id)}>Reject</button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default DistrictPage;
