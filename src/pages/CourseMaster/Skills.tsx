import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import skillService from '../../services/skillService';
import { ApiSkill } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const Skills: React.FC = () => {
  const { addToast } = useStore();

  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch skills from API
  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await skillService.getSkills();
      if (response.success && response.data) {
        setSkills(response.data.skills);
      } else {
        addToast('error', response.error?.message || 'Failed to load skills');
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      addToast('error', 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Skill name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Skill name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await skillService.updateSkill(editingId, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        if (response.success) {
          addToast('success', 'Skill updated successfully');
          setEditingId(null);
          setFormData({ name: '', description: '' });
          fetchSkills();
        } else {
          addToast('error', response.error?.message || 'Failed to update skill');
        }
      } else {
        const response = await skillService.createSkill({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        if (response.success) {
          addToast('success', 'Skill created successfully');
          setFormData({ name: '', description: '' });
          fetchSkills();
        } else {
          addToast('error', response.error?.message || 'Failed to create skill');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save skill:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (skill: ApiSkill) => {
    setEditingId(skill.id);
    setFormData({ name: skill.name, description: skill.description || '' });
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      const response = await skillService.deleteSkill(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Skill deleted successfully');
        fetchSkills();
      } else {
        addToast('error', response.error?.message || 'Failed to delete skill');
      }
    } catch (error: unknown) {
      console.error('Failed to delete skill:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete skill');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading skills...</span>
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skills Repository</h1>
        <p className="text-sm text-gray-500 mt-1">Manage skills along with their definitions in the system.</p>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">
          {editingId ? 'Edit Skill' : 'Add New Skill'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Enter skill name (min 2 chars)"
              className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter skill description (optional)"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || isSubmitting}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span className="material-symbols-outlined">{editingId ? 'check' : 'add'}</span>
              {editingId ? 'Update Skill' : 'Add Skill'}
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

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Skill Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Description</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Chapters</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {skills.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No skills added yet. Add your first skill above.
                </td>
              </tr>
            ) : (
              skills.map((skill, idx) => (
                <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{skill.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{skill.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      {skill._count?.chapters ?? 0} chapters
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        title="Edit skill"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, name: skill.name })}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Delete skill"
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
  );
};

export default Skills;
