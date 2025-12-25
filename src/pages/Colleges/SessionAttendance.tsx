import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import sessionService from '../../services/sessionService';
import attendanceService from '../../services/attendanceService';
import { ApiSession, SessionAttendanceResponse } from '../../types/college';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  present: boolean | null;
  attendanceId: string | null;
}

const SessionAttendance: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [session, setSession] = useState<ApiSession | null>(null);
  const [attendanceData, setAttendanceData] = useState<SessionAttendanceResponse | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const [sessionRes, attendanceRes] = await Promise.all([
        sessionService.getSessionById(sessionId),
        attendanceService.getSessionAttendance(sessionId),
      ]);

      if (sessionRes.success && sessionRes.data) {
        setSession(sessionRes.data.session);
      }

      if (attendanceRes.success && attendanceRes.data) {
        setAttendanceData(attendanceRes.data);
        setAttendance(attendanceRes.data.attendance);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleAttendance = (studentId: string, present: boolean) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, present } : record
      )
    );
    setHasChanges(true);
  };

  const handleMarkAllPresent = () => {
    setAttendance((prev) => prev.map((record) => ({ ...record, present: true })));
    setHasChanges(true);
  };

  const handleMarkAllAbsent = () => {
    setAttendance((prev) => prev.map((record) => ({ ...record, present: false })));
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    if (!sessionId) return;

    setIsSaving(true);
    try {
      const attendanceData = attendance
        .filter((record) => record.present !== null)
        .map((record) => ({
          studentId: record.studentId,
          present: record.present as boolean,
        }));

      const response = await attendanceService.bulkMarkAttendance(sessionId, {
        attendance: attendanceData,
      });

      if (response.success) {
        addToast('success', 'Attendance saved successfully');
        setHasChanges(false);
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to save attendance');
      }
    } catch (error: unknown) {
      console.error('Failed to save attendance:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const presentCount = attendance.filter((r) => r.present === true).length;
  const absentCount = attendance.filter((r) => r.present === false).length;
  const notMarkedCount = attendance.filter((r) => r.present === null).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading attendance data...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">Session not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Sessions
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full font-medium">
                {session.chapter?.name || 'Unknown Chapter'}
              </span>
              <span className="text-gray-500">{formatDate(session.date)}</span>
            </div>
            {session.batch && (
              <p className="text-sm text-gray-500 mt-1">
                Batch: {session.batch.name} {session.batch.college && `• ${session.batch.college.name}`}
              </p>
            )}
          </div>
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving || !hasChanges}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{attendance.length}</span>
          <p className="text-sm text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-green-600">{presentCount}</span>
          <p className="text-sm text-gray-500 mt-1">Present</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-red-600">{absentCount}</span>
          <p className="text-sm text-gray-500 mt-1">Absent</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-gray-400">{notMarkedCount}</span>
          <p className="text-sm text-gray-500 mt-1">Not Marked</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleMarkAllPresent}
          className="px-4 py-2 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 font-medium text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Mark All Present
        </button>
        <button
          onClick={handleMarkAllAbsent}
          className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">cancel</span>
          Mark All Absent
        </button>
      </div>

      {/* Attendance List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">Student Attendance</h3>
        </div>
        {attendance.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">people</span>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No students in this batch</h3>
            <p className="text-sm text-gray-400">Add students to the batch to mark attendance</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {attendance.map((record, index) => (
              <div key={record.studentId} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-8">{index + 1}.</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{record.studentName}</h4>
                    <p className="text-sm text-gray-500">{record.studentEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAttendance(record.studentId, true)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      record.present === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleToggleAttendance(record.studentId, false)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      record.present === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Save Button for Mobile */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="px-6 py-3 bg-primary-700 text-white rounded-full font-medium shadow-xl flex items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionAttendance;
