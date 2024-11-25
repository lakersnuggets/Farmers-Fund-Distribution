import React, { useState } from 'react';
import { db, auth, storage } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Authentication({ setIsAdmin, setUserRole }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhar: '',
    landImage: null,
    file712: null,
    address: '',
    pincode: '',
    bankAccountNo: '',
    ifsc: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'phone' && value.length > 10) return;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validateFiles = () => {
    const { file712, landImage } = formData;
    if (!file712 || !landImage) {
      toast.error("Please upload both required files.");
      return false;
    }
    if (file712.size > 2 * 1024 * 1024 || landImage.size > 2 * 1024 * 1024) {
      toast.error("Files must be smaller than 2MB.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { name, email, phone, aadhar, file712, landImage, address, pincode, bankAccountNo, ifsc, password } = formData;

    try {
      if (isRegister) {
        // Validate files before proceeding with registration
        if (!validateFiles()) {
          setLoading(false);
          return;
        }

        // Register user
        await createUserWithEmailAndPassword(auth, email, password);
        const sanitizedEmail = email.replace(/\./g, "_");

        // Upload files to Firebase Storage
        const file712Ref = ref(storage, `users/${sanitizedEmail}/7_12/${file712.name}`);
        const landImageRef = ref(storage, `users/${sanitizedEmail}/land_images/${landImage.name}`);

        await uploadBytes(file712Ref, file712);
        await uploadBytes(landImageRef, landImage);

        const file712URL = await getDownloadURL(file712Ref);
        const landImageURL = await getDownloadURL(landImageRef);

        // Store user data in Firestore
        await setDoc(doc(db, 'farmers', sanitizedEmail), {
          name,
          email,
          phone,
          aadhar,
          address,
          pincode,
          bankAccountNo,
          ifsc,
          file712URL,
          landImageURL,
        });

        toast.success("Registration successful!");
      } else {
        // Handle login for different roles
        let userRole = "";

        // Checking if the user is an admin or specific role
        if (email === 'admin@fpd' && password === 'admin') {
          userRole = "Admin";
        } else if (email === 'state@fds.com' && password === 'state@123') {
          userRole = "State Gov";
        } else if (email === 'taluka@fpd.com' && password === 'taluka@123') {
          userRole = "Taluka";
        } else if (email === 'district@fpd.com' && password === 'district@123') {
          userRole = "District";
        } else if (email === 'garmpanchayat@fpd.com' && password === 'grampanchyat@123') {
          userRole = "Grampanchayat";
        } else if (email === 'bank@fpd.com' && password === 'bank@123') {
          userRole = "Bank";
        }

        if (userRole) {
          // Admin roles, navigate to respective page
          toast.success(`${userRole} login successful!`);
          setIsAdmin(true);
          setUserRole(userRole);

          const rolePaths = {
            "Admin": "/adminhomepage",
            "State Gov": "/statehomepage",
            "Taluka": "/talukahomepage",
            "District": "/districthomepage",
            "Grampanchayat": "/grampanchayathomepage",
            "Bank": "/bankhomepage",
          };
          navigate(rolePaths[userRole]);
        } else {
          // Handle regular user login
          await signInWithEmailAndPassword(auth, email, password);
          const sanitizedEmail = email.replace(/\./g, "_");
          const userDoc = await getDoc(doc(db, 'farmers', sanitizedEmail));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            toast.success("Login successful!");
            setIsAdmin(false);
            navigate('/homepage', { state: { userName: userData.name } });
          } else {
            toast.error("User data not found!");
          }
        }
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="profile-placeholder.png" alt="User" className="auth-image" />
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              {/* Registration Fields */}
              <div className="form-group">
                <label>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input type="number" name="phone" value={formData.phone} onChange={handleChange} required minLength="10" maxLength="10" />
              </div>
              <div className="form-group">
                <label>Aadhar:</label>
                <input type="number" name="aadhar" value={formData.aadhar} onChange={handleChange} required minLength="12" maxLength="12" />
              </div>
              <div className="form-group">
                <label>7/12 Document:</label>
                <input type="file" name="file712" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Land Image:</label>
                <input type="file" name="landImage" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Pincode:</label>
                <input type="number" name="pincode" value={formData.pincode} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Bank A/c No:</label>
                <input type="number" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Bank IFSC Code:</label>
                <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} required />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="toggle-link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already a user? Login here' : 'New user? Register here'}
        </p>
      </div>
    </div>
  );
}

export default Authentication;
