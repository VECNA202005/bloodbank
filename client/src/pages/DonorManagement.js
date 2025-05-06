import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DonorManagement = () => {
  const { user } = useAuth();
  const [donors, setDonors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donor');
      setDonors(res.data);
    } catch (err) {
      setDonors([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchDonors();
    // eslint-disable-next-line
  }, [user]);

  const startEdit = (donor) => {
    setEditingId(donor.id);
    setEditForm({
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      address: donor.address
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    await api.put(`/donor/${id}`, editForm);
    setEditingId(null);
    fetchDonors();
  };

  if (!user || user.role !== 'admin') return <div>Access denied.</div>;
  if (loading) return <div>Loading donors...</div>;

  return (
    <div className="donor-management-container">
      <h2>Donor Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Blood Group</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donors.map((donor) => (
            <tr key={donor.id}>
              <td>
                {editingId === donor.id ? (
                  <input name="name" value={editForm.name} onChange={handleEditChange} />
                ) : (
                  donor.name
                )}
              </td>
              <td>
                {editingId === donor.id ? (
                  <input name="bloodGroup" value={editForm.bloodGroup} onChange={handleEditChange} />
                ) : (
                  donor.bloodGroup
                )}
              </td>
              <td>
                {editingId === donor.id ? (
                  <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} />
                ) : (
                  donor.phone
                )}
              </td>
              <td>
                {editingId === donor.id ? (
                  <input name="address" value={editForm.address || ''} onChange={handleEditChange} />
                ) : (
                  donor.address
                )}
              </td>
              <td>{donor.email}</td>
              <td>
                {editingId === donor.id ? (
                  <>
                    <button onClick={() => saveEdit(donor.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(donor)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DonorManagement; 