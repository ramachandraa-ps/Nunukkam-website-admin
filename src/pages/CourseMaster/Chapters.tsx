import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const Chapters: React.FC = () => {
  const navigate = useNavigate();
  const { chapters, skills, deleteChapter } = useStore();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const getSkillNames = (skillIds: string[]) => {
    return skillIds.map(id => skills.find(s => s.id === id)?.name || 'Unknown');
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteChapter(deleteConfirm.id)}
        title="Delete Chapter"
        message="Are you sure you want to delete this chapter? All associated assessments will also be deleted."
        confirmText="Delete"
        type="danger"
      />

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">Add chapters</span>
        </h1>
      </div>

      {chapters.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-[60vh] flex flex-col items-center justify-center">
          <button
            onClick={() => navigate('/courses/chapters/add')}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1"
          >
            Add chapter
          </button>
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              onClick={() => navigate('/courses/chapters/add')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              Add chapters
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Chapter name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">no of assessments</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Skills associated</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {chapters.map((chapter, idx) => (
                <tr key={chapter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    {chapter.name}
                    <div className="text-xs font-normal text-gray-400 mt-0.5">
                      {chapter.pptFile ? 'PPT Uploaded' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {chapter.assessments.length}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {getSkillNames(chapter.skills).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/courses/chapters/edit/${chapter.id}`)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Chapters;
