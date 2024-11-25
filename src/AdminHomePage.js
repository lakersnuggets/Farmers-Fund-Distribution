import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './App.css';

function AdminHomePage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState('');
  const [applications, setApplications] = useState([]);

  // Fetch schemes
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'schemes'));
        const schemesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchemes(schemesList);
      } catch (error) {
        console.error('Error fetching schemes: ', error);
      }
    };
    fetchSchemes();
  }, []);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'applications'));
        const applicationList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(applicationList);
      } catch (error) {
        console.error('Error fetching applications: ', error);
      }
    };
    fetchApplications();
  }, []);

  const handleEditClick = (scheme) => {
    setSelectedScheme(scheme);
    setTitle(scheme.title);
    setDescription(scheme.description);
    setAmount(scheme.amount);
    setDocuments(scheme.documents);
  };

  const handleSave = async () => {
    if (selectedScheme) {
      try {
        const schemeRef = doc(db, 'schemes', selectedScheme.id);
        await updateDoc(schemeRef, { amount: parseInt(amount, 10), title, description, documents });
        const updatedSchemes = schemes.map((scheme) =>
          scheme.id === selectedScheme.id
            ? { ...scheme, amount: parseInt(amount, 10), title, description, documents }
            : scheme
        );
        setSchemes(updatedSchemes);
        alert('Scheme updated successfully!');
      } catch (error) {
        console.error('Error updating scheme: ', error);
        alert('Failed to update scheme.');
      }
    }
  };

  const handleAddNewScheme = async () => {
    try {
      const newScheme = {
        title,
        description,
        amount: parseInt(amount, 10),
        documents,
        registeredCount: 0, // Initialize registered count
      };

      const docRef = await addDoc(collection(db, 'schemes'), newScheme);

      const schemeWithId = { ...newScheme, docId: docRef.id };
      await updateDoc(docRef, { docId: docRef.id });

      setSchemes([
        ...schemes,
        { id: docRef.id, ...schemeWithId },
      ]);

      setTitle('');
      setDescription('');
      setAmount('');
      setDocuments('');
      alert('New scheme added successfully!');
    } catch (error) {
      console.error('Error adding scheme: ', error);
      alert('Failed to add new scheme.');
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    try {
      const schemeRef = doc(db, 'schemes', schemeId);
      await deleteDoc(schemeRef);
      setSchemes(schemes.filter((scheme) => scheme.id !== schemeId));
      alert('Scheme deleted successfully!');
    } catch (error) {
      console.error('Error deleting scheme: ', error);
      alert('Failed to delete scheme.');
    }
  };

  const handleApproveApplication = async (applicationId, currentApprovalLevel) => {
    try {
      console.log('Approving application:', applicationId, 'at level:', currentApprovalLevel);

      const appRef = doc(db, 'applications', applicationId);

      // Define the next approval level and fields to update
      let nextApprovalLevel = '';
      let updateFields = {};

      if (currentApprovalLevel === 'Admin') {
        nextApprovalLevel = 'State';
        updateFields = {
          approvalLevel: nextApprovalLevel,
          status_Admin: 'Approved',
          status_State: 'Pending',
        };
      } else if (currentApprovalLevel === 'State') {
        nextApprovalLevel = 'District';
        updateFields = {
          approvalLevel: nextApprovalLevel,
          status_State: 'Approved',
          status_District: 'Pending',
        };
      } else if (currentApprovalLevel === 'District') {
        nextApprovalLevel = 'Grampanchayat';
        updateFields = {
          approvalLevel: nextApprovalLevel,
          status_District: 'Approved',
          status_Grampanchayat: 'Pending',
        };
      } else if (currentApprovalLevel === 'Grampanchayat') {
        updateFields = {
          approvalLevel: 'Completed',
          status_Grampanchayat: 'Approved',
          status: 'Completed',
        };
      }

      console.log('Updating document with fields:', updateFields);

      // Update Firestore document
      await updateDoc(appRef, updateFields);

      alert(`${currentApprovalLevel} approved the application!`);
      if (nextApprovalLevel) {
        alert(`The application is now awaiting approval from the ${nextApprovalLevel}.`);
      } else {
        alert('The application process is now complete!');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert(`Failed to approve application at ${currentApprovalLevel}.`);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      console.log('Rejecting application:', applicationId);

      const appRef = doc(db, 'applications', applicationId);

      // Update Firestore document
      await updateDoc(appRef, {
        status: 'Rejected',
        approvalLevel: 'Rejected',
      });

      alert('Application rejected successfully!');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application.');
    }
  };

  return (
    <div className="admin-home-page">
      <header>
        <h1>Farmers Fund Distribution</h1>
      </header>
      <p>Helping farmers access government schemes to improve their livelihoods.</p>
      <div className="content">
        {/* Schemes Table */}
        <div className="schemes-table">
          <h2>All Schemes</h2>
          <table>
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
                    <button onClick={() => handleEditClick(scheme)}>Edit</button>
                    <button onClick={() => handleDeleteScheme(scheme.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit/Add Scheme Form */}
        <div className="edit-form">
          <h2>{selectedScheme ? 'Edit Scheme' : 'Add New Scheme'}</h2>
          <form>
            <label>Scheme Name:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter scheme title"
            />

            <label>Scheme Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter scheme description"
            />

            <label>Documents Required (comma-separated):</label>
            <input
              type="text"
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
              placeholder="e.g., Aadhar card, Bank details"
            />

            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter scheme amount"
            />

            <div>
              {selectedScheme ? (
                <button type="button" onClick={handleSave}>
                  Save Changes
                </button>
              ) : (
                <button type="button" onClick={handleAddNewScheme}>
                  Add New Scheme
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Applications Section */}
        <div className="applications-section">
          <h2>Applications for Schemes</h2>
          <ul>
            {applications.map((app) => (
              <li key={app.id}>
                <div>
                  <strong>User ID:</strong> {app.userId}
                  <br />
                  <strong>Scheme:</strong> {app.schemeId}
                  <br />
                  <strong>Status:</strong> {app.status_Admin}
                  <br />
                  <button onClick={() => handleApproveApplication(app.id, 'Admin')}>
                    Approve (Admin)
                  </button>
                  <button onClick={() => handleRejectApplication(app.id)}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
