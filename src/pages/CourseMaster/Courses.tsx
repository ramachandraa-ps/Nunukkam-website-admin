import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import courseService from '../../services/courseService';
import { ApiCourse, CourseStatus } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({ isOpen: false, id: '', title: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getCourses({
        status: statusFilter || undefined,
      });
      if (response.success && response.data) {
        setCourses(response.data.courses);
      } else {
        addToast('error', response.error?.message || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      addToast('error', 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, statusFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCoreSkillNames = (course: ApiCourse) => {
    if (!course.coreSkills || course.coreSkills.length === 0) return 'None';
    return course.coreSkills.map(cs => cs.coreSkill.name).join(', ');
  };

  const handleDelete = async () => {
    try {
      const response = await courseService.deleteCourse(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Course deleted successfully');
        fetchCourses();
      } else {
        addToast('error', response.error?.message || 'Failed to delete course');
      }
    } catch (error: unknown) {
      console.error('Failed to delete course:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete course');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', title: '' });
    }
  };

  const handleStatusAction = async (courseId: string, action: 'publish' | 'unpublish' | 'archive') => {
    setActionLoading(courseId);
    try {
      let response;
      if (action === 'publish') {
        response = await courseService.publishCourse(courseId);
      } else if (action === 'unpublish') {
        response = await courseService.unpublishCourse(courseId);
      } else {
        response = await courseService.archiveCourse(courseId);
      }

      if (response.success) {
        addToast('success', `Course ${action}ed successfully`);
        fetchCourses();
      } else {
        addToast('error', response.error?.message || `Failed to ${action} course`);
      }
    } catch (error: unknown) {
      console.error(`Failed to ${action} course:`, error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || `Failed to ${action} course`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status: CourseStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500/90 text-white';
      case 'ARCHIVED':
        return 'bg-gray-500/90 text-white';
      default:
        return 'bg-amber-400/90 text-black';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage, create, and organize all courses.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/courses/core-skills')}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-primary-600 mb-2">category</span>
          <p className="text-sm font-medium text-gray-800 dark:text-white">Core Skills</p>
          <p className="text-xs text-gray-500">Manage core skills</p>
        </button>
        <button
          onClick={() => navigate('/courses/skills')}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-green-600 mb-2">psychology</span>
          <p className="text-sm font-medium text-gray-800 dark:text-white">Skills</p>
          <p className="text-xs text-gray-500">Manage skills repository</p>
        </button>
        <button
          onClick={() => navigate('/courses/chapters')}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-blue-600 mb-2">menu_book</span>
          <p className="text-sm font-medium text-gray-800 dark:text-white">Chapters</p>
          <p className="text-xs text-gray-500">Manage chapters</p>
        </button>
        <button
          onClick={() => navigate('/courses/assessment-types')}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-amber-600 mb-2">quiz</span>
          <p className="text-sm font-medium text-gray-800 dark:text-white">Assessment Types</p>
          <p className="text-xs text-gray-500">Manage assessment types</p>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-4 flex-1">
          <div className="relative max-w-md w-full group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
            <input
              type="text"
              placeholder="Search by course title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CourseStatus | '')}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-primary-700"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <button
          onClick={() => navigate('/courses/create')}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined">add</span>
          Create New Course
        </button>
      </div>

      {/* Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">school</span>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No courses found</h3>
          <p className="text-sm text-gray-500 mt-2">Create your first course to get started.</p>
          <button
            onClick={() => navigate('/courses/create')}
            className="mt-6 px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 transition-all"
          >
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} onClick={() => navigate(`/courses/${course.id}/core-skills`)} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-primary-600 to-primary-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`px-2.5 py-1 rounded-lg backdrop-blur-sm text-[10px] uppercase font-bold tracking-wider mb-2 inline-block ${getStatusBadgeClass(course.status)}`}>
                    {course.status}
                  </span>
                  <h3 className="font-bold text-lg text-white leading-tight">{course.title}</h3>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-gray-500 flex-grow mb-4 leading-relaxed line-clamp-2">{course.description || 'No description'}</p>
                <div className="text-xs text-gray-400 mb-4">
                  <span className="font-medium">Core Skills:</span> {getCoreSkillNames(course)}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">category</span>
                      {course._count?.coreSkills ?? 0} Skills
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {course.durationDays} Days
                    </span>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {course.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusAction(course.id, 'publish')}
                        disabled={actionLoading === course.id}
                        className="text-gray-400 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                        title="Publish"
                      >
                        <span className="material-symbols-outlined">publish</span>
                      </button>
                    )}
                    {course.status === 'PUBLISHED' && (
                      <>
                        <button
                          onClick={() => handleStatusAction(course.id, 'unpublish')}
                          disabled={actionLoading === course.id}
                          className="text-gray-400 hover:text-amber-600 p-2 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
                          title="Unpublish"
                        >
                          <span className="material-symbols-outlined">unpublished</span>
                        </button>
                        <button
                          onClick={() => handleStatusAction(course.id, 'archive')}
                          disabled={actionLoading === course.id}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                          title="Archive"
                        >
                          <span className="material-symbols-outlined">archive</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/courses/${course.id}/modules`)}
                      className="text-gray-400 hover:text-primary-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="View Modules"
                    >
                      <span className="material-symbols-outlined">folder_open</span>
                    </button>
                    <button
                      onClick={() => navigate(`/courses/edit/${course.id}`)}
                      className="text-gray-400 hover:text-primary-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, id: course.id, title: course.title })}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
