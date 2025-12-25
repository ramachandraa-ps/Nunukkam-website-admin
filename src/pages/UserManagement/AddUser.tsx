import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import userService from '../../services/userService';
import designationService, { Designation } from '../../services/designationService';
import { ApiUser, UserRole } from '../../types/user';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useStore();
  const isEditing = !!id;

  // State for API data
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [managers, setManagers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    designationId: '',
    role: '' as UserRole | '',
    managerId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch designations and managers
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch designations
      const designationResponse = await designationService.getDesignations();
      if (designationResponse.success && designationResponse.data) {
        setDesignations(designationResponse.data.designations);
      }

      // Fetch potential managers (ADMIN and PROGRAM_COORDINATOR)
      const managersResponse = await userService.getUsers({
        status: 'ACTIVE',
        limit: 100,
      });
      if (managersResponse.success && managersResponse.data) {
        const potentialManagers = managersResponse.data.users.filter(
          u => u.role === 'ADMIN' || u.role === 'PROGRAM_COORDINATOR'
        );
        setManagers(potentialManagers);
      }

      // If editing, fetch user details
      if (isEditing && id) {
        const userResponse = await userService.getUserById(id);
        if (userResponse.success && userResponse.data) {
          const user = userResponse.data.user;
          setFormData({
            username: user.username,
            email: user.email,
            password: '', // Don't show password
            phoneNumber: user.phoneNumber.replace('+91', ''),
            designationId: user.designationId || '',
            role: user.role,
            managerId: user.managerId || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      addToast('error', 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditing, addToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!isEditing && !formData.password.trim()) newErrors.password = 'Password is required';
    else if (!isEditing && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone must be 10 digits';

    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        // Update user - only send allowed fields
        const updateData: { designationId?: string; managerId?: string } = {};
        if (formData.designationId) updateData.designationId = formData.designationId;
        if (formData.managerId) updateData.managerId = formData.managerId;

        const response = await userService.updateUser(id, updateData);
        if (response.success) {
          addToast('success', 'User updated successfully');
          navigate('/users');
        } else {
          addToast('error', response.error?.message || 'Failed to update user');
        }
      } else {
        // Create new user
        const createData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: `+91${formData.phoneNumber}`,
          role: formData.role as UserRole,
          designationId: formData.designationId || undefined,
          managerId: formData.managerId || undefined,
        };

        const response = await userService.createUser(createData);
        if (response.success) {
          addToast('success', 'User created successfully');
          navigate('/users');
        } else {
          addToast('error', response.error?.message || 'Failed to create user');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save user:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/users')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit User' : 'Add New User'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditing ? 'Update user details.' : 'Fill in the details to create a new user.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Enter username (min 3 chars)"
              disabled={isEditing}
              className={`w-full px-4 py-2.5 border ${errors.username ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.username && <span className="text-xs text-red-500 mt-1">{errors.username}</span>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
              disabled={isEditing}
              className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password - only show when creating */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter password (min 8 chars)"
                className={`w-full px-4 py-2.5 border ${errors.password ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
              />
              {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password}</span>}
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="flex">
              <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl text-sm text-gray-500">+91</span>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter phone number"
                disabled={isEditing}
                className={`flex-1 px-4 py-2.5 border ${errors.phoneNumber ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-r-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.phoneNumber && <span className="text-xs text-red-500 mt-1">{errors.phoneNumber}</span>}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Designation
            </label>
            <select
              value={formData.designationId}
              onChange={(e) => handleChange('designationId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            >
              <option value="">Select designation</option>
              {designations.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              disabled={isEditing}
              className={`w-full px-4 py-2.5 border ${errors.role ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select role</option>
              <option value="ADMIN">Admin</option>
              <option value="TRAINER">Trainer</option>
              <option value="PROGRAM_COORDINATOR">Program Coordinator</option>
              <option value="STUDENT">Student</option>
            </select>
            {errors.role && <span className="text-xs text-red-500 mt-1">{errors.role}</span>}
          </div>

          {/* Reporting Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Reporting Manager
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => handleChange('managerId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            >
              <option value="">Select manager</option>
              {managers.filter(m => m.id !== id).map(m => (
                <option key={m.id} value={m.id}>{m.username} ({m.email})</option>
              ))}
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-600">info</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Note about editing</p>
              <p className="text-sm text-yellow-700 mt-1">
                Username, email, phone, and role cannot be changed after creation. You can only update the designation and reporting manager.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/users')}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditing ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
