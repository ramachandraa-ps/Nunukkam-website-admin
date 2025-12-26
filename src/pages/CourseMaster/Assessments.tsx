import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import assessmentService from '../../services/assessmentService';
import { ApiAssessment, AssessmentKind } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

type SortField = 'title' | 'chapter' | 'type' | 'kind' | 'questions';
type SortOrder = 'asc' | 'desc';

const Assessments: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<AssessmentKind | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string; questionCount: number }>({ isOpen: false, id: '', title: '', questionCount: 0 });
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Fetch assessments from API
  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { kind?: AssessmentKind } = {};
      if (kindFilter) params.kind = kindFilter;

      const response = await assessmentService.getAssessments(params);
      if (response.success && response.data) {
        setAssessments(response.data.assessments);
      } else {
        addToast('error', response.error?.message || 'Failed to load assessments');
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      addToast('error', 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, kindFilter]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.chapter?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort assessments
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'chapter') {
      comparison = (a.chapter?.name || '').localeCompare(b.chapter?.name || '');
    } else if (sortField === 'type') {
      comparison = (a.assessmentType?.name || '').localeCompare(b.assessmentType?.name || '');
    } else if (sortField === 'kind') {
      comparison = a.kind.localeCompare(b.kind);
    } else if (sortField === 'questions') {
      comparison = (a._count?.questions ?? 0) - (b._count?.questions ?? 0);
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

  const getSkillNames = (assessment: ApiAssessment) => {
    if (!assessment.skills || assessment.skills.length === 0) return '-';
    return assessment.skills.map(s => s.skill.name).join(', ');
  };

  const handleDelete = async () => {
    try {
      const response = await assessmentService.deleteAssessment(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Assessment deleted successfully');
        fetchAssessments();
      } else {
        addToast('error', response.error?.message || 'Failed to delete assessment');
      }
    } catch (error: unknown) {
      console.error('Failed to delete assessment:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete assessment');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', title: '', questionCount: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading assessments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '', questionCount: 0 })}
        onConfirm={handleDelete}
        title="Delete Assessment"
        message={deleteConfirm.questionCount > 0
          ? `Warning: "${deleteConfirm.title}" has ${deleteConfirm.questionCount} question(s). Deleting this will permanently delete all associated questions. This action cannot be undone.`
          : `Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`
        }
        confirmText="Delete"
        type="danger"
      />

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">Assessments</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage assessments and their questions</p>
      </div>

      {assessments.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-gray-400">quiz</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Assessments Yet</h3>
          <p className="text-gray-500 max-w-md text-center mb-8">
            Create assessments to evaluate student knowledge. Navigate to a chapter to add assessments.
          </p>
          <button
            onClick={() => navigate('/courses/chapters')}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">menu_book</span>
            Go to Chapters
          </button>
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-4 items-center">
              <div className="relative max-w-sm w-full group">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                />
              </div>
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as AssessmentKind | '')}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
              >
                <option value="">All Types</option>
                <option value="PRE_KBA">Pre-KBA</option>
                <option value="POST_KBA">Post-KBA</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/courses/chapters')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Assessment
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('title')}
                >
                  <span className="flex items-center">Title<SortIcon field="title" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('chapter')}
                >
                  <span className="flex items-center">Chapter<SortIcon field="chapter" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('type')}
                >
                  <span className="flex items-center">Type<SortIcon field="type" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('kind')}
                >
                  <span className="flex items-center">Kind<SortIcon field="kind" /></span>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 cursor-pointer hover:text-primary-600 select-none"
                  onClick={() => handleSort('questions')}
                >
                  <span className="flex items-center">Questions<SortIcon field="questions" /></span>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Skills</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {sortedAssessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No assessments found matching your search.
                  </td>
                </tr>
              ) : (
                sortedAssessments.map((assessment, idx) => (
                  <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{assessment.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{assessment.durationHours}hr • {assessment.passingCutoff}% cutoff</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {assessment.chapter?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {assessment.assessmentType?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        assessment.kind === 'PRE_KBA'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {assessment.kind === 'PRE_KBA' ? 'Pre-KBA' : 'Post-KBA'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {assessment._count?.questions ?? 0} questions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {getSkillNames(assessment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/courses/chapters/${assessment.chapterId}/assessments/${assessment.id}/questions`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Manage questions"
                        >
                          <span className="material-symbols-outlined text-[20px]">quiz</span>
                        </button>
                        <button
                          onClick={() => navigate(`/courses/chapters/${assessment.chapterId}/assessments/${assessment.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit assessment"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: assessment.id, title: assessment.title, questionCount: assessment._count?.questions ?? 0 })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete assessment"
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

export default Assessments;
