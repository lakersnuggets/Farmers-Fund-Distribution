// import React, { useState, useEffect } from 'react';
// import { db } from './firebase';
// import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// function StatePage() {
//   const [applications, setApplications] = useState([]);

//   useEffect(() => {
//     const fetchApplications = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, 'applications'));
//         const stateApplications = querySnapshot.docs
//           .map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }))
//           .filter((app) => app.status_Admin === 'Approved' && app.status_State === 'Pending');
//         setApplications(stateApplications);
//       } catch (error) {
//         console.error('Error fetching applications: ', error);
//       }
//     };

//     fetchApplications();
//   }, []);

//   const handleApprove = async (applicationId) => {
//     try {
//       const appRef = doc(db, 'applications', applicationId);
//       await updateDoc(appRef, { status_State: 'Approved' });
//       alert('Application approved by State!');
//       setApplications(applications.filter((app) => app.id !== applicationId)); // Remove approved app from list
//     } catch (error) {
//       console.error('Error approving application: ', error);
//       alert('Failed to approve application.');
//     }
//   };

//   const handleReject = async (applicationId) => {
//     try {
//       const appRef = doc(db, 'applications', applicationId);
//       await updateDoc(appRef, { status_State: 'Rejected' });
//       alert('Application rejected by State!');
//       setApplications(applications.filter((app) => app.id !== applicationId)); // Remove rejected app from list
//     } catch (error) {
//       console.error('Error rejecting application: ', error);
//       alert('Failed to reject application.');
//     }
//   };

//   return (
//     <div>
//       <h1>State Admin Page</h1>
//       <h3>Applications Pending for State Approval</h3>
//       <ul>
//         {applications.map((app) => (
//           <li key={app.id}>
//             <div>
//               <strong>User ID:</strong> {app.userId} <br />
//               <strong>Scheme:</strong> {app.schemeTitle} <br />
//               <strong>Status:</strong> {app.status_Admin} <br />
//               <button onClick={() => handleApprove(app.id)}>Approve</button>
//               <button onClick={() => handleReject(app.id)}>Reject</button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default StatePage;


























import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

function StatePage() {
  const [applications, setApplications] = useState([]);

  // Real-time listener for applications pending State approval
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const stateApplications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (app) =>
            app.approvalLevel === 'State' && // Only applications currently at the State level
            app.status_State === 'Pending' // Filter for pending State approvals
        );
      setApplications(stateApplications);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const handleApprove = async (applicationId) => {
    try {
      console.log(`Approving application with ID: ${applicationId}`);
      const appRef = doc(db, 'applications', applicationId);

      // Update the document to mark State as Approved and move to the next level
      await updateDoc(appRef, {
        status_State: 'Approved',
        approvalLevel: 'District', // Move to the next level (District)
        status_District: 'Pending', // Prepare District status for processing
      });

      alert('Application approved by State!');
    } catch (error) {
      console.error('Error approving application: ', error);
      alert('Failed to approve application.');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      console.log(`Rejecting application with ID: ${applicationId}`);
      const appRef = doc(db, 'applications', applicationId);

      // Update the document to mark State as Rejected and stop further processing
      await updateDoc(appRef, {
        status_State: 'Rejected',
        approvalLevel: 'Rejected', // Set approvalLevel to Rejected
        status: 'Rejected', // Update overall status to Rejected
      });

      alert('Application rejected by State!');
    } catch (error) {
      console.error('Error rejecting application: ', error);
      alert('Failed to reject application.');
    }
  };

  return (
    <div>
      <h1>State Admin Page</h1>
      <h3>Applications Pending for State Approval</h3>
      <ul>
        {applications.length === 0 ? (
          <p>No applications pending for State approval.</p>
        ) : (
          applications.map((app) => (
            <li key={app.id}>
              <div>
                <strong>User ID:</strong> {app.userId} <br />
                <strong>Scheme ID:</strong> {app.schemeId} <br />
                <strong>Overall Status:</strong> {app.status} <br />
                <strong>State Status:</strong> {app.status_State} <br />
                <button onClick={() => handleApprove(app.id)}>Approve</button>
                <button onClick={() => handleReject(app.id)}>Reject</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default StatePage;
