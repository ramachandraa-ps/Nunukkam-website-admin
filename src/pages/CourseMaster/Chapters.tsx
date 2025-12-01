import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const Chapters: React.FC = () => {
  const navigate = useNavigate();
  const { chapters, skills, deleteChapter } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chapters</h1>
          <p className="text-sm text-gray-500 mt-1">Define chapters with content and assessments to map to modules.</p>
        </div>
        <button
          onClick={() => navigate('/courses/chapters/add')}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Chapter
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md w-full group">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Chapter Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">No. of Assessments</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Skills Associated</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {filteredChapters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No chapters found matching your search.' : 'No chapters added yet. Add your first chapter.'}
                </td>
              </tr>
            ) : (
              filteredChapters.map((chapter, idx) => (
                <tr key={chapter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{chapter.name}</p>
                      {chapter.pptFile && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">description</span>
                          PPT uploaded
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                      {chapter.assessments.length} Assessments
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {getSkillNames(chapter.skills).slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                      {chapter.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{chapter.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/courses/chapters/${chapter.id}/assessments/add`)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                        title="Add Assessment"
                      >
                        <span className="material-symbols-outlined">quiz</span>
                      </button>
                      <button
                        onClick={() => navigate(`/courses/chapters/edit/${chapter.id}`)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: chapter.id })}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
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

export default Chapters;
