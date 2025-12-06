import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const CoreSkills: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { coreSkills, courses, addCoreSkill, updateCoreSkill, deleteCoreSkill } = useStore();
  const [newSkill, setNewSkill] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [isAdding, setIsAdding] = useState(false);

  const course = courseId ? courses.find(c => c.id === courseId) : null;
  const displaySkills = course
    ? coreSkills.filter(s => course.coreSkills.includes(s.id))
    : coreSkills;

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

  if (!course && courseId) {
    return <div>Course not found</div>
  }

  // Course Specific Grid View
  if (courseId && course) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/courses')} className="text-gray-500 hover:text-primary-700">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title} - Core Skills</h1>
            <p className="text-sm text-gray-500 mt-1">Manage core skills for this course</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displaySkills.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">No core skills mapped to this course yet.</p>
            </div>
          ) : (
            displaySkills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => navigate(`/courses/${courseId}/modules`)}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 group h-48"
              >
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">category</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{skill.name}</h3>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Global Management View
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

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master -- </span>
          <span className="text-purple-600">Add Core Skills</span>
        </h1>
      </div>

      {coreSkills.length === 0 && !isAdding ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-[60vh] flex flex-col items-center justify-center">
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1"
          >
            Add core skill
          </button>
        </div>
      ) : (
        // Form & Table View
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 min-h-[60vh]">

          {/* Add Form */}
          <div className="flex gap-4 items-center mb-12">
            <label className="text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap">Enter the Core Skill:</label>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 max-w-xl px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-600 transition-all"
            />
            <button
              onClick={handleAdd}
              className="px-8 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all ml-4"
            >
              Add Core skill
            </button>
          </div>

          {/* List Header */}
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">List of existing Core Skills:</h3>

          {/* Table */}
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white w-1/3">List of Core Skills</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Mapped to course</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {coreSkills.map((skill) => {
                  const mappedCourses = getCoursesForSkill(skill.id);
                  return (
                    <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                        {skill.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {mappedCourses.length > 0 ? mappedCourses.join(', ') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id })}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreSkills;
