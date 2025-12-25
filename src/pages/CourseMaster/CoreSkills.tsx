import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import coreSkillService from '../../services/coreSkillService';
import courseService from '../../services/courseService';
import { ApiCoreSkill, ApiCourse } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const CoreSkills: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [coreSkills, setCoreSkills] = useState<ApiCoreSkill[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newSkill, setNewSkill] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch core skills
      const skillsResponse = await coreSkillService.getCoreSkills();
      if (skillsResponse.success && skillsResponse.data) {
        setCoreSkills(skillsResponse.data.coreSkills);
      }

      // Fetch all courses for mapping info
      const coursesResponse = await courseService.getCourses();
      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data.courses);
      }

      // If courseId, fetch specific course
      if (courseId) {
        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse.success && courseResponse.data) {
          setCourse(courseResponse.data.course);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displaySkills = course
    ? coreSkills.filter(s => course.coreSkills?.some(cs => cs.coreSkill.id === s.id))
    : coreSkills;

  const handleAdd = async () => {
    if (!newSkill.trim()) {
      setErrors({ name: 'Core skill name is required' });
      return;
    }
    if (newSkill.trim().length < 2) {
      setErrors({ name: 'Core skill name must be at least 2 characters' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await coreSkillService.createCoreSkill({
        name: newSkill.trim(),
        description: newDescription.trim() || undefined,
      });
      if (response.success) {
        addToast('success', 'Core skill created successfully');
        setNewSkill('');
        setNewDescription('');
        setErrors({});
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to create core skill');
      }
    } catch (error: unknown) {
      console.error('Failed to create core skill:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to create core skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await coreSkillService.deleteCoreSkill(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Core skill deleted successfully');
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to delete core skill');
      }
    } catch (error: unknown) {
      console.error('Failed to delete core skill:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete core skill');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  const getCoursesForSkill = (skillId: string) => {
    return courses
      .filter(c => c.coreSkills?.some(cs => cs.coreSkill.id === skillId))
      .map(c => c.title);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading core skills...</span>
        </div>
      </div>
    );
  }

  if (!course && courseId) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <p className="text-gray-500">Course not found</p>
        <button onClick={() => navigate('/courses')} className="mt-4 text-primary-600 hover:underline">
          Back to Courses
        </button>
      </div>
    );
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
              <button
                onClick={() => navigate(`/courses/edit/${courseId}`)}
                className="mt-4 text-primary-600 hover:underline"
              >
                Edit course to add core skills
              </button>
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
                {skill._count && (
                  <span className="text-xs text-gray-500">{skill._count.modules} modules</span>
                )}
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
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Core Skill"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
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
          <div className="space-y-4 mb-12">
            <div className="flex gap-4 items-start">
              <label className="text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap pt-2">Enter the Core Skill:</label>
              <div className="flex-1 max-w-xl">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    if (errors.name) setErrors({});
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Core skill name (min 2 chars)"
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:border-primary-600 transition-all`}
                />
                {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
              </div>
              <button
                onClick={handleAdd}
                disabled={isSubmitting}
                className="px-8 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Add Core skill
              </button>
            </div>
            <div className="flex gap-4 items-start ml-[180px]">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="flex-1 max-w-xl px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-600 transition-all"
              />
            </div>
          </div>

          {/* List Header */}
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">List of existing Core Skills:</h3>

          {/* Table */}
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white w-1/4">Core Skill</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white w-1/4">Description</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Mapped to courses</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {coreSkills.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No core skills added yet.
                    </td>
                  </tr>
                ) : (
                  coreSkills.map((skill) => {
                    const mappedCourses = getCoursesForSkill(skill.id);
                    return (
                      <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                          {skill.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {skill.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {mappedCourses.length > 0 ? mappedCourses.join(', ') : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, name: skill.name })}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreSkills;
