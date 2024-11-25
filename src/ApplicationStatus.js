import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';

function ApplicationStatus() {
  const userId = "user123"; // Replace with actual user logic
  const schemeId = "schemeA"; // Replace with actual scheme ID logic
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      const appRef = doc(db, 'applications', `${userId}_${schemeId}`);
      const appDoc = await getDoc(appRef);

      if (appDoc.exists()) {
        setStatus(appDoc.data().status);
      }

      // Check status at each stage (State, District, Grampanchayat)
      const stages = ['state', 'district', 'grampanchayat'];
      for (let stage of stages) {
        const reviewRef = doc(db, 'adminReviews', `${userId}_${schemeId}_${stage}`);
        const reviewDoc = await getDoc(reviewRef);
        if (reviewDoc.exists()) {
          const reviewData = reviewDoc.data();
          if (reviewData.status === 'Rejected') {
            setMessage(reviewData.message);
            break;
          } else if (reviewData.status === 'Approved' && stage === 'grampanchayat') {
            setMessage('Application Completed');
            break;
          }
        }
      }
    };

    fetchStatus();
  }, [userId, schemeId]);

  return (
    <div>
      <h1>Your Application Status</h1>
      <p>Status: {status}</p>
      {message && <p>Message: {message}</p>}
    </div>
  );
}

export default ApplicationStatus;
