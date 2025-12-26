import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import chapterService from '../../services/chapterService';
import { ApiChapter } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

type SortField = 'name' | 'module' | 'assessments';
type SortOrder = 'asc' | 'desc';

const Chapters: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [chapters, setChapters] = useState<ApiChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string; assessmentCount: number }>({ isOpen: false, id: '', name: '', assessmentCount: 0 });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Fetch chapters from API
  const fetchChapters = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await chapterService.getChapters();
      if (response.success && response.data) {
        setChapters(response.data.chapters);
      } else {
        // Only show error if it's not an auth issue (auth interceptor handles redirect)
        if (response.error?.message !== 'Authentication token required') {
          addToast('error', response.error?.message || 'Failed to load chapters');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to fetch chapters:', error);
      // Don't show toast for auth errors - interceptor handles redirect
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 401) {
        addToast('error', 'Failed to load chapters');
      }
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort chapters
  const sortedChapters = [...filteredChapters].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'module') {
      comparison = (a.module?.title || '').localeCompare(b.module?.title || '');
    } else if (sortField === 'assessments') {
      comparison = (a._count?.assessments ?? 0) - (b._count?.assessments ?? 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`material-symbols-outlined text-sm ml-1 ${sortField === field ? 'text-primary-600' : 'text-gray-400'}`}>
      {sortField === field ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
    </span>
  );

  const getSkillNames = (chapter: ApiChapter) => {
    if (!chapter.skills || chapter.skills.length === 0) return '-';
    return chapter.skills.map(s => s.skill.name).join(', ');
  };

  const handleDelete = async () => {
    try {
      const response = await chapterService.deleteChapter(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Chapter deleted successfully');
        fetchChapters();
      } else {
        addToast('error', response.error?.message || 'Failed to delete chapter');
      }
    } catch (error: unknown) {
      console.error('Failed to delete chapter:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete chapter');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '', assessmentCount: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading chapters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '', assessmentCount: 0 })}
        onConfirm={handleDelete}
        title="Delete Chapter"
        message={deleteConfirm.assessmentCount > 0
          ? `Warning: "${deleteConfirm.name}" has ${deleteConfirm.assessmentCount} assessment(s). Deleting this chapter will permanently delete all associated assessments and their questions. This action cannot be undone.`
          : `Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        type="danger"
      />

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">Chapters</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage chapters and their content</p>
      </div>

      {chapters.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-gray-400">menu_book</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Chapters Yet</h3>
          <p className="text-gray-500 max-w-md text-center mb-8">
            Create chapters to organize course content. Each chapter can have PPT files, notes, and assessments.
          </p>
          <button
            onClick={() => navigate('/courses/chapters/add')}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add chapter
          </button>
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full group">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
              />
            </div>
            <button
              onClick={() => navigate('/courses/chapters/add')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add chapter
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center">Chapter name<SortIcon field="name" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('module')}
                >
                  <span className="flex items-center">Module<SortIcon field="module" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('assessments')}
                >
                  <span className="flex items-center">Assessments<SortIcon field="assessments" /></span>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Skills</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Files</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {sortedChapters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No chapters found matching your search.
                  </td>
                </tr>
              ) : (
                sortedChapters.map((chapter, idx) => (
                  <tr key={chapter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{chapter.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {chapter.module?.title || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/courses/chapters/${chapter.id}/assessments/add`)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Click to add assessment"
                      >
                        {chapter._count?.assessments ?? chapter.assessments?.length ?? 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {getSkillNames(chapter)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {chapter.pptFile && (
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded font-medium">
                            PPT
                          </span>
                        )}
                        {chapter.notesFile && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium">
                            Notes
                          </span>
                        )}
                        {!chapter.pptFile && !chapter.notesFile && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/courses/chapters/${chapter.id}/assessments/add`)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Add assessment"
                        >
                          <span className="material-symbols-outlined text-[20px]">quiz</span>
                        </button>
                        <button
                          onClick={() => navigate(`/courses/chapters/edit/${chapter.id}`)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit chapter"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: chapter.id, name: chapter.name, assessmentCount: chapter._count?.assessments ?? chapter.assessments?.length ?? 0 })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete chapter"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Chapters;
