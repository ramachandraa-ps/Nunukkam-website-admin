import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import batchService from '../../services/batchService';
import collegeService from '../../services/collegeService';
import { ApiBatch, ApiCollege, CreateBatchRequest, UpdateBatchRequest } from '../../types/college';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

interface BatchFormData {
  name: string;
  startDate: string;
  endDate: string;
}

const ManageBatches: React.FC = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [college, setCollege] = useState<ApiCollege | null>(null);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ApiBatch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<Partial<BatchFormData>>({});

  // Fetch college and batches
  const fetchData = useCallback(async () => {
    if (!collegeId) return;

    setIsLoading(true);
    try {
      const [collegeRes, batchesRes] = await Promise.all([
        collegeService.getCollegeById(collegeId),
        batchService.getBatches(collegeId),
      ]);

      if (collegeRes.success && collegeRes.data) {
        setCollege(collegeRes.data.college);
      } else {
        addToast('error', 'Failed to load college');
      }

      if (batchesRes.success && batchesRes.data) {
        setBatches(batchesRes.data.batches);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({ name: '', startDate: '', endDate: '' });
    setErrors({});
    setEditingBatch(null);
  };

  const handleOpenModal = (batch?: ApiBatch) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        name: batch.name,
        startDate: batch.startDate.split('T')[0],
        endDate: batch.endDate.split('T')[0],
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BatchFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !collegeId) return;

    // Convert date strings to ISO datetime format
    const startDateISO = new Date(formData.startDate).toISOString();
    const endDateISO = new Date(formData.endDate).toISOString();

    setIsSaving(true);
    try {
      if (editingBatch) {
        // Update existing batch
        const updateData: UpdateBatchRequest = {
          name: formData.name,
          startDate: startDateISO,
          endDate: endDateISO,
        };

        const response = await batchService.updateBatch(editingBatch.id, updateData);
        if (response.success) {
          addToast('success', 'Batch updated successfully');
          handleCloseModal();
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to update batch');
        }
      } else {
        // Create new batch
        const createData: CreateBatchRequest = {
          collegeId,
          name: formData.name,
          startDate: startDateISO,
          endDate: endDateISO,
        };

        const response = await batchService.createBatch(createData);
        if (response.success) {
          addToast('success', 'Batch created successfully');
          handleCloseModal();
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to create batch');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save batch:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save batch');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await batchService.deleteBatch(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Batch deleted successfully');
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to delete batch');
      }
    } catch (error: unknown) {
      console.error('Failed to delete batch:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Cannot delete batch with students or sessions');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBatchStatus = (batch: ApiBatch) => {
    const now = new Date();
    const start = new Date(batch.startDate);
    const end = new Date(batch.endDate);

    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-50 text-blue-700' };
    } else if (now > end) {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-600' };
    } else {
      return { label: 'Active', color: 'bg-green-50 text-green-700' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading batches...</span>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">College not found</h3>
        <button onClick={() => navigate('/colleges')} className="mt-4 text-primary-600 hover:underline">
          Go back to colleges
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Batch"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone. Note: Batches with students or sessions cannot be deleted.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="text-gray-500 font-medium">Colleges &rarr; {college.name} &rarr; </span>
            <span className="text-purple-600">Manage Batches</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage batches for this college</p>
        </div>
        <button
          onClick={() => navigate(`/colleges/${collegeId}/students`)}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          View Students
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Batches</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{batches.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {batches.filter((b) => getBatchStatus(b).label === 'Active').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">
            {batches.filter((b) => getBatchStatus(b).label === 'Upcoming').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Students</p>
          <p className="text-2xl font-bold text-purple-600">
            {batches.reduce((sum, b) => sum + (b._count?.students || 0), 0)}
          </p>
        </div>
      </div>

      {/* Batches List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 dark:text-white">Batches</h2>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Batch
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">groups</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Batches Yet</h3>
            <p className="text-gray-500 mb-6">Create your first batch to start adding students</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Create First Batch
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {batches.map((batch) => {
              const status = getBatchStatus(batch);
              return (
                <div
                  key={batch.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{batch.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          {batch._count?.students || 0} students
                        </span>
                        {batch._count?.sessions !== undefined && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            {batch._count.sessions} sessions
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/colleges/${collegeId}/students?batchId=${batch.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View students"
                      >
                        <span className="material-symbols-outlined text-[20px]">group</span>
                      </button>
                      <button
                        onClick={() => handleOpenModal(batch)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit batch"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: batch.id, name: batch.name })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete batch"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/colleges')}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Colleges
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Batch 2025-A"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBatches;
