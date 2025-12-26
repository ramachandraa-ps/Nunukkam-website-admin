import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import collegeService from '../../services/collegeService';
import batchService from '../../services/batchService';
import sessionService from '../../services/sessionService';
import chapterService from '../../services/chapterService';
import { ApiCollege, ApiBatch, ApiSession } from '../../types/college';
import { ApiChapter } from '../../types/course';

const ScheduleSessions: React.FC = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'attendance' ? 'attendance' : 'sessions';

  const { addToast } = useStore();

  const [college, setCollege] = useState<ApiCollege | null>(null);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [chapters, setChapters] = useState<ApiChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'sessions' | 'attendance'>(initialTab);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; chapter: string }>({ isOpen: false, id: '', chapter: '' });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [sessionForm, setSessionForm] = useState({
    date: '',
    batchId: '',
    chapterId: '',
  });

  // Fetch college and related data
  const fetchData = useCallback(async () => {
    if (!collegeId) return;

    setIsLoading(true);
    try {
      const [collegeRes, batchesRes, chaptersRes] = await Promise.all([
        collegeService.getCollegeById(collegeId),
        batchService.getBatches(collegeId),
        chapterService.getChapters({ limit: 100 }),
      ]);

      if (collegeRes.success && collegeRes.data) {
        setCollege(collegeRes.data.college);
      }

      if (batchesRes.success && batchesRes.data) {
        setBatches(batchesRes.data.batches);
      }

      if (chaptersRes.success && chaptersRes.data) {
        setChapters(chaptersRes.data.chapters);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load college data');
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, addToast]);

  // Fetch sessions based on batch filter
  const fetchSessions = useCallback(async () => {
    if (!collegeId) return;

    try {
      // Get all batch IDs for this college
      const batchIds = selectedBatchFilter ? [selectedBatchFilter] : batches.map(b => b.id);

      if (batchIds.length === 0) {
        setSessions([]);
        return;
      }

      // If filtering by specific batch
      if (selectedBatchFilter) {
        const response = await sessionService.getSessions({ batchId: selectedBatchFilter, limit: 100 });
        if (response.success && response.data) {
          setSessions(response.data.sessions);
        }
      } else {
        // Fetch sessions for all batches
        const allSessions: ApiSession[] = [];
        for (const batch of batches) {
          const response = await sessionService.getSessions({ batchId: batch.id, limit: 100 });
          if (response.success && response.data) {
            allSessions.push(...response.data.sessions);
          }
        }
        setSessions(allSessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, [collegeId, batches, selectedBatchFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (batches.length > 0) {
      fetchSessions();
    }
  }, [batches, fetchSessions]);

  const handleAddSession = async () => {
    if (!sessionForm.date || !sessionForm.batchId || !sessionForm.chapterId) {
      addToast('warning', 'Please fill all fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await sessionService.createSession({
        batchId: sessionForm.batchId,
        chapterId: sessionForm.chapterId,
        date: new Date(sessionForm.date).toISOString(),
      });

      if (response.success) {
        addToast('success', 'Session scheduled successfully');
        setIsSessionModalOpen(false);
        setSessionForm({ date: '', batchId: '', chapterId: '' });
        fetchSessions();
      } else {
        addToast('error', response.error?.message || 'Failed to schedule session');
      }
    } catch (error: unknown) {
      console.error('Failed to create session:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to schedule session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      const response = await sessionService.deleteSession(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Session deleted successfully');
        fetchSessions();
      } else {
        addToast('error', response.error?.message || 'Failed to delete session');
      }
    } catch (error: unknown) {
      console.error('Failed to delete session:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Cannot delete session with attendance records');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', chapter: '' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionsForDate = (day: number) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getDate() === day &&
        sessionDate.getMonth() === currentMonth.getMonth() &&
        sessionDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear();
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 dark:bg-gray-900/50"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = getSessionsForDate(day);
      const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <div
          key={day}
          className={`min-h-24 p-2 border-b border-r border-gray-100 dark:border-gray-700 ${
            isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20' : isPast ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday(day) ? 'text-primary-700 dark:text-primary-400' : isPast ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {daySessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/attendance/session/${session.id}`)}
                className={`text-xs p-1 rounded cursor-pointer truncate ${
                  isPast
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    : 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/60'
                }`}
                title={`${session.chapter?.name || 'Session'} - ${session.batch?.name || 'Batch'}`}
              >
                {session.chapter?.name?.substring(0, 15) || 'Session'}
                {(session.chapter?.name?.length || 0) > 15 ? '...' : ''}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white min-w-[200px] text-center">
              {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary-100 dark:bg-primary-900/40"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Upcoming Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Past Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading schedule data...</span>
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
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', chapter: '' })}
        onConfirm={handleDeleteSession}
        title="Delete Session"
        message={`Are you sure you want to delete the session for "${deleteConfirm.chapter}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Session Modal */}
      <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} title="Schedule New Session" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Session Date *</label>
            <input
              type="date"
              value={sessionForm.date}
              onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Batch *</label>
            {batches.length > 0 ? (
              <select
                value={sessionForm.batchId}
                onChange={(e) => setSessionForm({ ...sessionForm, batchId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">No batches available</span>
                <button
                  type="button"
                  onClick={() => navigate(`/colleges/${collegeId}/batches`)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create Batch
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Chapter *</label>
            <select
              value={sessionForm.chapterId}
              onChange={(e) => setSessionForm({ ...sessionForm, chapterId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select chapter</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} {ch.module ? `(${ch.module.title})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsSessionModalOpen(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSession}
              disabled={isSaving || !sessionForm.date || !sessionForm.batchId || !sessionForm.chapterId}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Add Session
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
        <p className="text-sm text-gray-500 mt-1">Schedule training sessions and manage attendance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sessions'
            ? 'border-primary-700 text-primary-700'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Training Sessions ({sessions.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance'
            ? 'border-primary-700 text-primary-700'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">fact_check</span>
            Attendance
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sessions' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {batches.length > 0 && (
                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
                >
                  <option value="">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              )}
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_view_month</span>
                  Calendar
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsSessionModalOpen(true)}
              disabled={batches.length === 0}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">add</span>
              Schedule Session
            </button>
          </div>

          {batches.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">groups</span>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No batches available</h3>
              <p className="text-sm text-gray-400 mb-6">Create a batch first before scheduling sessions</p>
              <button
                onClick={() => navigate(`/colleges/${collegeId}/batches`)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Create Batch
              </button>
            </div>
          ) : viewMode === 'calendar' ? (
            renderCalendarView()
          ) : sortedSessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">event_busy</span>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No sessions scheduled</h3>
              <p className="text-sm text-gray-400">Create your first training session for this college</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedSessions.map((session) => {
                const isPast = new Date(session.date) < new Date();
                return (
                  <div
                    key={session.id}
                    className={`bg-white dark:bg-gray-800 rounded-xl border ${isPast ? 'border-gray-200 dark:border-gray-600 opacity-60' : 'border-gray-100 dark:border-gray-700'} p-5 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${isPast ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary-50 dark:bg-primary-900/30'}`}>
                        <span className={`text-lg font-bold ${isPast ? 'text-gray-500' : 'text-primary-700 dark:text-primary-400'}`}>
                          {new Date(session.date).getDate()}
                        </span>
                        <span className={`text-xs ${isPast ? 'text-gray-400' : 'text-primary-600 dark:text-primary-500'}`}>
                          {new Date(session.date).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{session.chapter?.name || 'Unknown Chapter'}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                            {session.batch?.name || 'Unknown Batch'}
                          </span>
                          {session.chapter?.module && (
                            <span className="text-xs text-gray-500">{session.chapter.module.title}</span>
                          )}
                          <span className="text-xs text-gray-400">{formatDate(session.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session._count?.attendance !== undefined && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg">
                          {session._count.attendance} attended
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-lg font-medium">Completed</span>
                      )}
                      <button
                        onClick={() => navigate(`/attendance/session/${session.id}`)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Mark Attendance"
                      >
                        <span className="material-symbols-outlined">fact_check</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: session.id, chapter: session.chapter?.name || '' })}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Session"
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
          {batches.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">groups</span>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No batches available</h3>
              <p className="text-sm text-gray-400 mb-6">Create a batch first to manage attendance</p>
              <button
                onClick={() => navigate(`/colleges/${collegeId}/batches`)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Create Batch
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white">Batch Attendance Summary</h3>
                <p className="text-sm text-gray-500 mt-1">Select a batch to view detailed attendance</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/attendance/batch/${batch.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{batch.name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {batch._count?.students || 0} students • {batch._count?.sessions || 0} sessions
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleSessions;
