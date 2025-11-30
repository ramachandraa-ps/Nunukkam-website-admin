import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const AddChapter: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { skills, chapters, addChapter, updateChapter } = useStore();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    skills: [] as string[],
    pptFile: '',
    notesFile: '',
  });

  useEffect(() => {
    if (isEditing) {
      const chapter = chapters.find(c => c.id === id);
      if (chapter) {
        setFormData({
          name: chapter.name,
          skills: chapter.skills,
          pptFile: chapter.pptFile || '',
          notesFile: chapter.notesFile || '',
        });
      }
    }
  }, [id, chapters, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.skills.length > 0) {
      if (isEditing) {
        updateChapter(id!, {
          name: formData.name,
          skills: formData.skills,
          pptFile: formData.pptFile,
          notesFile: formData.notesFile,
        });
      } else {
        addChapter({
          name: formData.name,
          skills: formData.skills,
          pptFile: formData.pptFile,
          notesFile: formData.notesFile,
          assessments: [],
        });
      }
      navigate('/courses/chapters');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Chapter' : 'Add New Chapter'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditing ? 'Update chapter details and content.' : 'Create a new chapter with content and skills.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          {/* Chapter Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Chapter Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter chapter name"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
              required
            />
          </div>

          {/* Skills Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
              Select Skills *
            </label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 max-h-48 overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500">No skills available. <button type="button" onClick={() => navigate('/courses/skills')} className="text-primary-600 hover:underline">Add skills first</button></p>
              ) : (
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
                      {formData.skills.includes(skill.id) && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.skills.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">{formData.skills.length} skill(s) selected</p>
            )}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Upload PPT
              </label>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">upload_file</span>
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PPT, PDF (max 50MB)</p>
                <input type="file" className="hidden" accept=".ppt,.pptx,.pdf" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                Upload Notes
              </label>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">description</span>
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PPT, PDF, Word (max 50MB)</p>
                <input type="file" className="hidden" accept=".ppt,.pptx,.pdf,.doc,.docx" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!formData.name.trim() || formData.skills.length === 0}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">{isEditing ? 'check' : 'add'}</span>
            {isEditing ? 'Update Chapter' : 'Create Chapter'}
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

export default AddChapter;
