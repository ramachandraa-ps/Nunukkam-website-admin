import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import collegeService from '../../services/collegeService';
import { ApiCollege } from '../../types/college';

const Colleges: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [colleges, setColleges] = useState<ApiCollege[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });

  // Fetch colleges from API
  const fetchColleges = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await collegeService.getColleges();
      if (response.success && response.data) {
        setColleges(response.data.colleges);
      }
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
      addToast('error', 'Failed to load colleges');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleDelete = async () => {
    try {
      const response = await collegeService.deleteCollege(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'College deleted successfully');
        fetchColleges();
      } else {
        addToast('error', response.error?.message || 'Failed to delete college');
      }
    } catch (error: unknown) {
      console.error('Failed to delete college:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete college');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading colleges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete College"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? All associated batches and students will also be affected.`}
        confirmText="Delete"
        type="danger"
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Program Management</h1>
        <p className="text-sm text-gray-500">Manage colleges and student enrollments ({colleges.length} colleges)</p>
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Stats</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">school</span>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {searchTerm ? 'No colleges found' : 'No colleges added yet'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {searchTerm ? 'Try a different search term' : 'Create your first college to get started'}
                    </p>
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
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{college.affiliatedUniversity}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{college.pocName}</p>
                        <p className="text-xs text-gray-400">{college.pocNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{college.city}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">
                          {college._count?.students || 0} Students
                        </Badge>
                        <Badge variant="outline">
                          {college._count?.batches || 0} Batches
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/colleges/${college.id}/batches`)}
                          className="text-xs font-bold uppercase tracking-wide"
                        >
                          Batches
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/colleges/${college.id}/students`)}
                          className="text-xs font-bold uppercase tracking-wide"
                        >
                          Students
                        </Button>
                        <button
                          onClick={() => navigate(`/colleges/${college.id}/schedule`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
                          title="Schedule Sessions"
                        >
                          <span className="material-symbols-outlined">calendar_month</span>
                        </button>
                        <button
                          onClick={() => navigate(`/colleges/edit/${college.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: college.id, name: college.name })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
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
