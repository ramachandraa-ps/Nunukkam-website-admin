import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const AddAssessment: React.FC = () => {
  const { chapterId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { chapters, skills, assessmentTypes, updateChapter, addToast } = useStore();

  const chapter = chapters.find(c => c.id === chapterId);
  const editingAssessment = chapter?.assessments.find(a => a.id === assessmentId);
  const isEditMode = !!editingAssessment;

  const assessmentNumber = isEditMode
    ? chapter?.assessments.findIndex(a => a.id === assessmentId)! + 1
    : (chapter?.assessments.length || 0) + 1;

  const [formData, setFormData] = useState({
    title: editingAssessment?.title || '',
    kind: (editingAssessment?.kind || 'Pre-KBA') as 'Pre-KBA' | 'Post-KBA',
    questionType: (editingAssessment?.questionType || 'mcq') as 'mcq' | 'non-mcq',
    duration: editingAssessment?.duration || 1,
    type: editingAssessment?.type || '',
    skills: editingAssessment?.skills || [] as string[],
    passingCutoff: editingAssessment?.passingCutoff || 60,
    expertPercentage: editingAssessment?.expertPercentage || 90,
    intermediatePercentage: editingAssessment?.intermediatePercentage || 70,
    novicePercentage: editingAssessment?.novicePercentage || 50,
  });

  if (!chapter) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">Chapter not found</h3>
        <button onClick={() => navigate('/courses/chapters')} className="mt-4 text-primary-600 hover:underline">
          Go back to chapters
        </button>
      </div>
    );
  }

  const saveAssessment = () => {
    return {
      id: isEditMode ? assessmentId! : Math.random().toString(36).substr(2, 9),
      ...formData,
      // Sync questionType with the selected type for consistency
      questionType: formData.type.toLowerCase() === 'mcq' ? 'mcq' : 'non-mcq',
      questions: isEditMode ? editingAssessment?.questions || [] : [],
    };
  };

  const handleAddQuestions = (e: React.MouseEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.type) {
      const newAssessment = saveAssessment();
      const updatedAssessments = isEditMode
        ? chapter.assessments.map(a => a.id === assessmentId ? newAssessment : a)
        : [...chapter.assessments, newAssessment];

      updateChapter(chapter.id, { assessments: updatedAssessments });

      addToast('success', 'Assessment details saved. Proceeding to questions.');
      navigate(`/courses/chapters/${chapter.id}/assessments/${newAssessment.id}/questions`);
    } else {
      addToast('warning', 'Please fill all required fields');
    }
  };

  const handleAddMore = () => {
    if (isEditMode) {
      addToast('info', 'Cannot add more while editing. Finish editing first.');
      return;
    }
    if (formData.title.trim() && formData.type) {
      const newAssessment = saveAssessment();
      updateChapter(chapter.id, {
        assessments: [...chapter.assessments, newAssessment],
      });
      addToast('success', 'Assessment added. You can add another one.');
      setFormData({
        title: '',
        kind: 'Pre-KBA',
        questionType: 'mcq',
        duration: 1,
        type: '',
        skills: [],
        passingCutoff: 60,
        expertPercentage: 90,
        intermediatePercentage: 70,
        novicePercentage: 50,
      });
    } else {
      addToast('warning', 'Please fill all required fields before adding more');
    }
  };

  const handleSubmit = () => {
    if (formData.title.trim() && formData.type) {
      const newAssessment = saveAssessment();
      const updatedAssessments = isEditMode
        ? chapter.assessments.map(a => a.id === assessmentId ? newAssessment : a)
        : [...chapter.assessments, newAssessment];

      updateChapter(chapter.id, { assessments: updatedAssessments });
      addToast('success', 'Assessment saved successfully');
    }
    navigate('/courses/chapters');
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Breadcrumb */}
      {/* Breadcrumb removed - using global breadcrumb */}

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

        {/* Form Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          {/* Form Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-800">Assessment {assessmentNumber}:</h2>

            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">What assessment is this?</span>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="kind" value="Pre-KBA" checked={formData.kind === 'Pre-KBA'} onChange={() => setFormData({ ...formData, kind: 'Pre-KBA' })} className="text-purple-600 accent-purple-600" />
                    <span className="text-sm text-gray-600">Pre-KBA</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="kind" value="Post-KBA" checked={formData.kind === 'Post-KBA'} onChange={() => setFormData({ ...formData, kind: 'Post-KBA' })} className="text-purple-600 accent-purple-600" />
                    <span className="text-sm text-gray-600">Post-KBA</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">Add timeline (hrs):</span>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-md focus:border-purple-600 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 max-w-3xl">
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="text-sm font-bold text-gray-700 md:col-span-1">Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="md:col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full"
                placeholder="Enter assessment title"
              />
            </div>

            {/* Assessment Type Dropdown (MCQ/Non-MCQ only) */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="text-sm font-bold text-gray-700 md:col-span-1">Assessment Type:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="md:col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full"
              >
                <option value="">Select</option>
                <option value="MCQ">MCQ</option>
                <option value="Non-MCQ">Non-MCQ</option>
              </select>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <label className="text-sm font-bold text-gray-700 md:col-span-1 pt-2">Skills:</label>
              <div className="md:col-span-3 w-full">
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !formData.skills.includes(val)) setFormData(p => ({ ...p, skills: [...p.skills, val] }))
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full mb-2"
                >
                  <option value="">Select Skills</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(sid => {
                    const s = skills.find(sk => sk.id === sid);
                    if (!s) return null;
                    return (
                      <span key={sid} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs flex items-center gap-1 border border-purple-100">
                        {s.name}
                        <button onClick={() => toggleSkill(sid)} className="hover:text-purple-900">&times;</button>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Cutoff */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="text-sm font-bold text-gray-700 md:col-span-1">Passing Cut off(%):</label>
              <input
                type="number"
                value={formData.passingCutoff}
                onChange={(e) => setFormData({ ...formData, passingCutoff: parseInt(e.target.value) || 0 })}
                className="md:col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
              />
            </div>

            {/* Proficiency */}
            <div className="pt-2">
              <label className="text-sm font-bold text-gray-700 block mb-3">Proficiency Definition:</label>
              <div className="pl-0 md:pl-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <label className="text-sm text-gray-600 md:col-span-1">Expert (%)</label>
                  <input
                    type="number"
                    value={formData.expertPercentage}
                    onChange={(e) => setFormData({ ...formData, expertPercentage: parseInt(e.target.value) || 0 })}
                    className="md:col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <label className="text-sm text-gray-600 md:col-span-1">Intermediate (%)</label>
                  <input
                    type="number"
                    value={formData.intermediatePercentage}
                    onChange={(e) => setFormData({ ...formData, intermediatePercentage: parseInt(e.target.value) || 0 })}
                    className="md:col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <label className="text-sm text-gray-600 md:col-span-1">Novice (%)</label>
                  <input
                    type="number"
                    value={formData.novicePercentage}
                    onChange={(e) => setFormData({ ...formData, novicePercentage: parseInt(e.target.value) || 0 })}
                    className="md:col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Questions Button (Inside Form) */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleAddQuestions}
              className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              Add Questions
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-6 border-t pt-6 border-gray-100">
            <button
              onClick={handleAddMore}
              className="px-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              Add more
            </button>
            <button
              onClick={handleSubmit}
              className="px-10 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-md shadow-purple-200 transition-all"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAssessment;
