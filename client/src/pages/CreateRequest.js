import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CreateRequest.css';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    quantity: 1,
    hospitalName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!form.patientName || !form.bloodGroup || !form.hospitalName) {
        throw new Error('Please fill in all required fields');
      }

      const response = await api.post('/requests', {
        ...form,
        quantity: Number(form.quantity)
      });

      if (response.data) {
        setSuccess('Request submitted successfully!');
        setTimeout(() => navigate('/my-requests'), 1200);
      }
    } catch (err) {
      console.error('Request submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-request-container">
        <h2>Create Blood Request</h2>
        <div className="error">Please log in to create a blood request</div>
      </div>
    );
  }

  return (
    <div className="create-request-container">
      <h2>Create Blood Request</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientName">Patient Name *</label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            value={form.patientName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group *</label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity (units) *</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hospitalName">Hospital Name *</label>
          <input
            type="text"
            id="hospitalName"
            name="hospitalName"
            value={form.hospitalName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default CreateRequest; 