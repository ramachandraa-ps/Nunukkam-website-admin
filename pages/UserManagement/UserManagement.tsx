import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

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
          <button
            onClick={() => navigate('/users/roles')}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Roles
          </button>
          <button
            onClick={() => navigate('/users/designations')}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            Designations
          </button>
          <button
            onClick={() => navigate('/users/deactivated')}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_off</span>
            Deactivated
          </button>
          <button
            onClick={() => navigate('/users/add')}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:bg-primary-800 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined">add</span>
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-gray-800">
          <div className="relative max-w-sm w-full group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all text-sm"
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
            <button
              onClick={handleBulkUpload}
              className="px-4 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Bulk Upload
            </button>
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
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Trainer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
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
