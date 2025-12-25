import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import userService from '../../services/userService';
import { ApiUser, UserRole } from '../../types/user';

const DeactivatedUsers: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reactivateConfirm, setReactivateConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });

  // Fetch deactivated users from API
  const fetchDeactivatedUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getDeactivatedUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch deactivated users:', error);
      addToast('error', 'Failed to fetch deactivated users');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDeactivatedUsers();
  }, [fetchDeactivatedUsers]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReactivate = async () => {
    try {
      const response = await userService.reactivateUser(reactivateConfirm.id);
      if (response.success) {
        addToast('success', 'User reactivated successfully');
        fetchDeactivatedUsers();
      } else {
        addToast('error', response.error?.message || 'Failed to reactivate user');
      }
    } catch (error) {
      console.error('Failed to reactivate user:', error);
      addToast('error', 'Failed to reactivate user');
    } finally {
      setReactivateConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  // Format role for display
  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').split(' ').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={reactivateConfirm.isOpen}
        onClose={() => setReactivateConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleReactivate}
        title="Reactivate User"
        message={`Are you sure you want to reactivate "${reactivateConfirm.name}"? They will regain access to the system.`}
        confirmText="Reactivate"
        type="warning"
      />

      <div className="flex flex-col gap-1">
        <button onClick={() => navigate('/users')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deactivated Users</h1>
        <p className="text-sm text-gray-500">View and manage deactivated user accounts ({users.length} total)</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full group">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
          <input
            type="text"
            placeholder="Search deactivated users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">User ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">User Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Email</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Designation</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
                    <span className="text-gray-500">Loading deactivated users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">person_check</span>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">No deactivated users</h3>
                  <p className="text-sm text-gray-400">All users are currently active</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{user.displayId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">person_off</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.designation?.title || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setReactivateConfirm({ isOpen: true, id: user.id, name: user.username })}
                        className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Reactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600">info</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">Note about deactivated users</p>
            <p className="text-sm text-yellow-700 mt-1">
              Deactivated users cannot log in or access any system features. Reactivating a user will restore their previous role and permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeactivatedUsers;
