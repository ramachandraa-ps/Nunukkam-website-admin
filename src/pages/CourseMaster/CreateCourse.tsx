import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import courseService from '../../services/courseService';
import coreSkillService from '../../services/coreSkillService';
import { ApiCoreSkill } from '../../types/course';

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useStore();
  const isEditing = !!id;

  const [coreSkills, setCoreSkills] = useState<ApiCoreSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coreSkillIds: [] as string[],
    durationDays: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch core skills and course data if editing
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch core skills
      const skillsResponse = await coreSkillService.getCoreSkills();
      if (skillsResponse.success && skillsResponse.data) {
        setCoreSkills(skillsResponse.data.coreSkills);
      }

      // If editing, fetch course data
      if (isEditing && id) {
        const courseResponse = await courseService.getCourseById(id);
        if (courseResponse.success && courseResponse.data) {
          const course = courseResponse.data.course;
          setFormData({
            title: course.title,
            description: course.description || '',
            coreSkillIds: course.coreSkills?.map(cs => cs.coreSkill.id) || [],
            durationDays: course.durationDays,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditing, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Course title must be at least 3 characters';
    }
    if (formData.durationDays < 1) {
      newErrors.durationDays = 'Duration must be at least 1 day';
    }
    if (formData.coreSkillIds.length === 0) {
      newErrors.coreSkills = 'Select at least one core skill';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        const response = await courseService.updateCourse(id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          durationDays: formData.durationDays,
          coreSkillIds: formData.coreSkillIds,
        });
        if (response.success) {
          addToast('success', 'Course updated successfully');
          navigate('/courses');
        } else {
          addToast('error', response.error?.message || 'Failed to update course');
        }
      } else {
        const response = await courseService.createCourse({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          durationDays: formData.durationDays,
          coreSkillIds: formData.coreSkillIds,
        });
        if (response.success) {
          addToast('success', 'Course created successfully');
          navigate('/courses');
        } else {
          addToast('error', response.error?.message || 'Failed to create course');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save course:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCoreSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      coreSkillIds: prev.coreSkillIds.includes(skillId)
        ? prev.coreSkillIds.filter(s => s !== skillId)
        : [...prev.coreSkillIds, skillId],
    }));
    if (errors.coreSkills) setErrors({ ...errors, coreSkills: '' });
  };

  const getSkillName = (skillId: string) => {
    return coreSkills.find(s => s.id === skillId)?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/courses')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Courses
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditing ? 'Update course details.' : 'Fill in the details to create a new course.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            placeholder="Enter the title of the course (min 3 chars)"
            className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:border-primary-700 focus:ring-primary-700/20'} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all`}
          />
          {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title}</span>}
        </div>

        {/* Duration */}
        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Course Duration (in days) *
          </label>
          <input
            type="number"
            value={formData.durationDays}
            onChange={(e) => {
              setFormData({ ...formData, durationDays: parseInt(e.target.value) || 1 });
              if (errors.durationDays) setErrors({ ...errors, durationDays: '' });
            }}
            min={1}
            className={`w-full px-4 py-3 rounded-xl border ${errors.durationDays ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:border-primary-700 focus:ring-primary-700/20'} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all`}
          />
          {errors.durationDays && <span className="text-xs text-red-500 mt-1">{errors.durationDays}</span>}
        </div>

        {/* Core Skills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Select Core Skills *
          </label>
          <div className={`border ${errors.coreSkills ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl p-4 max-h-40 overflow-y-auto`}>
            {coreSkills.length === 0 ? (
              <p className="text-sm text-gray-500">
                No core skills available.{' '}
                <button type="button" onClick={() => navigate('/courses/core-skills')} className="text-primary-600 hover:underline">
                  Add core skills first
                </button>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {coreSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleCoreSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.coreSkillIds.includes(skill.id)
                        ? 'bg-primary-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {skill.name}
                    {formData.coreSkillIds.includes(skill.id) && <span className="ml-1">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.coreSkills && <span className="text-xs text-red-500 mt-1">{errors.coreSkills}</span>}
          {formData.coreSkillIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.coreSkillIds.map(skillId => (
                <span key={skillId} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                  {getSkillName(skillId)}
                  <button type="button" onClick={() => toggleCoreSkill(skillId)} className="hover:text-primary-900">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Course Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setFormData({ ...formData, description: e.target.value });
              }
            }}
            placeholder="Provide a detailed description (optional)..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-primary-700 focus:ring-primary-700/20 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 resize-none transition-all"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400 font-medium">{formData.description.length} / 500</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gray-50 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-primary-700 text-white font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditing ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
