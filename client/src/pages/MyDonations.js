import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const MyDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user) return;
      
      try {
        const response = await api.get(`/donor/${user.id}/donations`);
        setDonations(response.data);
      } catch (err) {
        console.error('Error fetching donations:', err);
        setError(err.response?.data?.message || 'Failed to fetch donation history');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <h1>My Donation History</h1>
        <div className="error">Please log in to view your donation history</div>
      </div>
    );
  }

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <div className="container">
      <h1>My Donation History</h1>
      {donations.length === 0 ? (
        <p>You haven't made any donations yet.</p>
      ) : (
        <div className="donations-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Group</th>
                <th>Quantity (Units)</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td>{new Date(donation.date).toLocaleDateString()}</td>
                  <td>{donation.bloodGroup}</td>
                  <td>{donation.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyDonations; 