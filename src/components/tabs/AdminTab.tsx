import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, checkSuperAdmin } from '../../lib/tauri';
import { useToast } from '../Toast';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  lastLoginAt: number | null;
  roles: string[];
}

const AdminTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [data, isSuper] = await Promise.all([
        getUsers(),
        checkSuperAdmin()
      ]);
      setUsers(data);
      setIsSuperAdminUser(isSuper);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (user: User) => {
    const isAdmin = user.roles.includes('admin');
    const action = isAdmin ? 'remove' : 'add';
    
    // Client-side check for better UX
    if (!isSuperAdminUser && (user.roles.includes('super_admin') || user.roles.includes('admin'))) {
       // Allow admins to manage other users but maybe restrict managing other admins?
       // The requirement says "Only super admins can manage admin roles".
       // So if I am not super admin, I cannot add/remove 'admin' role.
       // But this function toggles 'admin' role.
       // So if !isSuperAdminUser, I should not be able to call this.
       // But wait, if I am just an 'admin', can I see this tab? Yes.
       // Can I manage users? Yes.
       // Can I make others admin? No, only super admin.
       showToast('Only Super Admins can manage admin roles', 'error');
       return;
    }

    try {
      await updateUserRole(user.id, 'admin', action);
      showToast(`User ${user.name} is ${action === 'add' ? 'now' : 'no longer'} an admin`, 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleToggleSuperAdmin = async (user: User) => {
    if (!isSuperAdminUser) return;
    
    const isSuper = user.roles.includes('super_admin');
    const action = isSuper ? 'remove' : 'add';

    try {
      await updateUserRole(user.id, 'super_admin', action);
      showToast(`User ${user.name} is ${action === 'add' ? 'now' : 'no longer'} a Super Admin`, 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update super admin role', 'error');
    }
  };

  if (loading) return <div className="tab-loader"><div className="spinner"></div><p>Loading Users...</p></div>;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>👥 User Management {isSuperAdminUser && <span className="badge badge-warning">Super Admin Mode</span>}</h2>
        <button className="btn-secondary" onClick={fetchUsers}>🔄 Refresh</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-'}</td>
                <td>
                  {user.roles.map(role => (
                    <span key={role} className={`badge ${role === 'super_admin' ? 'badge-warning' : 'badge-primary'}`} style={{ marginRight: '5px' }}>
                      {role}
                    </span>
                  ))}
                </td>
                <td>
                  <div className="action-buttons">
                    {isSuperAdminUser && (
                      <>
                        <button 
                          className={`btn-sm ${user.roles.includes('admin') ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleToggleAdmin(user)}
                        >
                          {user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button 
                          className={`btn-sm ${user.roles.includes('super_admin') ? 'btn-danger' : 'btn-warning'}`}
                          onClick={() => handleToggleSuperAdmin(user)}
                          style={{ marginLeft: '5px' }}
                        >
                          {user.roles.includes('super_admin') ? 'Remove Super' : 'Make Super'}
                        </button>
                      </>
                    )}
                    {!isSuperAdminUser && (
                      <span className="text-muted">View Only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTab;
