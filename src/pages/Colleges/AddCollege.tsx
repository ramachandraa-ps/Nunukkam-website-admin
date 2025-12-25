import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import collegeService from '../../services/collegeService';
import userService from '../../services/userService';
import { CreateCollegeRequest, UpdateCollegeRequest } from '../../types/college';
import { ApiUser } from '../../types/user';

const AddCollege: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useStore();
  const isEditing = !!id;

  const [coordinators, setCoordinators] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    affiliatedUniversity: '',
    city: '',
    state: '',
    fullAddress: '',
    pincode: '',
    pocName: '',
    pocNumber: '',
    programCoordinatorId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch program coordinators
      const usersResponse = await userService.getUsers({
        role: 'PROGRAM_COORDINATOR',
        status: 'ACTIVE',
        limit: 100,
      });
      if (usersResponse.success && usersResponse.data) {
        setCoordinators(usersResponse.data.users);
      }

      // If editing, fetch college data
      if (isEditing && id) {
        const collegeResponse = await collegeService.getCollegeById(id);
        if (collegeResponse.success && collegeResponse.data) {
          const college = collegeResponse.data.college;
          setFormData({
            name: college.name,
            affiliatedUniversity: college.affiliatedUniversity,
            city: college.city,
            state: college.state,
            fullAddress: college.fullAddress || '',
            pincode: college.pincode || '',
            pocName: college.pocName,
            pocNumber: college.pocNumber,
            programCoordinatorId: college.programCoordinatorId || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditing, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'College name must be at least 3 characters';
    }
    if (!formData.affiliatedUniversity.trim() || formData.affiliatedUniversity.length < 3) {
      newErrors.affiliatedUniversity = 'University must be at least 3 characters';
    }
    if (!formData.city.trim() || formData.city.length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }
    if (!formData.state.trim() || formData.state.length < 2) {
      newErrors.state = 'State must be at least 2 characters';
    }
    if (!formData.pocName.trim() || formData.pocName.length < 3) {
      newErrors.pocName = 'POC name must be at least 3 characters';
    }
    if (!formData.pocNumber.trim()) {
      newErrors.pocNumber = 'POC number is required';
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.pocNumber)) {
      newErrors.pocNumber = 'Please enter a valid phone number';
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        // Update college
        const updateData: UpdateCollegeRequest = {
          name: formData.name,
          affiliatedUniversity: formData.affiliatedUniversity,
          city: formData.city,
          state: formData.state,
          fullAddress: formData.fullAddress || undefined,
          pincode: formData.pincode || undefined,
          pocName: formData.pocName,
          pocNumber: formData.pocNumber,
          programCoordinatorId: formData.programCoordinatorId || undefined,
        };

        const response = await collegeService.updateCollege(id, updateData);
        if (response.success) {
          addToast('success', 'College updated successfully');
          navigate('/colleges');
        } else {
          addToast('error', response.error?.message || 'Failed to update college');
        }
      } else {
        // Create college
        const createData: CreateCollegeRequest = {
          name: formData.name,
          affiliatedUniversity: formData.affiliatedUniversity,
          city: formData.city,
          state: formData.state,
          fullAddress: formData.fullAddress || undefined,
          pincode: formData.pincode || undefined,
          pocName: formData.pocName,
          pocNumber: formData.pocNumber,
          programCoordinatorId: formData.programCoordinatorId || undefined,
        };

        const response = await collegeService.createCollege(createData);
        if (response.success) {
          addToast('success', 'College created successfully');
          navigate('/colleges');
        } else {
          addToast('error', response.error?.message || 'Failed to create college');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save college:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save college');
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
        <button onClick={() => navigate('/colleges')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Colleges
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit College' : 'Create New College'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditing ? 'Update college details.' : 'Fill in the details to create a new college.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
        {/* College Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Name of the College *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter college name (min 3 chars)"
            className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
          />
          {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
        </div>

        {/* University */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Affiliated University *
          </label>
          <input
            type="text"
            value={formData.affiliatedUniversity}
            onChange={(e) => handleChange('affiliatedUniversity', e.target.value)}
            placeholder="Enter affiliated university (min 3 chars)"
            className={`w-full px-4 py-2.5 border ${errors.affiliatedUniversity ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
          />
          {errors.affiliatedUniversity && <span className="text-xs text-red-500 mt-1">{errors.affiliatedUniversity}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter city (min 2 chars)"
              className={`w-full px-4 py-2.5 border ${errors.city ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.city && <span className="text-xs text-red-500 mt-1">{errors.city}</span>}
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Enter state (min 2 chars)"
              className={`w-full px-4 py-2.5 border ${errors.state ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.state && <span className="text-xs text-red-500 mt-1">{errors.state}</span>}
          </div>
        </div>

        {/* Full Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Full Address
          </label>
          <textarea
            rows={2}
            value={formData.fullAddress}
            onChange={(e) => handleChange('fullAddress', e.target.value)}
            placeholder="Enter full address (optional)"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 resize-none transition-all"
          />
        </div>

        {/* Pincode */}
        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Pincode
          </label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className={`w-full px-4 py-2.5 border ${errors.pincode ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
          />
          {errors.pincode && <span className="text-xs text-red-500 mt-1">{errors.pincode}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* POC Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              POC Name *
            </label>
            <input
              type="text"
              value={formData.pocName}
              onChange={(e) => handleChange('pocName', e.target.value)}
              placeholder="Point of contact name (min 3 chars)"
              className={`w-full px-4 py-2.5 border ${errors.pocName ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.pocName && <span className="text-xs text-red-500 mt-1">{errors.pocName}</span>}
          </div>

          {/* POC Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              POC Number *
            </label>
            <input
              type="tel"
              value={formData.pocNumber}
              onChange={(e) => handleChange('pocNumber', e.target.value)}
              placeholder="Contact number"
              className={`w-full px-4 py-2.5 border ${errors.pocNumber ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.pocNumber && <span className="text-xs text-red-500 mt-1">{errors.pocNumber}</span>}
          </div>
        </div>

        {/* Program Coordinator */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Program Coordinator
          </label>
          <select
            value={formData.programCoordinatorId}
            onChange={(e) => handleChange('programCoordinatorId', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          >
            <option value="">Select coordinator (optional)</option>
            {coordinators.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/colleges')}
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
            {isEditing ? 'Update College' : 'Create College'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCollege;
