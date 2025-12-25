import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import chapterService from '../../services/chapterService';
import moduleService from '../../services/moduleService';
import skillService from '../../services/skillService';
import { ApiChapter, ApiSkill, ApiModule } from '../../types/course';

const AddChapter: React.FC = () => {
  const navigate = useNavigate();
  const { id, moduleId } = useParams();
  const { addToast } = useStore();
  const isEditing = !!id;

  const [chapter, setChapter] = useState<ApiChapter | null>(null);
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    moduleId: moduleId || '',
    skillIds: [] as string[],
    orderIndex: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch modules and skills in parallel
      const [modulesRes, skillsRes] = await Promise.all([
        moduleService.getModules(),
        skillService.getSkills(),
      ]);

      if (modulesRes.success && modulesRes.data) {
        setModules(modulesRes.data.modules);
      }

      if (skillsRes.success && skillsRes.data) {
        setSkills(skillsRes.data.skills);
      }

      // If editing, fetch chapter details
      if (isEditing && id) {
        const chapterRes = await chapterService.getChapterById(id);
        if (chapterRes.success && chapterRes.data) {
          const chapterData = chapterRes.data.chapter;
          setChapter(chapterData);
          setFormData({
            name: chapterData.name,
            moduleId: chapterData.moduleId,
            skillIds: chapterData.skills?.map(s => s.skillId) || [],
            orderIndex: chapterData.orderIndex,
          });
        } else {
          addToast('error', 'Chapter not found');
          navigate('/courses/chapters');
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditing, addToast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set moduleId from URL param after modules are loaded
  useEffect(() => {
    if (moduleId && !formData.moduleId) {
      setFormData(prev => ({ ...prev, moduleId }));
    }
  }, [moduleId, formData.moduleId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Chapter name is required';
    }
    if (!formData.moduleId) {
      newErrors.moduleId = 'Module is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (redirectToAssessment: boolean = false) => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let savedChapterId = id;

      if (isEditing && id) {
        // Update existing chapter
        const response = await chapterService.updateChapter(id, {
          name: formData.name.trim(),
          skillIds: formData.skillIds,
          orderIndex: formData.orderIndex,
        });

        if (response.success) {
          addToast('success', 'Chapter updated successfully');
        } else {
          addToast('error', response.error?.message || 'Failed to update chapter');
          return;
        }
      } else {
        // Create new chapter (orderIndex is auto-calculated by backend)
        const response = await chapterService.createChapter({
          moduleId: formData.moduleId,
          name: formData.name.trim(),
          skillIds: formData.skillIds.length > 0 ? formData.skillIds : undefined,
        });

        if (response.success && response.data) {
          addToast('success', 'Chapter added successfully');
          savedChapterId = response.data.chapter.id;
        } else {
          addToast('error', response.error?.message || 'Failed to create chapter');
          return;
        }
      }

      if (redirectToAssessment && savedChapterId) {
        navigate(`/courses/chapters/${savedChapterId}/assessments/add`);
      } else {
        navigate('/courses/chapters');
      }
    } catch (error: unknown) {
      console.error('Failed to save chapter:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(s => s !== skillId)
        : [...prev.skillIds, skillId],
    }));
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

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">{isEditing ? 'Edit chapter' : 'Add chapters'}</span>
        </h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Side: Form */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 space-y-6">
          {/* Module Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Module *
            </label>
            <select
              value={formData.moduleId}
              onChange={(e) => {
                setFormData({ ...formData, moduleId: e.target.value });
                if (errors.moduleId) setErrors({ ...errors, moduleId: '' });
              }}
              disabled={isEditing}
              className={`w-full px-4 py-2 border ${errors.moduleId ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:border-primary-600 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-700`}
            >
              <option value="">Select a module</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title} {module.coreSkill ? `(${module.coreSkill.name})` : ''}
                </option>
              ))}
            </select>
            {errors.moduleId && <span className="text-xs text-red-500 mt-1">{errors.moduleId}</span>}
          </div>

          {/* Chapter Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Chapter name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:border-primary-600 transition-all`}
              placeholder="Enter chapter name"
            />
            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
          </div>

          {/* Order (only show for editing) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Order Index
              </label>
              <input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                min={0}
                className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-600 transition-all"
              />
            </div>
          )}

          {/* Skills */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Skills (optional)
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-600 transition-all"
              onChange={(e) => {
                const val = e.target.value;
                if (val && !formData.skillIds.includes(val)) {
                  setFormData(prev => ({ ...prev, skillIds: [...prev.skillIds, val] }));
                }
              }}
              value=""
            >
              <option value="">Select Skills</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id} disabled={formData.skillIds.includes(skill.id)}>
                  {skill.name}
                </option>
              ))}
            </select>
            {/* Selected Skills Chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skillIds.map(skillId => {
                const skill = skills.find(s => s.id === skillId);
                return skill ? (
                  <span key={skillId} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full flex items-center gap-1 border border-purple-100">
                    {skill.name}
                    <button
                      onClick={() => toggleSkill(skillId)}
                      className="hover:text-purple-900"
                    >&times;</button>
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Add Assessments Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Add assessments
            </button>
          </div>
        </div>
      </div>

      {/* Assessments List (Only for Editing) */}
      {isEditing && chapter && chapter.assessments && chapter.assessments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Assessments in this chapter</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Title</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Kind</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Questions</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {chapter.assessments.map(assessment => (
                  <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{assessment.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{assessment.kind}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{assessment._count?.questions || 0}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/courses/chapters/${id}/assessments/${assessment.id}/questions`)}
                        className="text-purple-600 hover:underline text-sm"
                      >
                        Edit Questions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Final Actions */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => navigate('/courses/chapters')}
          className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-purple-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {isEditing ? 'Update chapter' : 'Add chapter'}
        </button>
      </div>
    </div>
  );
};

export default AddChapter;
