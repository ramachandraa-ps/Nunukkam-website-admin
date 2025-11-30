import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const AddAssessment: React.FC = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { chapters, skills, assessmentTypes, updateChapter, addToast } = useStore();

  const chapter = chapters.find(c => c.id === chapterId);

  const [formData, setFormData] = useState({
    title: '',
    kind: 'Pre-KBA' as 'Pre-KBA' | 'Post-KBA',
    duration: 1,
    type: '',
    skills: [] as string[],
    passingCutoff: 60,
    expertPercentage: 90,
    intermediatePercentage: 70,
    novicePercentage: 50,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.type) {
      const newAssessment = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        questions: [],
      };

      updateChapter(chapter.id, {
        assessments: [...chapter.assessments, newAssessment],
      });

      addToast('success', 'Assessment added successfully');
      navigate(`/courses/assessments/${newAssessment.id}/questions`);
    }
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
    <div className="space-y-8 max-w-3xl">
      <div>
        <button onClick={() => navigate('/courses/chapters')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Chapters
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">Chapter: {chapter.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          {/* Assessment Kind */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-3">
              Assessment Kind *
            </label>
            <div className="flex gap-4">
              {(['Pre-KBA', 'Post-KBA'] as const).map((kind) => (
                <label key={kind} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    value={kind}
                    checked={formData.kind === kind}
                    onChange={(e) => setFormData({ ...formData, kind: e.target.value as typeof formData.kind })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{kind}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assessment title"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Duration (in hours) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assessment Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Assessment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                required
              >
                <option value="">Select type</option>
                {assessmentTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Passing Cutoff */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Passing Cutoff (%) *
              </label>
              <input
                type="number"
                value={formData.passingCutoff}
                onChange={(e) => setFormData({ ...formData, passingCutoff: parseInt(e.target.value) || 0 })}
                min={0}
                max={100}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Skills
            </label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.skills.includes(skill.id)
                        ? 'bg-primary-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Proficiency Definition */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-3">
              Proficiency Definition
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Expert (%)</label>
                <input
                  type="number"
                  value={formData.expertPercentage}
                  onChange={(e) => setFormData({ ...formData, expertPercentage: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Intermediate (%)</label>
                <input
                  type="number"
                  value={formData.intermediatePercentage}
                  onChange={(e) => setFormData({ ...formData, intermediatePercentage: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Novice (%)</label>
                <input
                  type="number"
                  value={formData.novicePercentage}
                  onChange={(e) => setFormData({ ...formData, novicePercentage: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!formData.title.trim() || !formData.type}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Questions
          </button>
          <button
            type="button"
            onClick={() => navigate('/courses/chapters')}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssessment;
