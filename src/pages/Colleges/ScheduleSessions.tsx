import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

interface ScheduleItem {
  date: Date;
  batch: string;
  chapter: string;
}

interface DeadlineItem {
  title: string;
  submissionDate: Date;
}

const ScheduleSessions: React.FC = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  // Read query params
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'deadlines' ? 'deadlines' : 'sessions';

  const { colleges, chapters, updateCollege, addToast } = useStore();

  const college = colleges.find(c => c.id === collegeId);
  const batches = college ? [...new Set(college.students.map(s => s.batch))].filter(Boolean) : [];

  const [activeTab, setActiveTab] = useState<'sessions' | 'deadlines'>(initialTab);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'session' | 'deadline'; index: number }>({ isOpen: false, type: 'session', index: -1 });

  const [sessionForm, setSessionForm] = useState({
    date: '',
    batch: '',
    chapter: '',
  });

  const [deadlineForm, setDeadlineForm] = useState({
    title: '',
    submissionDate: '',
  });

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

  const handleAddSession = () => {
    if (sessionForm.date && sessionForm.batch && sessionForm.chapter) {
      const newSchedule: ScheduleItem = {
        date: new Date(sessionForm.date),
        batch: sessionForm.batch,
        chapter: sessionForm.chapter,
      };
      updateCollege(college.id, {
        schedules: [...college.schedules, newSchedule],
      });
      setIsSessionModalOpen(false);
      setSessionForm({ date: '', batch: '', chapter: '' });
    } else {
      addToast('warning', 'Please fill all fields');
    }
  };

  const handleAddDeadline = () => {
    if (deadlineForm.title && deadlineForm.submissionDate) {
      const newDeadline: DeadlineItem = {
        title: deadlineForm.title,
        submissionDate: new Date(deadlineForm.submissionDate),
      };
      updateCollege(college.id, {
        assessmentDeadlines: [...college.assessmentDeadlines, newDeadline],
      });
      setIsDeadlineModalOpen(false);
      setDeadlineForm({ title: '', submissionDate: '' });
    } else {
      addToast('warning', 'Please fill all fields');
    }
  };

  const handleDelete = () => {
    if (deleteConfirm.type === 'session') {
      const updatedSchedules = college.schedules.filter((_, idx) => idx !== deleteConfirm.index);
      updateCollege(college.id, { schedules: updatedSchedules });
    } else {
      const updatedDeadlines = college.assessmentDeadlines.filter((_, idx) => idx !== deleteConfirm.index);
      updateCollege(college.id, { assessmentDeadlines: updatedDeadlines });
    }
    setDeleteConfirm({ isOpen: false, type: 'session', index: -1 });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const sortedSchedules = [...college.schedules].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedDeadlines = [...college.assessmentDeadlines].sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'session', index: -1 })}
        onConfirm={handleDelete}
        title={deleteConfirm.type === 'session' ? 'Delete Session' : 'Delete Deadline'}
        message={`Are you sure you want to delete this ${deleteConfirm.type}?`}
        confirmText="Delete"
        type="danger"
      />

      {/* Session Modal */}
      <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} title="Schedule New Session" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Session Date *</label>
            <input
              type="date"
              value={sessionForm.date}
              onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Batch *</label>
            {batches.length > 0 ? (
              <select
                value={sessionForm.batch}
                onChange={(e) => setSessionForm({ ...sessionForm, batch: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              >
                <option value="">Select batch</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={sessionForm.batch}
                onChange={(e) => setSessionForm({ ...sessionForm, batch: e.target.value })}
                placeholder="Enter batch name"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Chapter *</label>
            <select
              value={sessionForm.chapter}
              onChange={(e) => setSessionForm({ ...sessionForm, chapter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            >
              <option value="">Select chapter</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.name}>{ch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsSessionModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleAddSession}
              disabled={!sessionForm.date || !sessionForm.batch || !sessionForm.chapter}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"
            >
              Add Session
            </button>
          </div>
        </div>
      </Modal>

      {/* Deadline Modal */}
      <Modal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} title="Add Assessment Deadline" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              value={deadlineForm.title}
              onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })}
              placeholder="Enter assessment title"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Submission Date *</label>
            <input
              type="date"
              value={deadlineForm.submissionDate}
              onChange={(e) => setDeadlineForm({ ...deadlineForm, submissionDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsDeadlineModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleAddDeadline}
              disabled={!deadlineForm.title || !deadlineForm.submissionDate}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"
            >
              Add Deadline
            </button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div>
        <button onClick={() => navigate(`/colleges/${college.id}/students`)} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Students
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{college.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Schedule training sessions and assessment deadlines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sessions'
            ? 'border-primary-700 text-primary-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Training Sessions ({college.schedules.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'deadlines'
            ? 'border-primary-700 text-primary-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
            Assessment Deadlines ({college.assessmentDeadlines.length})
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sessions' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Schedule Session
            </button>
          </div>

          {sortedSchedules.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">event_busy</span>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No sessions scheduled</h3>
              <p className="text-sm text-gray-400">Create your first training session for this college</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedSchedules.map((schedule, idx) => {
                const isPast = new Date(schedule.date) < new Date();
                return (
                  <div
                    key={idx}
                    className={`bg-white dark:bg-gray-800 rounded-xl border ${isPast ? 'border-gray-200 opacity-60' : 'border-gray-100'} p-5 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${isPast ? 'bg-gray-100' : 'bg-primary-50'}`}>
                        <span className={`text-lg font-bold ${isPast ? 'text-gray-500' : 'text-primary-700'}`}>
                          {new Date(schedule.date).getDate()}
                        </span>
                        <span className={`text-xs ${isPast ? 'text-gray-400' : 'text-primary-600'}`}>
                          {new Date(schedule.date).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{schedule.chapter}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                            {schedule.batch}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(schedule.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPast && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">Completed</span>
                      )}
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'session', index: idx })}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsDeadlineModalOpen(true)}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Deadline
            </button>
          </div>

          {sortedDeadlines.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">assignment_late</span>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No deadlines set</h3>
              <p className="text-sm text-gray-400">Add assessment deadlines for this college</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Assessment Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Submission Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedDeadlines.map((deadline, idx) => {
                    const isPast = new Date(deadline.submissionDate) < new Date();
                    const daysLeft = Math.ceil((new Date(deadline.submissionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(deadline.submissionDate)}</td>
                        <td className="px-6 py-4">
                          {isPast ? (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">Past Due</span>
                          ) : daysLeft <= 3 ? (
                            <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-lg font-medium">Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                          ) : daysLeft <= 7 ? (
                            <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-lg font-medium">Due in {daysLeft} days</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg font-medium">Upcoming</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, type: 'deadline', index: idx })}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleSessions;
