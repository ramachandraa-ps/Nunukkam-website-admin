import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const submissionOptions = [
  'Text Input',
  'Radio Buttons',
  'Checkboxes',
  'Video Upload',
  'Picture Upload',
  'File Upload',
];

const AssessmentTypes: React.FC = () => {
  const { assessmentTypes, addAssessmentType, updateAssessmentType, deleteAssessmentType } = useStore();
  const [formData, setFormData] = useState({ name: '', submissionInput: '' });
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
      setFormData({ name: '', submissionInput: '' });
    }
  };

  const handleEdit = (type: typeof assessmentTypes[0]) => {
    setEditingId(type.id);
    setFormData({ name: type.name, submissionInput: type.submissionInput });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', submissionInput: '' });
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

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment Types</h1>
        <p className="text-sm text-gray-500 mt-1">Define various assessment types to be used in courses.</p>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">
          {editingId ? 'Edit Assessment Type' : 'Add New Assessment Type'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Assessment Type *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Multiple Choice Questions"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Submission Input *
            </label>
            <select
              value={formData.submissionInput}
              onChange={(e) => setFormData({ ...formData, submissionInput: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            >
              <option value="">Select submission type</option>
              {submissionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.submissionInput}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">{editingId ? 'check' : 'add'}</span>
            {editingId ? 'Update Type' : 'Add Assessment Type'}
          </button>
          {editingId && (
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Assessment Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Submission Input</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {assessmentTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No assessment types added yet. Add your first type above.
                  </td>
                </tr>
              ) : (
                assessmentTypes.map((type, idx) => (
                  <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{type.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {type.submissionInput}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: type.id })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined">delete</span>
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

export default AssessmentTypes;
