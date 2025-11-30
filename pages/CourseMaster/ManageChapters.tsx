import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ManageChapters: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 relative min-h-[80vh]">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Link to="/courses" className="hover:text-primary-700 transition-colors">Course Master</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200">Manage Chapters</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Chapters</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 w-16">Sl.no</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Chapter Name</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">No of assessments</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Skills associated</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 w-24">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">1</td>
                        <td className="px-6 py-4"><Link to="#" className="text-primary-700 font-bold hover:underline">Introduction to Algebra</Link></td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">5</td>
                        <td className="px-6 py-4 truncate max-w-xs text-sm text-gray-500 dark:text-gray-400" title="Problem Solving, Logical Reasoning">Problem Solving, Logic...</td>
                        <td className="px-6 py-4">
                            <button onClick={() => navigate('/courses/assessments/add-questions')} className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">2</td>
                        <td className="px-6 py-4"><Link to="#" className="text-primary-700 font-bold hover:underline">Linear Equations</Link></td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">3</td>
                        <td className="px-6 py-4 truncate max-w-xs text-sm text-gray-500 dark:text-gray-400">Critical Thinking, Analysis...</td>
                        <td className="px-6 py-4">
                            <button className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-30">
        <button className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined">add</span>
            <span className="font-bold text-base">Add Chapter</span>
        </button>
      </div>
    </div>
  );
};

export default ManageChapters;