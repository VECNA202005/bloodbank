import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    bloodGroup: '',
    phone: '',
    address: '',
    password: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bloodGroup: user.bloodGroup || '',
        phone: user.phone || '',
        address: user.address || '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Debug user object
      console.log('Current user:', user);

      if (!user || !user.id) {
        setError('User information not found. Please try logging in again.');
        setLoading(false);
        return;
      }

      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;

      // Remove any undefined or null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });
      
      console.log('Sending update data:', updateData);
      
      // Use user.id for the API call
      const res = await api.put(`/donor/${user.id}`, updateData);
      
      // Update the user context with the fresh data
      if (typeof setUser === 'function') {
        setUser(res.data);
      } else {
        console.error('setUser is not a function:', setUser);
        setError('Failed to update user context. Please try logging in again.');
        return;
      }
      
      // Show success message
      setSuccess('Profile updated successfully!');
      
      // Reset form and exit edit mode
      setEditing(false);
      setForm(prev => ({ ...prev, password: '' }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.status === 403) {
        setError('You are not authorized to update this profile.');
      } else if (err.response?.status === 404) {
        setError('User profile not found. Please try logging in again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="user-profile-container">
      <h2 className="profile-title">My Profile</h2>
      {!editing ? (
        <div className="profile-view">
          <div className="profile-info">
            <div className="info-group">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="info-group">
              <label>Blood Group:</label>
              <span>{user.bloodGroup}</span>
            </div>
            <div className="info-group">
              <label>Phone:</label>
              <span>{user.phone || 'Not provided'}</span>
            </div>
            <div className="info-group">
              <label>Address:</label>
              <span>{user.address || 'Not provided'}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="edit-button" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <select 
              name="bloodGroup" 
              value={form.bloodGroup} 
              onChange={handleChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange}
              placeholder="Enter your phone number (10 digits)"
              pattern="[0-9]{10}"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input 
              name="address" 
              value={form.address} 
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep current password)</label>
            <input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange}
              placeholder="Enter new password (min 6 characters)"
              minLength="6"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setEditing(false);
                setForm(prev => ({ ...prev, password: '' }));
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default UserProfile; 