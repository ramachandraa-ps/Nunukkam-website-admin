import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore, Question } from '../../store/useStore';

const AddQuestions: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { chapters, updateChapter, addToast } = useStore();

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
    rubric: [],
  });

  // Check type dynamically based on the stored type
  // Syncing with the new dropdown values: 'MCQ' or 'Non-MCQ'
  const isMCQ = assessment?.type?.toLowerCase() === 'mcq' || assessment?.questionType === 'mcq';

  const handleAddQuestion = () => {
    if (currentQuestion.question?.trim()) {
      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        question: currentQuestion.question!,
        optionA: isMCQ ? currentQuestion.optionA : undefined,
        optionB: isMCQ ? currentQuestion.optionB : undefined,
        optionC: isMCQ ? currentQuestion.optionC : undefined,
        optionD: isMCQ ? currentQuestion.optionD : undefined,
        correctAnswer: isMCQ ? currentQuestion.correctAnswer : undefined,
        explanation: isMCQ ? currentQuestion.explanation : undefined,
        type: isMCQ ? 'mcq' : 'non-mcq',
        rubric: isMCQ ? undefined : currentQuestion.rubric,
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
        rubric: [],
      });
      addToast('success', 'Question added');
    } else {
      addToast('warning', 'Please enter a question or question stem');
    }
  };

  const handleAddRubric = (question: string, scale: string) => {
    const newRubric = [...(currentQuestion.rubric || []), { question, scale }];
    setCurrentQuestion(prev => ({ ...prev, rubric: newRubric }));
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
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span
            onClick={() => navigate('/courses')}
            className="text-gray-500 font-medium hover:text-purple-600 cursor-pointer transition-colors"
          >
            Course master
          </span>
          <span className="text-gray-400">&rarr;</span>
          <span
            onClick={() => navigate('/courses/chapters')}
            className="text-gray-500 font-medium hover:text-purple-600 cursor-pointer transition-colors"
          >
            Add chapters
          </span>
          <span className="text-gray-400">&rarr;</span>
          <span
            className="text-gray-500 font-medium hover:text-purple-600 cursor-pointer transition-colors"
          >
            Add Assessments
          </span>
          <span className="text-gray-400">&rarr;</span>
          <span className="text-purple-600">Add Questions</span>
        </h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Actions */}
        <div className="w-64 flex-shrink-0 space-y-2 hidden lg:block">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span>
              Course Master
            </div>
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Add Core Skills</div>
              <div className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Add Assessment Types</div>
              <div className="px-3 py-2 text-sm text-purple-700 bg-purple-50 font-medium rounded-lg">Add Chapters</div>
              <div className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Add Skills</div>
              <div className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Create course</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Assessment Title Header */}
          <div className="bg-white rounded-t-xl border-x border-t border-gray-200 p-4 pb-0">
            <h2 className="text-lg font-bold text-gray-800">Assessment: {assessment.title}</h2>
          </div>

          {/* Question Form Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="space-y-6">

              {isMCQ ? (
                <>
                  {/* MCQ Layout */}
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <label className="text-sm font-bold text-gray-700 w-32 shrink-0">Question {questions.length + 1}:</label>
                    <input
                      type="text"
                      placeholder="Add question"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full"
                    />
                  </div>

                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-sm font-bold text-gray-700 w-32 shrink-0">Option {opt}:</label>
                      <input
                        type="text"
                        placeholder={`Add Option ${opt}`}
                        value={currentQuestion[`option${opt}` as keyof Question] as string || ''}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, [`option${opt}`]: e.target.value })}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-sm placeholder-gray-400"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                    <label className="text-sm font-bold text-gray-700 w-32 shrink-0">Correct Answer:</label>
                    <div className="w-full md:w-auto">
                      <select
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-600 focus:outline-none w-full md:w-64 text-gray-600"
                      >
                        <option value="">Add answer choice</option>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 pt-2">
                    <label className="text-sm font-bold text-gray-700 w-32 shrink-0 pt-2">Explanations:</label>
                    <textarea
                      rows={2}
                      placeholder="Add answer explanations here"
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-600 focus:outline-none w-full resize-none placeholder-gray-400"
                    />
                  </div>
                </>
              ) : (
                // Non-MCQ Layout
                <div className="space-y-6">
                  {/* Question Stem */}
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <label className="text-sm font-bold text-gray-700 w-32 shrink-0">Question Stem:</label>
                    <input
                      type="text"
                      placeholder="Add question stem"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full placeholder-gray-400"
                    />
                  </div>

                  {/* Rubric Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-700">Rubric for grading:</h3>

                    {/* Existing Rubric Items Display */}
                    {currentQuestion.rubric && currentQuestion.rubric.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-2">
                        {currentQuestion.rubric.map((r, i) => (
                          <div key={i} className="text-sm flex gap-2">
                            <span className="font-bold">{r.question}:</span>
                            <span className="text-gray-600">{r.scale}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="text-sm font-bold text-gray-700 w-32 shrink-0">Question {(currentQuestion.rubric?.length || 0) + 1}:</label>
                        <input
                          id="rubric-q"
                          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-sm placeholder-gray-400"
                          placeholder="Add the question here"
                        />
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="text-sm font-bold text-gray-700 w-32 shrink-0">Define Scale:</label>
                        <input
                          id="rubric-s"
                          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-sm placeholder-gray-400"
                          placeholder="Add the scale and logic here"
                        />
                      </div>
                      <div className="flex justify-end md:w-[26rem] md:ml-36">
                        <button
                          type="button"
                          onClick={() => {
                            const q = (document.getElementById('rubric-q') as HTMLInputElement).value;
                            const s = (document.getElementById('rubric-s') as HTMLInputElement).value;
                            if (q && s) {
                              handleAddRubric(q, s);
                              (document.getElementById('rubric-q') as HTMLInputElement).value = '';
                              (document.getElementById('rubric-s') as HTMLInputElement).value = '';
                            }
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                        >
                          + Add another rubric item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Next Question Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleAddQuestion}
                className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors bg-white text-sm"
              >
                Add next question
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-md transition-all text-sm"
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
