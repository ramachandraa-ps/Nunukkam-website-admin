import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const AddCollege: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { colleges, users, addCollege, updateCollege } = useStore();
  const isEditing = !!id;

  const coordinators = users.filter(u => u.status === 'active' && (u.role === 'Coordinator' || u.role === 'Admin'));

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    pocName: '',
    pocNumber: '',
    programCoordinator: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      const college = colleges.find(c => c.id === id);
      if (college) {
        setFormData({
          name: college.name,
          university: college.university,
          city: college.city,
          state: college.state,
          address: college.address,
          pincode: college.pincode,
          pocName: college.pocName,
          pocNumber: college.pocNumber,
          programCoordinator: college.programCoordinator,
        });
      }
    }
  }, [id, colleges, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'College name is required';
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pocName.trim()) newErrors.pocName = 'POC name is required';
    if (!formData.pocNumber.trim()) newErrors.pocNumber = 'POC number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (isEditing) {
        updateCollege(id!, formData);
      } else {
        addCollege(formData);
      }
      navigate('/colleges');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

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
            placeholder="Enter college name"
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
            value={formData.university}
            onChange={(e) => handleChange('university', e.target.value)}
            placeholder="Enter affiliated university"
            className={`w-full px-4 py-2.5 border ${errors.university ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
          />
          {errors.university && <span className="text-xs text-red-500 mt-1">{errors.university}</span>}
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
              placeholder="Enter city"
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
              placeholder="Enter state"
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
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter full address"
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
            onChange={(e) => handleChange('pincode', e.target.value)}
            placeholder="Enter pincode"
            maxLength={6}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          />
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
              placeholder="Point of contact name"
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
            value={formData.programCoordinator}
            onChange={(e) => handleChange('programCoordinator', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          >
            <option value="">Select coordinator</option>
            {coordinators.map(user => (
              <option key={user.id} value={user.name}>{user.name} ({user.designation})</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/colleges')}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
          >
            {isEditing ? 'Update College' : 'Create College'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCollege;
