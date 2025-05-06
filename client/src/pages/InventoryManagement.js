import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const InventoryManagement = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [editGroup, setEditGroup] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch (err) {
      setInventory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchInventory();
    // eslint-disable-next-line
  }, [user]);

  const startEdit = (group, quantity) => {
    setEditGroup(group);
    setEditQuantity(quantity);
  };

  const saveEdit = async (group) => {
    await api.put(`/inventory/${group}`, { quantity: Number(editQuantity) });
    setEditGroup(null);
    fetchInventory();
  };

  if (!user || user.role !== 'admin') return <div>Access denied.</div>;
  if (loading) return <div>Loading inventory...</div>;

  return (
    <div className="inventory-management-container">
      <h2>Inventory Management</h2>
      <table>
        <thead>
          <tr>
            <th>Blood Group</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.bloodGroup}>
              <td>{item.bloodGroup}</td>
              <td>
                {editGroup === item.bloodGroup ? (
                  <input
                    type="number"
                    min="0"
                    value={editQuantity}
                    onChange={e => setEditQuantity(e.target.value)}
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td>
                {editGroup === item.bloodGroup ? (
                  <>
                    <button onClick={() => saveEdit(item.bloodGroup)}>Save</button>
                    <button onClick={() => setEditGroup(null)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(item.bloodGroup, item.quantity)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryManagement; 