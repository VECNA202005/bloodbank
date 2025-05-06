import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentInventory, setRecentInventory] = useState([]);
  const [recentDonors, setRecentDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data sequentially to better handle errors
        try {
          const summaryRes = await api.get('/admin/summary');
          setSummary(summaryRes.data);
        } catch (err) {
          console.error('Error fetching summary:', err);
          throw new Error('Failed to load summary data');
        }

        try {
          const reqRes = await api.get('/admin/activity/requests');
          setRecentRequests(reqRes.data);
        } catch (err) {
          console.error('Error fetching requests:', err);
          throw new Error('Failed to load recent requests');
        }

        try {
          const invRes = await api.get('/admin/activity/inventory');
          setRecentInventory(invRes.data);
        } catch (err) {
          console.error('Error fetching inventory:', err);
          throw new Error('Failed to load inventory data');
        }

        try {
          const donorRes = await api.get('/admin/activity/donors');
          setRecentDonors(donorRes.data);
        } catch (err) {
          console.error('Error fetching donors:', err);
          throw new Error('Failed to load donor data');
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message || 'Failed to load admin dashboard data. Please try again.');
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, logout]);

  if (!user || user.role !== 'admin') {
    return <div>Access denied. Redirecting to login...</div>;
  }

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Summary</h3>
        <ul>
          <li>Total Donors: {summary?.donorCount || 0}</li>
          <li>Total Requests: {summary?.requests?.total || 0}</li>
          <li>Pending Requests: {summary?.requests?.pending || 0}</li>
          <li>Approved Requests: {summary?.requests?.approved || 0}</li>
          <li>Rejected Requests: {summary?.requests?.rejected || 0}</li>
          <li>Completed Requests: {summary?.requests?.completed || 0}</li>
        </ul>
        <h4>Blood Inventory</h4>
        <ul>
          {summary?.inventory?.map((item) => (
            <li key={item.bloodGroup}>{item.bloodGroup}: {item.quantity} units</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Recent Blood Requests</h3>
        <ul>
          {recentRequests.map((r) => (
            <li key={r.id}>
              {r.patientName} ({r.bloodGroup}, {r.quantity} units) - {r.status} by {r.User?.name || 'Unknown'}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Recent Inventory Updates</h3>
        <ul>
          {recentInventory.map((i) => (
            <li key={i.bloodGroup}>{i.bloodGroup}: {i.quantity} units (last updated: {new Date(i.updatedAt).toLocaleString()})</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Recent Donor Registrations</h3>
        <ul>
          {recentDonors.map((d) => (
            <li key={d.id}>{d.name} ({d.email}) - Registered: {new Date(d.createdAt).toLocaleString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPanel; 