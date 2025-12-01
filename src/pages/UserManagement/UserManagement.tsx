import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { users, roles, deleteUser, addToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const activeUsers = users.filter(u => u.status === 'active');

  const filteredUsers = activeUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = () => {
    deleteUser(deleteConfirm.id);
    setDeleteConfirm({ isOpen: false, id: '' });
  };

  const handleBulkUpload = () => {
    addToast('info', 'Bulk upload feature coming soon');
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={handleDelete}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They can be reactivated later."
        confirmText="Deactivate"
        type="danger"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/users/roles')} icon="admin_panel_settings">
            Roles
          </Button>
          <Button variant="outline" onClick={() => navigate('/users/designations')} icon="badge">
            Designations
          </Button>
          <Button variant="outline" onClick={() => navigate('/users/deactivated')} icon="person_off">
            Deactivated
          </Button>
          <Button onClick={() => navigate('/users/add')} icon="add">
            Add User
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-gray-800">
          <div className="relative max-w-sm w-full">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="search"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none text-sm font-medium focus:border-primary-700"
            >
              <option value="">Role: All</option>
              {roles.map(role => (
                <option key={role.id} value={role.title}>{role.title}</option>
              ))}
            </select>
            <Button variant="outline" onClick={handleBulkUpload} icon="upload_file">
              Bulk Upload
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Sl.no</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">User Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Designation</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || roleFilter ? 'No users found matching your search.' : 'No active users. Add your first user.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{user.designation}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        user.role === 'Admin' ? 'primary' :
                          user.role === 'Trainer' ? 'secondary' : 'neutral'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: user.id })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined">person_off</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
