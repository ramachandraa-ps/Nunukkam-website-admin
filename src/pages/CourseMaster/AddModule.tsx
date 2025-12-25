import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import courseService from '../../services/courseService';
import moduleService from '../../services/moduleService';
import { ApiCourse } from '../../types/course';

const AddModule: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coreSkillId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch course details
  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const response = await courseService.getCourseById(courseId);
      if (response.success && response.data) {
        setCourse(response.data.course);
        // Pre-select first core skill if available
        const coreSkills = response.data.course.coreSkills || [];
        if (coreSkills.length > 0) {
          setFormData(prev => ({ ...prev, coreSkillId: coreSkills[0].coreSkill.id }));
        }
      } else {
        addToast('error', 'Course not found');
        navigate('/courses');
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      addToast('error', 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, addToast, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Module title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Module title must be at least 3 characters';
    }
    if (!formData.coreSkillId) {
      newErrors.coreSkillId = 'Core skill is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await moduleService.createModule({
        coreSkillId: formData.coreSkillId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });

      if (response.success) {
        addToast('success', 'Module created successfully');
        navigate(`/courses/${courseId}/modules`);
      } else {
        addToast('error', response.error?.message || 'Failed to create module');
      }
    } catch (error: unknown) {
      console.error('Failed to create module:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to create module');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading...</span>
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

  const coreSkills = course.coreSkills || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/courses/${courseId}/modules`)} className="text-gray-500 hover:text-primary-700">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Module</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new module to {course.title}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Core Skill Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Core Skill *</label>
            <div className="md:col-span-3">
              {coreSkills.length === 0 ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    No core skills are assigned to this course. Please add core skills to the course first.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={formData.coreSkillId}
                    onChange={(e) => {
                      setFormData({ ...formData, coreSkillId: e.target.value });
                      if (errors.coreSkillId) setErrors({ ...errors, coreSkillId: '' });
                    }}
                    className={`w-full px-4 py-2.5 border ${errors.coreSkillId ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
                  >
                    <option value="">Select a core skill</option>
                    {coreSkills.map(cs => (
                      <option key={cs.coreSkill.id} value={cs.coreSkill.id}>
                        {cs.coreSkill.name}
                      </option>
                    ))}
                  </select>
                  {errors.coreSkillId && <span className="text-xs text-red-500 mt-1">{errors.coreSkillId}</span>}
                </>
              )}
            </div>
          </div>

          {/* Module Title */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Module Title *</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Enter module title (min 3 characters)"
                className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all`}
              />
              {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 pt-3">Description</label>
            <div className="md:col-span-3">
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Module description (optional)"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end gap-4">
          <button
            onClick={() => navigate(`/courses/${courseId}/modules`)}
            className="px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.coreSkillId || isSubmitting || coreSkills.length === 0}
            className="px-8 py-3 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Create Module
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModule;
