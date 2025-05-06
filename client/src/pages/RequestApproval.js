import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RequestApproval = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.filter(r => r.status === 'pending'));
    } catch (err) {
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchRequests();
    // eslint-disable-next-line
  }, [user]);

  const updateStatus = async (id, status) => {
    await api.put(`/requests/${id}/status`, { status });
    fetchRequests();
  };

  if (!user || user.role !== 'admin') return <div>Access denied.</div>;
  if (loading) return <div>Loading pending requests...</div>;

  return (
    <div className="request-approval-container">
      <h2>Pending Blood Requests</h2>
      {requests.length === 0 && <div>No pending requests.</div>}
      <ul>
        {requests.map((r) => (
          <li key={r.id} style={{ margin: '10px 0', padding: 10, background: '#f8f9fa' }}>
            <span>
              {r.patientName} ({r.bloodGroup}, {r.quantity} units) - Requested by {r.User?.name || r.requestedBy}
            </span>
            <span style={{ float: 'right', fontSize: 12, color: '#888' }}>{new Date(r.createdAt).toLocaleString()}</span>
            <br />
            <button onClick={() => updateStatus(r.id, 'approved')} style={{ marginRight: 8 }}>Approve</button>
            <button onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestApproval; 