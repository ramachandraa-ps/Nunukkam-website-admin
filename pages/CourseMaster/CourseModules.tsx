import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, Module } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const CourseModules: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, chapters, updateCourse, addToast } = useStore();

  const course = courses.find(c => c.id === courseId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const [formData, setFormData] = useState({
    title: '',
    chapters: [] as string[],
  });

  if (!course) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">Course not found</h3>
        <button onClick={() => navigate('/courses')} className="mt-4 text-primary-600 hover:underline">
          Go back to courses
        </button>
      </div>
    );
  }

  const handleOpenModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({ title: module.title, chapters: module.chapters });
    } else {
      setEditingModule(null);
      setFormData({ title: '', chapters: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (formData.title.trim()) {
      const newModules = editingModule
        ? course.modules.map(m => m.id === editingModule.id ? { ...m, ...formData } : m)
        : [...course.modules, { id: Math.random().toString(36).substr(2, 9), ...formData, createdAt: new Date() }];

      updateCourse(course.id, { modules: newModules });
      setIsModalOpen(false);
      setFormData({ title: '', chapters: [] });
      setEditingModule(null);
    }
  };

  const handleDelete = (moduleId: string) => {
    const newModules = course.modules.filter(m => m.id !== moduleId);
    updateCourse(course.id, { modules: newModules });
    addToast('success', 'Module deleted successfully');
  };

  const toggleChapter = (chapterId: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.includes(chapterId)
        ? prev.chapters.filter(c => c !== chapterId)
        : [...prev.chapters, chapterId],
    }));
  };

  const getChapterName = (chapterId: string) => {
    return chapters.find(c => c.id === chapterId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Module"
        message="Are you sure you want to delete this module?"
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingModule ? 'Edit Module' : 'Add Module'} size="lg">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Module Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter module title"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Select Chapters</label>
            <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
              {chapters.length === 0 ? (
                <p className="text-sm text-gray-500">No chapters available.</p>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <label key={chapter.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.chapters.includes(chapter.id)}
                        onChange={() => toggleChapter(chapter.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{chapter.name}</span>
                      <span className="text-xs text-gray-400">({chapter.assessments.length} assessments)</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"
            >
              {editingModule ? 'Update' : 'Add'} Module
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => navigate('/courses')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage modules for this course</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Module
        </button>
      </div>

      {/* Modules Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Module Title</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">No. of Chapters</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Chapters</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {course.modules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No modules added yet. Add your first module.
                </td>
              </tr>
            ) : (
              course.modules.map((module, idx) => (
                <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{module.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                      {module.chapters.length}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {module.chapters.slice(0, 2).map(chId => (
                        <span key={chId} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {getChapterName(chId)}
                        </span>
                      ))}
                      {module.chapters.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{module.chapters.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(module)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: module.id })}
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

export default CourseModules;
