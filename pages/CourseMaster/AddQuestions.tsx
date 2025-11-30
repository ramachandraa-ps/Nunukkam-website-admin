import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore, Question } from '../../store/useStore';

const AddQuestions: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { chapters, updateChapter, addToast } = useStore();

  // Find the chapter and assessment
  const chapter = chapters.find(c => c.assessments.some(a => a.id === assessmentId));
  const assessment = chapter?.assessments.find(a => a.id === assessmentId);

  const [questions, setQuestions] = useState<Question[]>(assessment?.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: '',
    type: 'mcq',
  });

  const isMCQ = assessment?.type.toLowerCase().includes('multiple') || assessment?.type.toLowerCase().includes('mcq');

  const handleAddQuestion = () => {
    if (currentQuestion.question?.trim()) {
      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        question: currentQuestion.question!,
        optionA: currentQuestion.optionA,
        optionB: currentQuestion.optionB,
        optionC: currentQuestion.optionC,
        optionD: currentQuestion.optionD,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        type: isMCQ ? 'mcq' : 'non-mcq',
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        explanation: '',
        type: isMCQ ? 'mcq' : 'non-mcq',
      });
      addToast('success', 'Question added');
    }
  };

  const handleSubmit = () => {
    if (chapter && assessment && questions.length > 0) {
      const updatedAssessments = chapter.assessments.map(a =>
        a.id === assessmentId ? { ...a, questions } : a
      );
      updateChapter(chapter.id, { assessments: updatedAssessments });
      addToast('success', 'Assessment submitted successfully');
      navigate('/courses/chapters');
    } else {
      addToast('warning', 'Please add at least one question');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (!chapter || !assessment) {
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
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <button onClick={() => navigate('/courses/chapters')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Chapters
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Questions</h1>
        <p className="text-sm text-gray-500 mt-1">{assessment.title} - {assessment.type}</p>
      </div>

      {/* Added Questions List */}
      {questions.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-600">Added Questions ({questions.length})</p>
          {questions.map((q, idx) => (
            <div key={q.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-bold">Q{idx + 1}</span>
                <p className="text-sm text-gray-700 truncate max-w-md">{q.question}</p>
              </div>
              <button onClick={() => handleRemoveQuestion(idx)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Question Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
        <div className="flex items-center">
          <span className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
            Question {questions.length + 1}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Question Text *
          </label>
          <textarea
            rows={3}
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
            placeholder="Enter the question here"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 resize-none transition-all"
          />
        </div>

        {isMCQ && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt}>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                    Option {opt}
                  </label>
                  <input
                    type="text"
                    value={currentQuestion[`option${opt}` as keyof typeof currentQuestion] as string || ''}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, [`option${opt}`]: e.target.value })}
                    placeholder={`Enter option ${opt}`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Correct Answer *
              </label>
              <select
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
              >
                <option value="">Select correct option</option>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
            Explanation
          </label>
          <textarea
            rows={3}
            value={currentQuestion.explanation}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
            placeholder="Provide a brief explanation for the correct answer"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 resize-none transition-all"
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Questions added: <span className="font-bold text-gray-900 dark:text-white text-lg">{questions.length}</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleAddQuestion}
              disabled={!currentQuestion.question?.trim()}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Add Next Question
            </button>
            <button
              onClick={handleSubmit}
              disabled={questions.length === 0}
              className="px-8 py-3 rounded-xl bg-primary-700 text-white font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;
