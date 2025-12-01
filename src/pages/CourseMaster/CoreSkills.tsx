import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const CoreSkills: React.FC = () => {
  const { coreSkills, courses, addCoreSkill, updateCoreSkill, deleteCoreSkill } = useStore();
  const [newSkill, setNewSkill] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const handleAdd = () => {
    if (newSkill.trim()) {
      addCoreSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      updateCoreSkill(id, editValue.trim());
      setEditingId(null);
      setEditValue('');
    }
  };

  const getCoursesForSkill = (skillId: string) => {
    return courses.filter(c => c.coreSkills.includes(skillId)).map(c => c.title);
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteCoreSkill(deleteConfirm.id)}
        title="Delete Core Skill"
        message="Are you sure you want to delete this core skill?"
        confirmText="Delete"
        type="danger"
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Core Skills</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage core skills to be mapped under courses.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">Add New Core Skill</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enter core skill name"
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newSkill.trim()}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Core Skill
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Core Skill</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Course Mapped To</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {coreSkills.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No core skills added yet. Add your first core skill above.
                </td>
              </tr>
            ) : (
              coreSkills.map((skill, idx) => {
                const mappedCourses = getCoursesForSkill(skill.id);
                return (
                  <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      {editingId === skill.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(skill.id)}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-700"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(skill.id)} className="text-green-600 hover:text-green-700">
                            <span className="material-symbols-outlined">check</span>
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{skill.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {mappedCourses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mappedCourses.map((course, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
                              {course}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not mapped</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(skill.id, skill.name)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoreSkills;
