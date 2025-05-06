import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const UserRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/requests/user/${user.id}`);
      setRequests(res.data);
    } catch (err) {
      setRequests([]);
    }
    setLoading(false);
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    await api.delete(`/requests/${id}`);
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [user]);

  if (loading) return <div>Loading your requests...</div>;

  return (
    <div className="user-requests-container">
      <h2>My Blood Requests</h2>
      {requests.length === 0 && <div>No requests found.</div>}
      <ul>
        {requests.map((r) => (
          <li key={r.id} style={{ margin: '10px 0', padding: 10, background: '#f8f9fa' }}>
            <span>
              {r.patientName} ({r.bloodGroup}, {r.quantity} units) - {r.status}
            </span>
            <span style={{ float: 'right', fontSize: 12, color: '#888' }}>{new Date(r.createdAt).toLocaleString()}</span>
            <br />
            <button onClick={() => deleteRequest(r.id)} style={{ marginTop: 5 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRequests; 