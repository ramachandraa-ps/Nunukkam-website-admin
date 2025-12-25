import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import batchService from '../../services/batchService';
import attendanceService from '../../services/attendanceService';
import { ApiBatch, BatchAttendanceSummaryResponse } from '../../types/college';

const BatchAttendanceSummary: React.FC = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [batch, setBatch] = useState<ApiBatch | null>(null);
  const [summary, setSummary] = useState<BatchAttendanceSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchData = useCallback(async () => {
    if (!batchId) return;

    setIsLoading(true);
    try {
      const [batchRes, summaryRes] = await Promise.all([
        batchService.getBatchById(batchId),
        attendanceService.getBatchAttendanceSummary(batchId),
      ]);

      if (batchRes.success && batchRes.data) {
        setBatch(batchRes.data.batch);
      }

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load attendance summary');
    } finally {
      setIsLoading(false);
    }
  }, [batchId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredAndSortedStudents = React.useMemo(() => {
    if (!summary) return [];

    let students = [...summary.studentSummary];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      students = students.filter(
        (s) =>
          s.studentName.toLowerCase().includes(query) ||
          s.studentEmail.toLowerCase().includes(query)
      );
    }

    // Sort
    students.sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.studentName.localeCompare(b.studentName);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.attendancePercentage - b.attendancePercentage;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return students;
  }, [summary, searchQuery, sortBy, sortOrder]);

  const averageAttendance = React.useMemo(() => {
    if (!summary || summary.studentSummary.length === 0) return 0;
    const total = summary.studentSummary.reduce((acc, s) => acc + s.attendancePercentage, 0);
    return Math.round(total / summary.studentSummary.length);
  }, [summary]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading attendance summary...</span>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">Batch not found</h3>
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
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{batch.name} - Attendance Summary</h1>
        {batch.college && (
          <p className="text-sm text-gray-500 mt-1">{batch.college.name}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalStudents || 0}</span>
          <p className="text-sm text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalSessions || 0}</span>
          <p className="text-sm text-gray-500 mt-1">Total Sessions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className={`text-2xl font-bold ${averageAttendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {averageAttendance}%
          </span>
          <p className="text-sm text-gray-500 mt-1">Avg. Attendance</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl font-bold text-orange-600">
            {summary?.studentSummary.filter((s) => s.attendancePercentage < 75).length || 0}
          </span>
          <p className="text-sm text-gray-500 mt-1">Low Attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'attendance')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
          >
            <option value="name">Sort by Name</option>
            <option value="attendance">Sort by Attendance</option>
          </select>
          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
          >
            <span className="material-symbols-outlined">
              {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
          </button>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">Student Attendance Details</h3>
        </div>
        {filteredAndSortedStudents.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">people</span>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery ? 'No students found' : 'No students in this batch'}
            </h3>
            <p className="text-sm text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Add students to the batch to view attendance'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Present</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Absent</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredAndSortedStudents.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.studentName}</p>
                        <p className="text-sm text-gray-500">{student.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                        {student.presentCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
                        {student.absentCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                      {student.totalSessions}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(student.attendancePercentage)} transition-all`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          />
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getAttendanceColor(student.attendancePercentage)}`}>
                          {student.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchAttendanceSummary;
