import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const submissionOptions = [
  'Text Input',
  'Radio Buttons',
  'Checkboxes',
  'Video Upload',
  'Picture Upload',
];

const AssessmentTypes: React.FC = () => {
  const { assessmentTypes, addAssessmentType, updateAssessmentType, deleteAssessmentType } = useStore();
  const [formData, setFormData] = useState({ name: '', submissionInput: 'Text Input' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const handleSubmit = () => {
    if (formData.name.trim() && formData.submissionInput) {
      if (editingId) {
        updateAssessmentType(editingId, formData);
        setEditingId(null);
      } else {
        addAssessmentType(formData);
      }
      setFormData({ name: '', submissionInput: 'Text Input' });
    }
  };

  const handleEdit = (type: typeof assessmentTypes[0]) => {
    setEditingId(type.id);
    setFormData({ name: type.name, submissionInput: type.submissionInput });
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteAssessmentType(deleteConfirm.id)}
        title="Delete Assessment Type"
        message="Are you sure you want to delete this assessment type?"
        confirmText="Delete"
        type="danger"
      />

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">Add Assessments</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 flex-1 h-fit">
          <div className="space-y-6">

            {/* Assessment Type Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Add Assessment Types
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-600 transition-all"
              />
            </div>

            {/* Submission Input Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Submission Input:
              </label>
              <div className="relative">
                <select
                  value={formData.submissionInput}
                  onChange={(e) => setFormData({ ...formData, submissionInput: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-600 transition-all appearance-none cursor-pointer"
                >
                  {submissionOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-200"
              >
                {editingId ? 'Update Assessment type' : 'Add Assessment type'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side / Bottom: List */}
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">List of added assessment types:</h3>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {assessmentTypes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No assessment types added yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {assessmentTypes.map((type) => (
                  <div key={type.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{type.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                        {type.submissionInput}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: type.id })}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
