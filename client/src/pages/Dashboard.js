import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch blood inventory
        const inventoryResponse = await api.get('/inventory');
        setInventory(inventoryResponse.data);

        // Fetch blood requests
        const requestsResponse = await api.get('/requests');
        setRequests(requestsResponse.data);

        setLoading(false);
      } catch (error) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}</h1>
      
      <div className="dashboard-section">
        <h2>Blood Inventory</h2>
        <div className="inventory-grid">
          {inventory.map(item => (
            <div key={item.bloodGroup} className="inventory-item">
              <h3>{item.bloodGroup}</h3>
              <p>Quantity: {item.quantity} units</p>
              <p>Last Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Blood Requests</h2>
        <div className="requests-list">
          {requests.map(request => (
            <div key={request._id} className="request-item">
              <h3>{request.patientName}</h3>
              <p>Blood Group: {request.bloodGroup}</p>
              <p>Quantity: {request.quantity} units</p>
              <p>Hospital: {request.hospital}</p>
              <p>Status: <span className={`status-${request.status}`}>{request.status}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 