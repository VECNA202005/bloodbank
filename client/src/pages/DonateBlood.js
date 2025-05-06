import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const DonateBlood = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodGroup: '',
    quantity: 1
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Please log in to donate blood');
      }

      const response = await api.post(`/donor/${user.id}/donate`, {
        bloodGroup: formData.bloodGroup,
        quantity: parseInt(formData.quantity)
      });

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-donations');
        }, 2000);
      }
    } catch (err) {
      console.error('Donation error:', err);
      if (err.response?.status === 401) {
        setError('Please log in to donate blood');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to make this donation');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid donation data');
      } else {
        setError(err.response?.data?.message || 'Failed to record donation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h1>Donate Blood</h1>
        <div className="error-message">Please log in to donate blood</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Donate Blood</h1>
      {success ? (
        <div className="success-message">
          <p>Donation recorded successfully! Redirecting to your donation history...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="donation-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity (Units)</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max="2"
              required
            />
            <small>Maximum 2 units per donation</small>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Recording Donation...' : 'Record Donation'}
          </button>
        </form>
      )}
    </div>
  );
};

export default DonateBlood; 