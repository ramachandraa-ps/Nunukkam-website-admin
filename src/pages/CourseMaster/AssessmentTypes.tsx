import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import assessmentTypeService from '../../services/assessmentTypeService';
import { ApiAssessmentType, SubmissionType } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const SUBMISSION_TYPE_OPTIONS: { value: SubmissionType; label: string }[] = [
  { value: 'TEXT_INPUT', label: 'Text Input' },
  { value: 'RADIO_BUTTONS', label: 'Radio Buttons' },
  { value: 'CHECK_BOXES', label: 'Checkboxes' },
  { value: 'VIDEO_UPLOAD', label: 'Video Upload' },
  { value: 'PICTURE_UPLOAD', label: 'Picture Upload' },
  { value: 'MCQ', label: 'MCQ' },
];

const getSubmissionTypeLabel = (value: SubmissionType): string => {
  return SUBMISSION_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
};

const AssessmentTypes: React.FC = () => {
  const { addToast } = useStore();

  const [assessmentTypes, setAssessmentTypes] = useState<ApiAssessmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', submissionType: 'TEXT_INPUT' as SubmissionType });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch assessment types from API
  const fetchAssessmentTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await assessmentTypeService.getAssessmentTypes();
      if (response.success && response.data) {
        setAssessmentTypes(response.data.assessmentTypes);
      } else {
        addToast('error', response.error?.message || 'Failed to load assessment types');
      }
    } catch (error) {
      console.error('Failed to fetch assessment types:', error);
      addToast('error', 'Failed to load assessment types');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAssessmentTypes();
  }, [fetchAssessmentTypes]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Assessment type name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await assessmentTypeService.updateAssessmentType(editingId, {
          name: formData.name.trim(),
          submissionType: formData.submissionType,
        });
        if (response.success) {
          addToast('success', 'Assessment type updated successfully');
          setEditingId(null);
          setFormData({ name: '', submissionType: 'TEXT_INPUT' });
          fetchAssessmentTypes();
        } else {
          addToast('error', response.error?.message || 'Failed to update assessment type');
        }
      } else {
        const response = await assessmentTypeService.createAssessmentType({
          name: formData.name.trim(),
          submissionType: formData.submissionType,
        });
        if (response.success) {
          addToast('success', 'Assessment type created successfully');
          setFormData({ name: '', submissionType: 'TEXT_INPUT' });
          fetchAssessmentTypes();
        } else {
          addToast('error', response.error?.message || 'Failed to create assessment type');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save assessment type:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save assessment type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (type: ApiAssessmentType) => {
    setEditingId(type.id);
    setFormData({ name: type.name, submissionType: type.submissionType });
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', submissionType: 'TEXT_INPUT' });
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      const response = await assessmentTypeService.deleteAssessmentType(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Assessment type deleted successfully');
        fetchAssessmentTypes();
      } else {
        addToast('error', response.error?.message || 'Failed to delete assessment type');
      }
    } catch (error: unknown) {
      console.error('Failed to delete assessment type:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete assessment type');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading assessment types...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Assessment Type"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">Assessment Types</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage assessment types and their submission input methods.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 flex-1 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">
            {editingId ? 'Edit Assessment Type' : 'Add New Assessment Type'}
          </h3>
          <div className="space-y-6">
            {/* Assessment Type Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                Assessment Type Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter assessment type name (min 2 chars)"
                className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>

            {/* Submission Type Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                Submission Input Type *
              </label>
              <div className="relative">
                <select
                  value={formData.submissionType}
                  onChange={(e) => setFormData({ ...formData, submissionType: e.target.value as SubmissionType })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all appearance-none cursor-pointer"
                >
                  {SUBMISSION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || isSubmitting}
                className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span className="material-symbols-outlined">{editingId ? 'check' : 'add'}</span>
                {editingId ? 'Update Type' : 'Add Type'}
              </button>
              {editingId && (
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: List */}
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Existing Assessment Types:</h3>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {assessmentTypes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No assessment types added yet. Add your first assessment type using the form.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {assessmentTypes.map((type) => (
                  <div key={type.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{type.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {getSubmissionTypeLabel(type.submissionType)}
                        </span>
                        {type._count && type._count.assessments > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {type._count.assessments} assessments
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: type.id, name: type.name })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTypes;
