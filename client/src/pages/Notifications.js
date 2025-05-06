import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { userId: user.id } });
      setNotifications(res.data);
    } catch (err) {
      setNotifications([]);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [user]);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 && <div>No notifications.</div>}
      <ul>
        {notifications.map((n) => (
          <li key={n.id} style={{ background: n.read ? '#eee' : '#ffeeba', margin: '10px 0', padding: 10 }}>
            <span>{n.message}</span>
            {!n.read && (
              <button style={{ marginLeft: 10 }} onClick={() => markAsRead(n.id)}>
                Mark as read
              </button>
            )}
            <span style={{ float: 'right', fontSize: 12, color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications; 