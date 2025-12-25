import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import assessmentService from '../../services/assessmentService';
import questionService from '../../services/questionService';
import { ApiAssessment, ApiQuestion, CreateQuestionRequest, UpdateQuestionRequest } from '../../types/course';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

interface RubricItem {
  question: string;
  scale: string;
}

const AddQuestions: React.FC = () => {
  const { chapterId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [assessment, setAssessment] = useState<ApiAssessment | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ApiQuestion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; text: string }>({ isOpen: false, id: '', text: '' });

  const [currentQuestion, setCurrentQuestion] = useState<{
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
    marks: number;
    rubric: RubricItem[];
  }>({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: '',
    marks: 1,
    rubric: [],
  });

  // Determine if assessment is MCQ based on assessmentType
  const isMCQ = assessment?.assessmentType?.submissionType === 'MCQ' ||
                assessment?.assessmentType?.name?.toLowerCase() === 'mcq';

  // Fetch assessment and questions
  const fetchData = useCallback(async () => {
    if (!assessmentId) return;

    setIsLoading(true);
    try {
      const [assessmentRes, questionsRes] = await Promise.all([
        assessmentService.getAssessmentById(assessmentId),
        questionService.getQuestions({ assessmentId }),
      ]);

      if (assessmentRes.success && assessmentRes.data) {
        setAssessment(assessmentRes.data.assessment);
      } else {
        addToast('error', 'Failed to load assessment');
      }

      if (questionsRes.success && questionsRes.data) {
        setQuestions(questionsRes.data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load assessment data');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setCurrentQuestion({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: '',
      marks: 1,
      rubric: [],
    });
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: ApiQuestion) => {
    setEditingQuestion(question);

    // Parse rubric if it exists
    let rubric: RubricItem[] = [];
    if (question.rubric && typeof question.rubric === 'object') {
      const rubricObj = question.rubric as Record<string, unknown>;
      if (Array.isArray(rubricObj.items)) {
        rubric = rubricObj.items as RubricItem[];
      }
    }

    setCurrentQuestion({
      questionText: question.questionText,
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || '',
      marks: question.marks,
      rubric,
    });
  };

  const handleAddOrUpdateQuestion = async () => {
    if (!currentQuestion.questionText.trim()) {
      addToast('warning', 'Please enter a question');
      return;
    }

    if (!assessmentId) return;

    setIsSaving(true);
    try {
      if (editingQuestion) {
        // Update existing question
        const updateData: UpdateQuestionRequest = {
          questionText: currentQuestion.questionText,
          marks: currentQuestion.marks,
        };

        if (isMCQ) {
          updateData.optionA = currentQuestion.optionA;
          updateData.optionB = currentQuestion.optionB;
          updateData.optionC = currentQuestion.optionC;
          updateData.optionD = currentQuestion.optionD;
          updateData.correctAnswer = currentQuestion.correctAnswer;
          updateData.explanation = currentQuestion.explanation;
        } else {
          updateData.rubric = { items: currentQuestion.rubric };
        }

        const response = await questionService.updateQuestion(editingQuestion.id, updateData);
        if (response.success) {
          addToast('success', 'Question updated successfully');
          fetchData();
          resetForm();
        } else {
          addToast('error', response.error?.message || 'Failed to update question');
        }
      } else {
        // Create new question
        const createData: CreateQuestionRequest = {
          assessmentId,
          questionText: currentQuestion.questionText,
          questionType: isMCQ ? 'MCQ' : 'SUBJECTIVE',
          marks: currentQuestion.marks,
        };

        if (isMCQ) {
          createData.optionA = currentQuestion.optionA;
          createData.optionB = currentQuestion.optionB;
          createData.optionC = currentQuestion.optionC;
          createData.optionD = currentQuestion.optionD;
          createData.correctAnswer = currentQuestion.correctAnswer;
          createData.explanation = currentQuestion.explanation;
        } else {
          createData.rubric = { items: currentQuestion.rubric };
        }

        const response = await questionService.createQuestion(createData);
        if (response.success) {
          addToast('success', 'Question added successfully');
          fetchData();
          resetForm();
        } else {
          addToast('error', response.error?.message || 'Failed to add question');
        }
      }
    } catch (error) {
      console.error('Failed to save question:', error);
      addToast('error', 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      const response = await questionService.deleteQuestion(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Question deleted successfully');
        fetchData();
        if (editingQuestion?.id === deleteConfirm.id) {
          resetForm();
        }
      } else {
        addToast('error', response.error?.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      addToast('error', 'Failed to delete question');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', text: '' });
    }
  };

  const handleAddRubric = (question: string, scale: string) => {
    const newRubric = [...currentQuestion.rubric, { question, scale }];
    setCurrentQuestion(prev => ({ ...prev, rubric: newRubric }));
  };

  const handleRemoveRubric = (index: number) => {
    const newRubric = currentQuestion.rubric.filter((_, i) => i !== index);
    setCurrentQuestion(prev => ({ ...prev, rubric: newRubric }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">Assessment not found</h3>
        <button onClick={() => navigate('/courses/chapters')} className="mt-4 text-primary-600 hover:underline">
          Go back to chapters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', text: '' })}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        message={`Are you sure you want to delete this question? "${deleteConfirm.text.substring(0, 50)}..."`}
        confirmText="Delete"
        type="danger"
      />

      <div className="flex gap-8 items-start">
        {/* Sidebar - Questions List */}
        <div className="w-72 flex-shrink-0 space-y-4 hidden lg:block">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">quiz</span>
              Questions ({questions.length})
            </div>

            {questions.length === 0 ? (
              <p className="text-sm text-gray-500">No questions added yet</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      editingQuestion?.id === q.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => handleEditQuestion(q)}
                      >
                        <p className="text-xs font-medium text-gray-500 mb-1">Q{idx + 1} • {q.marks} marks</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{q.questionText}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-1 text-gray-400 hover:text-primary-600 rounded"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: q.id, text: q.questionText })}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingQuestion && (
              <button
                onClick={resetForm}
                className="mt-4 w-full px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                + Add New Question
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Assessment Title Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{assessment.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {assessment.chapter?.name} • {assessment.kind === 'PRE_KBA' ? 'Pre-KBA' : 'Post-KBA'} • {assessment.assessmentType?.name}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                isMCQ ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {isMCQ ? 'MCQ' : 'Subjective'}
              </span>
            </div>
          </div>

          {/* Question Form Box */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-md font-bold text-gray-700 dark:text-gray-200">
                {editingQuestion ? 'Edit Question' : `Add Question ${questions.length + 1}`}
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Marks:</label>
                <input
                  type="number"
                  min="1"
                  value={currentQuestion.marks}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary-600 focus:outline-none dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="space-y-6">
              {isMCQ ? (
                <>
                  {/* MCQ Layout */}
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-32 shrink-0 pt-2">Question:</label>
                    <textarea
                      rows={2}
                      placeholder="Enter the question"
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:outline-none w-full resize-none dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-32 shrink-0">Option {opt}:</label>
                      <input
                        type="text"
                        placeholder={`Enter option ${opt}`}
                        value={currentQuestion[`option${opt}` as keyof typeof currentQuestion] as string || ''}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, [`option${opt}`]: e.target.value })}
                        className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:outline-none text-sm placeholder-gray-400 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-32 shrink-0">Correct Answer:</label>
                    <select
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary-600 focus:outline-none w-full md:w-96 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select correct answer</option>
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 pt-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-32 shrink-0 pt-2">Explanation:</label>
                    <textarea
                      rows={3}
                      placeholder="Explain why this is the correct answer (optional)"
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary-600 focus:outline-none w-full resize-none placeholder-gray-400 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </>
              ) : (
                // Subjective Question Layout
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-32 shrink-0 pt-2">Question:</label>
                    <textarea
                      rows={3}
                      placeholder="Enter the question stem"
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:outline-none w-full placeholder-gray-400 resize-none dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Rubric Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Grading Rubric:</h4>

                    {/* Existing Rubric Items */}
                    {currentQuestion.rubric.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                        {currentQuestion.rubric.map((r, i) => (
                          <div key={i} className="flex items-start justify-between gap-2 text-sm">
                            <div className="flex-1">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{i + 1}. {r.question}</span>
                              <p className="text-gray-500 mt-0.5">Scale: {r.scale}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveRubric(i)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Rubric Form */}
                    <div className="space-y-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32 shrink-0">Criteria:</label>
                        <input
                          id="rubric-q"
                          className="w-full md:flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:outline-none text-sm placeholder-gray-400 dark:bg-gray-900 dark:text-white"
                          placeholder="What to evaluate (e.g., 'Clarity of explanation')"
                        />
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32 shrink-0">Scale:</label>
                        <input
                          id="rubric-s"
                          className="w-full md:flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:outline-none text-sm placeholder-gray-400 dark:bg-gray-900 dark:text-white"
                          placeholder="Scoring criteria (e.g., '0-2: Poor, 3-4: Good, 5: Excellent')"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const q = (document.getElementById('rubric-q') as HTMLInputElement).value;
                            const s = (document.getElementById('rubric-s') as HTMLInputElement).value;
                            if (q && s) {
                              handleAddRubric(q, s);
                              (document.getElementById('rubric-q') as HTMLInputElement).value = '';
                              (document.getElementById('rubric-s') as HTMLInputElement).value = '';
                            } else {
                              addToast('warning', 'Please fill both criteria and scale');
                            }
                          }}
                          className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          + Add Rubric Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              {editingQuestion && (
                <button
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleAddOrUpdateQuestion}
                disabled={isSaving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-md transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate(`/courses/chapters/${chapterId}/assessments`)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Assessments
            </button>
            <div className="text-sm text-gray-500">
              Total: {questions.length} questions • {questions.reduce((sum, q) => sum + q.marks, 0)} marks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;
