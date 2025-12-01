import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const Skills: React.FC = () => {
  const { skills, addSkill, updateSkill, deleteSkill } = useStore();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      if (editingId) {
        updateSkill(editingId, formData);
        setEditingId(null);
      } else {
        addSkill(formData);
      }
      setFormData({ name: '', description: '' });
    }
  };

  const handleEdit = (skill: typeof skills[0]) => {
    setEditingId(skill.id);
    setFormData({ name: skill.name, description: skill.description || '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteSkill(deleteConfirm.id)}
        title="Delete Skill"
        message="Are you sure you want to delete this skill?"
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter skill name"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter skill description"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">{editingId ? 'check' : 'add'}</span>
              {editingId ? 'Update Skill' : 'Add Skill'}
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
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Skill Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Description</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {skills.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id })}
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
  );
};

export default Skills;
