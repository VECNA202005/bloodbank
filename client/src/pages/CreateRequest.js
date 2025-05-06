import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/requests', {
        ...form,
        quantity: Number(form.quantity),
        requestedBy: user.id
      });
      setSuccess('Request submitted successfully!');
      setTimeout(() => navigate('/my-requests'), 1200);
    } catch (err) {
      setError('Failed to submit request.');
    }
    setLoading(false);
  };

  return (
    <div className="create-request-container">
      <h2>Request Blood</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Patient Name</label>
          <input name="patientName" value={form.patientName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Blood Group</label>
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
            <option value="">Select</option>
            {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Quantity (units)</label>
          <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Hospital</label>
          <input name="hospitalName" value={form.hospitalName} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
      </form>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
};

export default CreateRequest; 