import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, roles, designations, addUser, updateUser } = useStore();
  const isEditing = !!id;

  const managers = users.filter(u => u.status === 'active' && (u.role === 'Admin' || u.role === 'Coordinator'));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: '',
    reportingManager: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      const user = users.find(u => u.id === id);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          designation: user.designation,
          role: user.role,
          reportingManager: user.reportingManager,
        });
      }
    }
  }, [id, users, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (isEditing) {
        updateUser(id!, formData);
      } else {
        addUser(formData);
      }
      navigate('/users');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

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
              User Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter user name"
              className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
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
              className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="flex">
              <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl text-sm text-gray-500">+91</span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter phone number"
                className={`flex-1 px-4 py-2.5 border ${errors.phone ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-r-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
              />
            </div>
            {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Designation *
            </label>
            <select
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              className={`w-full px-4 py-2.5 border ${errors.designation ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            >
              <option value="">Select designation</option>
              {designations.map(d => (
                <option key={d.id} value={d.title}>{d.title}</option>
              ))}
            </select>
            {errors.designation && <span className="text-xs text-red-500 mt-1">{errors.designation}</span>}
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
              className={`w-full px-4 py-2.5 border ${errors.role ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            >
              <option value="">Select role</option>
              {roles.map(r => (
                <option key={r.id} value={r.title}>{r.title}</option>
              ))}
            </select>
            {errors.role && <span className="text-xs text-red-500 mt-1">{errors.role}</span>}
          </div>

          {/* Reporting Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Reporting Manager
            </label>
            <select
              value={formData.reportingManager}
              onChange={(e) => handleChange('reportingManager', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            >
              <option value="">Select manager</option>
              <option value="N/A">N/A (Top Level)</option>
              {managers.filter(m => m.id !== id).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
          >
            {isEditing ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
