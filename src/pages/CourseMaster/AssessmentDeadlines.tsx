import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import assessmentDeadlineService from '../../services/assessmentDeadlineService';
import assessmentService from '../../services/assessmentService';
import batchService from '../../services/batchService';
import { ApiAssessmentDeadline, ApiAssessment } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Modal from '../../components/shared/Modal';

interface ApiBatch {
  id: string;
  name: string;
  course?: { id: string; title: string };
}

const AssessmentDeadlines: React.FC = () => {
  const { addToast } = useStore();

  const [deadlines, setDeadlines] = useState<ApiAssessmentDeadline[]>([]);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const [formData, setFormData] = useState({
    assessmentId: '',
    batchId: '',
    deadline: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filterBatch, setFilterBatch] = useState('');
  const [filterAssessment, setFilterAssessment] = useState('');

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { batchId?: string; assessmentId?: string } = {};
      if (filterBatch) params.batchId = filterBatch;
      if (filterAssessment) params.assessmentId = filterAssessment;

      const [deadlinesRes, assessmentsRes, batchesRes] = await Promise.all([
        assessmentDeadlineService.getDeadlines(params),
        assessmentService.getAssessments(),
        batchService.getBatches(),
      ]);

      if (deadlinesRes.success && deadlinesRes.data) {
        setDeadlines(deadlinesRes.data.deadlines);
      }
      if (assessmentsRes.success && assessmentsRes.data) {
        setAssessments(assessmentsRes.data.assessments);
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
  }, [addToast, filterBatch, filterAssessment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (deadline?: ApiAssessmentDeadline) => {
    if (deadline) {
      setEditingId(deadline.id);
      setFormData({
        assessmentId: deadline.assessmentId,
        batchId: deadline.batchId,
        deadline: new Date(deadline.deadline).toISOString().slice(0, 16),
      });
    } else {
      setEditingId(null);
      setFormData({ assessmentId: '', batchId: '', deadline: '' });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!editingId) {
      if (!formData.assessmentId) newErrors.assessmentId = 'Assessment is required';
      if (!formData.batchId) newErrors.batchId = 'Batch is required';
    }
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await assessmentDeadlineService.updateDeadline(editingId, {
          deadline: new Date(formData.deadline).toISOString(),
        });
        if (response.success) {
          addToast('success', 'Deadline updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to update deadline');
        }
      } else {
        const response = await assessmentDeadlineService.createDeadline({
          assessmentId: formData.assessmentId,
          batchId: formData.batchId,
          deadline: new Date(formData.deadline).toISOString(),
        });
        if (response.success) {
          addToast('success', 'Deadline created successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to create deadline');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save deadline:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save deadline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await assessmentDeadlineService.deleteDeadline(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Deadline deleted successfully');
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to delete deadline');
      }
    } catch (error: unknown) {
      console.error('Failed to delete deadline:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete deadline');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '' });
    }
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getBatchName = (batchId: string) => {
    return batches.find(b => b.id === batchId)?.name || 'Unknown Batch';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading deadlines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={handleDelete}
        title="Delete Deadline"
        message="Are you sure you want to delete this deadline?"
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Deadline' : 'Add Deadline'} size="md">
        <div className="space-y-6">
          {!editingId && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Assessment *</label>
                <select
                  value={formData.assessmentId}
                  onChange={(e) => {
                    setFormData({ ...formData, assessmentId: e.target.value });
                    if (errors.assessmentId) setErrors({ ...errors, assessmentId: '' });
                  }}
                  className={`w-full px-4 py-2.5 border ${errors.assessmentId ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700`}
                >
                  <option value="">Select assessment</option>
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.chapter?.name || 'No chapter'})
                    </option>
                  ))}
                </select>
                {errors.assessmentId && <span className="text-xs text-red-500 mt-1">{errors.assessmentId}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Batch *</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => {
                    setFormData({ ...formData, batchId: e.target.value });
                    if (errors.batchId) setErrors({ ...errors, batchId: '' });
                  }}
                  className={`w-full px-4 py-2.5 border ${errors.batchId ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700`}
                >
                  <option value="">Select batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.course ? `(${b.course.title})` : ''}
                    </option>
                  ))}
                </select>
                {errors.batchId && <span className="text-xs text-red-500 mt-1">{errors.batchId}</span>}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Deadline *</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => {
                setFormData({ ...formData, deadline: e.target.value });
                if (errors.deadline) setErrors({ ...errors, deadline: '' });
              }}
              className={`w-full px-4 py-2.5 border ${errors.deadline ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700`}
            />
            {errors.deadline && <span className="text-xs text-red-500 mt-1">{errors.deadline}</span>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {editingId ? 'Update' : 'Add'} Deadline
            </button>
          </div>
        </div>
      </Modal>

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Course master &rarr; </span>
          <span className="text-purple-600">Assessment Deadlines</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage assessment deadlines for batches</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
          >
            <option value="">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterAssessment}
            onChange={(e) => setFilterAssessment(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
          >
            <option value="">All Assessments</option>
            {assessments.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Deadline
        </button>
      </div>

      {/* Deadlines List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {deadlines.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">schedule</span>
            </div>
            <p className="font-medium">No deadlines found</p>
            <p className="text-sm mt-1">Create your first assessment deadline using the button above.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Assessment</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Chapter</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Batch</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Deadline</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {deadlines.map((deadline, idx) => (
                <tr key={deadline.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {deadline.assessment?.title || 'Unknown'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      deadline.assessment?.kind === 'PRE_KBA' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {deadline.assessment?.kind === 'PRE_KBA' ? 'Pre-KBA' : 'Post-KBA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {deadline.assessment?.chapter?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {getBatchName(deadline.batchId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDeadline(deadline.deadline)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      isOverdue(deadline.deadline)
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {isOverdue(deadline.deadline) ? 'Overdue' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(deadline)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit deadline"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: deadline.id })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete deadline"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssessmentDeadlines;
