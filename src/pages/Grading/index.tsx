import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import gradingService from '../../services/gradingService';
import assessmentService from '../../services/assessmentService';
import { ApiSubmission, ApiAnswer, ApiAssessment } from '../../types/course';

const Grading: React.FC = () => {
  const { addToast } = useStore();

  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<ApiSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<{
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingSubmissions: number;
    averageScore: number;
    passRate: number;
  } | null>(null);

  // Fetch assessments for filter
  const fetchAssessments = useCallback(async () => {
    try {
      const response = await assessmentService.getAssessments({});
      if (response.success && response.data) {
        setAssessments(response.data.assessments);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  }, []);

  // Fetch pending submissions
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { assessmentId?: string } = {};
      if (selectedAssessment) params.assessmentId = selectedAssessment;

      const response = await gradingService.getPendingSubmissions(params);
      if (response.success && response.data) {
        setSubmissions(response.data.submissions);
      } else {
        addToast('error', response.error?.message || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      addToast('error', 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAssessment, addToast]);

  // Fetch grading stats for selected assessment
  const fetchStats = useCallback(async () => {
    if (!selectedAssessment) {
      setStats(null);
      return;
    }
    try {
      const response = await gradingService.getGradingStats(selectedAssessment);
      if (response.success && response.data) {
        setStats(response.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [selectedAssessment]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [fetchSubmissions, fetchStats]);

  const handleSelectSubmission = (submission: ApiSubmission) => {
    setSelectedSubmission(submission);
    // Initialize grades from existing scores
    const initialGrades: Record<string, number> = {};
    submission.answers?.forEach((answer) => {
      if (answer.score !== null && answer.score !== undefined) {
        initialGrades[answer.id] = answer.score;
      }
    });
    setGrades(initialGrades);
  };

  const handleGradeChange = (answerId: string, score: number, maxScore: number) => {
    const validScore = Math.min(Math.max(0, score), maxScore);
    setGrades((prev) => ({ ...prev, [answerId]: validScore }));
  };

  const handleSaveGrade = async (answerId: string) => {
    const score = grades[answerId];
    if (score === undefined) return;

    setIsGrading(true);
    try {
      const response = await gradingService.gradeAnswer(answerId, { score });
      if (response.success) {
        addToast('success', 'Grade saved');
      } else {
        addToast('error', response.error?.message || 'Failed to save grade');
      }
    } catch (error) {
      console.error('Failed to save grade:', error);
      addToast('error', 'Failed to save grade');
    } finally {
      setIsGrading(false);
    }
  };

  const handleBulkGrade = async () => {
    if (!selectedSubmission) return;

    const gradesToSubmit = Object.entries(grades).map(([answerId, score]) => ({
      answerId,
      score,
    }));

    if (gradesToSubmit.length === 0) {
      addToast('warning', 'No grades to submit');
      return;
    }

    setIsGrading(true);
    try {
      const response = await gradingService.bulkGradeAnswers({ grades: gradesToSubmit });
      if (response.success && response.data) {
        const { success, errors } = response.data;
        if (errors.length === 0) {
          addToast('success', `All ${success.length} grades saved successfully`);
        } else {
          addToast('warning', `${success.length} saved, ${errors.length} failed`);
        }
      } else {
        addToast('error', response.error?.message || 'Failed to save grades');
      }
    } catch (error) {
      console.error('Failed to bulk grade:', error);
      addToast('error', 'Failed to save grades');
    } finally {
      setIsGrading(false);
    }
  };

  const handleFinalizeGrading = async () => {
    if (!selectedSubmission) return;

    // Check if all answers are graded
    const ungradedAnswers = selectedSubmission.answers?.filter(
      (a) => grades[a.id] === undefined
    );
    if (ungradedAnswers && ungradedAnswers.length > 0) {
      addToast('warning', `Please grade all ${ungradedAnswers.length} remaining answers first`);
      return;
    }

    setIsGrading(true);
    try {
      // First save all grades
      await handleBulkGrade();

      // Then finalize
      const response = await gradingService.finalizeGrading(selectedSubmission.id);
      if (response.success && response.data) {
        const { totalScore, maxScore, percentage, gradeLevel, passed } = response.data;
        addToast(
          'success',
          `Grading finalized: ${totalScore}/${maxScore} (${percentage.toFixed(1)}%) - ${gradeLevel} - ${passed ? 'PASSED' : 'FAILED'}`
        );
        setSelectedSubmission(null);
        fetchSubmissions();
        fetchStats();
      } else {
        addToast('error', response.error?.message || 'Failed to finalize grading');
      }
    } catch (error) {
      console.error('Failed to finalize grading:', error);
      addToast('error', 'Failed to finalize grading');
    } finally {
      setIsGrading(false);
    }
  };

  const calculateProgress = () => {
    if (!selectedSubmission?.answers) return { graded: 0, total: 0 };
    const total = selectedSubmission.answers.length;
    const graded = Object.keys(grades).length;
    return { graded, total };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 font-medium">Assessments &rarr; </span>
          <span className="text-purple-600">Grading</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Grade student submissions and assessments</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Graded</p>
            <p className="text-2xl font-bold text-green-600">{stats.gradedSubmissions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingSubmissions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Score</p>
            <p className="text-2xl font-bold text-blue-600">{stats.averageScore?.toFixed(1) || '-'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pass Rate</p>
            <p className="text-2xl font-bold text-purple-600">{stats.passRate?.toFixed(1) || '-'}%</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Submissions List */}
        <div className="w-96 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <select
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-600 text-sm"
              >
                <option value="">All Assessments</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                  <p>No pending submissions</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => handleSelectSubmission(submission)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedSubmission?.id === submission.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {submission.student?.name || 'Unknown Student'}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            submission.gradedAt
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {submission.gradedAt ? 'Graded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{submission.student?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {submission.assessment?.title} • {submission.answers?.length || 0} answers
                      </p>
                      {submission.submittedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grading Panel */}
        <div className="flex-1">
          {selectedSubmission ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      {selectedSubmission.student?.name}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedSubmission.assessment?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="font-bold text-primary-600">
                      {calculateProgress().graded} / {calculateProgress().total}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{
                      width: `${
                        calculateProgress().total > 0
                          ? (calculateProgress().graded / calculateProgress().total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Answers List */}
              <div className="max-h-[50vh] overflow-y-auto p-4 space-y-4">
                {selectedSubmission.answers?.map((answer: ApiAnswer, idx: number) => (
                  <div
                    key={answer.id}
                    className="border border-gray-100 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Question {idx + 1}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {answer.question?.questionText}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        Max: {answer.question?.marks} marks
                      </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Student Answer:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{answer.answer}</p>
                    </div>

                    {answer.question?.correctAnswer && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
                        <p className="text-xs text-green-600 mb-1">Correct Answer:</p>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {answer.question.correctAnswer}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Score:</label>
                        <input
                          type="number"
                          min="0"
                          max={answer.question?.marks || 10}
                          value={grades[answer.id] ?? ''}
                          onChange={(e) =>
                            handleGradeChange(
                              answer.id,
                              parseFloat(e.target.value) || 0,
                              answer.question?.marks || 10
                            )
                          }
                          className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary-600 focus:outline-none dark:bg-gray-900"
                        />
                        <span className="text-sm text-gray-400">/ {answer.question?.marks}</span>
                      </div>
                      <button
                        onClick={() => handleSaveGrade(answer.id)}
                        disabled={isGrading || grades[answer.id] === undefined}
                        className="px-3 py-1 text-xs text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBulkGrade}
                    disabled={isGrading || Object.keys(grades).length === 0}
                    className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50"
                  >
                    Save All Grades
                  </button>
                  <button
                    onClick={handleFinalizeGrading}
                    disabled={isGrading}
                    className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGrading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    Finalize Grading
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-[60vh] flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">grading</span>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Select a submission to grade
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Choose a student submission from the list on the left
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Grading;
