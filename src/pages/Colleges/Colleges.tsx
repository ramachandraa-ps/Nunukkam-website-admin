import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const Colleges: React.FC = () => {
  const navigate = useNavigate();
  const { colleges, deleteCollege } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteCollege(deleteConfirm.id)}
        title="Delete College"
        message="Are you sure you want to delete this college? All associated students and schedules will also be deleted."
        confirmText="Delete"
        type="danger"
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Program Management</h1>
        <p className="text-sm text-gray-500">Manage colleges and student enrollments</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="relative max-w-sm w-full">
          <Input
            placeholder="Search by college name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="search"
          />
        </div>
        <Button onClick={() => navigate('/colleges/add')} icon="add">
          Create New College
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Sl.no</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">College Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">University</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">POC Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">City</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Students</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No colleges found matching your search.' : 'No colleges added yet. Create your first college.'}
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college, idx) => (
                  <tr key={college.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{college.name}</p>
                        <p className="text-xs text-gray-400">{college.state}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{college.university}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{college.pocName}</p>
                        <p className="text-xs text-gray-400">{college.pocNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{college.city}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {college.students.length} Students
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/colleges/${college.id}/students`)}
                          className="text-xs font-bold uppercase tracking-wide"
                        >
                          Add Students
                        </Button>
                        <button
                          onClick={() => navigate(`/colleges/${college.id}/schedule`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                          title="Schedule Sessions"
                        >
                          <span className="material-symbols-outlined">calendar_month</span>
                        </button>
                        <button
                          onClick={() => navigate(`/colleges/edit/${college.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: college.id })}
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
    </div>
  );
};

export default Colleges;
