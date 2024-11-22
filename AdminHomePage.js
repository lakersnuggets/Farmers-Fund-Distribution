import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
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

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'schemes'));
        const schemesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchemes(schemesList);
      } catch (error) {
        console.error("Error fetching schemes: ", error);
      }
    };

    fetchSchemes();
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
        console.error("Error updating scheme: ", error);
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

      // Add a new document to Firestore
      const docRef = await addDoc(collection(db, 'schemes'), newScheme);

      // Update the document to include docId
      const schemeWithId = { ...newScheme, docId: docRef.id };
      await updateDoc(docRef, { docId: docRef.id });

      // Update the state with the new scheme
      setSchemes([
        ...schemes,
        { id: docRef.id, ...schemeWithId },
      ]);

      // Reset the form
      setTitle('');
      setDescription('');
      setAmount('');
      setDocuments('');
      alert('New scheme added successfully!');
    } catch (error) {
      console.error("Error adding scheme: ", error);
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
      console.error("Error deleting scheme: ", error);
      alert('Failed to delete scheme.');
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Scheme Form */}
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
      </div>
    </div>
  );
}

export default AdminHomePage;
