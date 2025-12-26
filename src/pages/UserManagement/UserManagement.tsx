import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import userService from '../../services/userService';
import { ApiUser, UserRole } from '../../types/user';

type SortField = 'username' | 'email' | 'role' | 'designation';
type SortOrder = 'asc' | 'desc';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  // State for users from API
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers({
        page: currentPage,
        limit,
        role: roleFilter || undefined,
        status: 'ACTIVE',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      addToast('error', 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, roleFilter, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by search term (client-side filtering)
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'username') {
      comparison = a.username.localeCompare(b.username);
    } else if (sortField === 'email') {
      comparison = a.email.localeCompare(b.email);
    } else if (sortField === 'role') {
      comparison = a.role.localeCompare(b.role);
    } else if (sortField === 'designation') {
      comparison = (a.designation?.title || '').localeCompare(b.designation?.title || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`material-symbols-outlined text-sm ml-1 ${sortField === field ? 'text-primary-600' : 'text-gray-400'}`}>
      {sortField === field ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
    </span>
  );

  // Handle deactivate user
  const handleDelete = async () => {
    try {
      const response = await userService.deactivateUser(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'User deactivated successfully');
        fetchUsers();
      } else {
        addToast('error', response.error?.message || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      addToast('error', 'Failed to deactivate user');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  const handleBulkUpload = () => {
    addToast('info', 'Bulk upload feature coming soon');
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'TRAINER':
        return 'secondary';
      case 'PROGRAM_COORDINATOR':
        return 'warning';
      default:
        return 'neutral';
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
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${deleteConfirm.name}"? They can be reactivated later.`}
        confirmText="Deactivate"
        type="danger"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users and permissions ({totalUsers} total)</p>
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
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | '');
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none text-sm font-medium focus:border-primary-700"
            >
              <option value="">Role: All</option>
              <option value="ADMIN">Admin</option>
              <option value="TRAINER">Trainer</option>
              <option value="PROGRAM_COORDINATOR">Program Coordinator</option>
              <option value="STUDENT">Student</option>
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">User ID</th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('username')}
                >
                  <span className="flex items-center">User Name<SortIcon field="username" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('designation')}
                >
                  <span className="flex items-center">Designation<SortIcon field="designation" /></span>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Reporting Manager</th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('email')}
                >
                  <span className="flex items-center">Email<SortIcon field="email" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('role')}
                >
                  <span className="flex items-center">Role<SortIcon field="role" /></span>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
                      <span className="text-gray-500">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || roleFilter ? 'No users found matching your search.' : 'No active users. Add your first user.'}
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {user.displayId}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {user.designation?.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {user.manager?.username || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {formatRole(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                          title="Edit user"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: user.id, name: user.username })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Deactivate user"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
