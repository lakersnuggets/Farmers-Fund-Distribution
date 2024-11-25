// import React, { useState, useEffect } from 'react';
// import { db } from './firebase';
// import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';

// function GrampanchayatPage() {
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Real-time listener for applications pending Grampanchayat approval
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
//       const grampanchayatApplications = snapshot.docs
//         .map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }))
//         .filter(
//           (app) =>
//             app.status_District === 'Approved' && app.status_Grampanchayat === 'Pending'
//         );
//       setApplications(grampanchayatApplications);
//       setLoading(false); // Set loading to false after fetching
//     });

//     return () => unsubscribe(); // Cleanup on unmount
//   }, []);

//   const handleApprove = async (applicationId) => {
//     try {
//       const appRef = doc(db, 'applications', applicationId);
//       await updateDoc(appRef, { status_Grampanchayat: 'Approved' });
//       alert('Application approved by Grampanchayat!');
//     } catch (error) {
//       console.error('Error approving application: ', error);
//       alert('Failed to approve application.');
//     }
//   };

//   const handleReject = async (applicationId) => {
//     try {
//       const appRef = doc(db, 'applications', applicationId);
//       await updateDoc(appRef, { status_Grampanchayat: 'Rejected' });
//       alert('Application rejected by Grampanchayat!');
//     } catch (error) {
//       console.error('Error rejecting application: ', error);
//       alert('Failed to reject application.');
//     }
//   };

//   return (
//     <div>
//       <h1>Grampanchayat Admin Page</h1>
//       <h3>Applications Pending for Grampanchayat Approval</h3>
//       {loading ? (
//         <p>Loading applications...</p>
//       ) : (
//         <ul>
//           {applications.length === 0 ? (
//             <p>No applications pending for Grampanchayat approval.</p>
//           ) : (
//             applications.map((app) => (
//               <li key={app.id}>
//                 <div>
//                   <strong>User ID:</strong> {app.userId} <br />
//                   <strong>Scheme:</strong> {app.schemeId} <br />
//                   <strong>Status:</strong> {app.status_Grampanchayat} <br />
//                   <button onClick={() => handleApprove(app.id)}>Approve</button>
//                   <button onClick={() => handleReject(app.id)}>Reject</button>
//                 </div>
//               </li>
//             ))
//           )}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default GrampanchayatPage;




















import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';

function GrampanchayatPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for applications pending Grampanchayat approval
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const grampanchayatApplications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (app) =>
            app.status_District === 'Approved' && app.status === 'Pending' // Adjusted to match schema
        );
      setApplications(grampanchayatApplications);
      setLoading(false); // Set loading to false after fetching
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleApprove = async (applicationId) => {
    try {
      const appRef = doc(db, 'applications', applicationId);
      await updateDoc(appRef, { status: 'Approved' }); // Updated to reflect schema
      alert('Application approved by Grampanchayat!');
    } catch (error) {
      console.error('Error approving application: ', error);
      alert('Failed to approve application.');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const appRef = doc(db, 'applications', applicationId);
      await updateDoc(appRef, { status: 'Rejected' }); // Updated to reflect schema
      alert('Application rejected by Grampanchayat!');
    } catch (error) {
      console.error('Error rejecting application: ', error);
      alert('Failed to reject application.');
    }
  };

  return (
    <div>
      <h1>Grampanchayat Admin Page</h1>
      <h3>Applications Pending for Grampanchayat Approval</h3>
      {loading ? (
        <p>Loading applications...</p>
      ) : (
        <ul>
          {applications.length === 0 ? (
            <p>No applications pending for Grampanchayat approval.</p>
          ) : (
            applications.map((app) => (
              <li key={app.id}>
                <div>
                  <strong>User ID:</strong> {app.userId} <br />
                  <strong>Scheme:</strong> {app.schemeId} <br />
                  <strong>Status:</strong> {app.status} <br /> {/* Adjusted to reflect schema */}
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

export default GrampanchayatPage;
