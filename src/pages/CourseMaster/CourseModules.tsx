import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import courseService from '../../services/courseService';
import moduleService from '../../services/moduleService';
import { ApiCourse, ApiModule } from '../../types/course';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const CourseModules: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ApiModule | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({ isOpen: false, id: '', title: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch course and modules
  const fetchData = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      // Fetch course
      const courseResponse = await courseService.getCourseById(courseId);
      if (courseResponse.success && courseResponse.data) {
        setCourse(courseResponse.data.course);
      }

      // Fetch modules for all core skills in this course
      const modulesResponse = await moduleService.getModules();
      if (modulesResponse.success && modulesResponse.data) {
        // Filter modules that belong to core skills in this course
        const courseSkillIds = courseResponse.data?.course.coreSkills?.map(cs => cs.coreSkill.id) || [];
        const courseModules = modulesResponse.data.modules.filter(m =>
          courseSkillIds.includes(m.coreSkillId)
        );
        setModules(courseModules);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (module?: ApiModule) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        title: module.title,
        description: module.description || ''
      });
    } else {
      setEditingModule(null);
      setFormData({ title: '', description: '' });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Module title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Module title must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingModule) {
        const response = await moduleService.updateModule(editingModule.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
        });
        if (response.success) {
          addToast('success', 'Module updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to update module');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save module:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save module');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await moduleService.deleteModule(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Module deleted successfully');
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to delete module');
      }
    } catch (error: unknown) {
      console.error('Failed to delete module:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete module');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', title: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading modules...</span>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingModule ? 'Edit Module' : 'Add Module'} size="lg">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Module Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Enter module title (min 3 chars)"
              className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
            />
            {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title}</span>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Module description (optional)"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isSubmitting}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
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
      </div>

      {/* Modules List or Empty State */}
      {modules.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-gray-400">view_module</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Modules Added Yet</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Create modules to organize your course content effectively.
            Modules can contain multiple chapters and assessments.
          </p>
          <button
            onClick={() => navigate(`/courses/${courseId}/modules/add`)}
            className="px-8 py-3 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Module
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="overflow-hidden mb-6">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Module</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Core Skill</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Chapters</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {modules.map((module, idx) => (
                  <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{module.title}</p>
                      {module.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{module.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {module.coreSkill?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {module._count?.chapters ?? 0} chapters
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(module)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                          title="Edit module"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: module.id, title: module.title })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Delete module"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => navigate(`/courses/${courseId}/modules/add`)}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add More Modules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseModules;
