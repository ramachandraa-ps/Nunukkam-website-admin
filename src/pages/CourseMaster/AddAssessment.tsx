import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import assessmentService from '../../services/assessmentService';
import assessmentTypeService from '../../services/assessmentTypeService';
import chapterService from '../../services/chapterService';
import skillService from '../../services/skillService';
import { ApiChapter, ApiSkill, ApiAssessmentType, ApiAssessment, AssessmentKind } from '../../types/course';

const AddAssessment: React.FC = () => {
  const { chapterId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const isEditMode = !!assessmentId;

  const [chapter, setChapter] = useState<ApiChapter | null>(null);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<ApiAssessmentType[]>([]);
  const [existingAssessment, setExistingAssessment] = useState<ApiAssessment | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    kind: 'PRE_KBA' as AssessmentKind,
    assessmentTypeId: '',
    durationHours: 1,
    skillIds: [] as string[],
    passingCutoff: 60,
    expertPercent: 90,
    intermediatePercent: 70,
    novicePercent: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!chapterId) return;

    setIsLoading(true);
    try {
      // Fetch in parallel
      const [chapterRes, skillsRes, typesRes] = await Promise.all([
        chapterService.getChapterById(chapterId),
        skillService.getSkills(),
        assessmentTypeService.getAssessmentTypes(),
      ]);

      if (chapterRes.success && chapterRes.data) {
        setChapter(chapterRes.data.chapter);
      } else {
        addToast('error', 'Chapter not found');
        navigate('/courses/chapters');
        return;
      }

      if (skillsRes.success && skillsRes.data) {
        setSkills(skillsRes.data.skills);
      }

      if (typesRes.success && typesRes.data) {
        setAssessmentTypes(typesRes.data.assessmentTypes);
      }

      // If editing, fetch assessment details
      if (isEditMode && assessmentId) {
        const assessmentRes = await assessmentService.getAssessmentById(assessmentId);
        if (assessmentRes.success && assessmentRes.data) {
          const assessment = assessmentRes.data.assessment;
          setExistingAssessment(assessment);
          setFormData({
            title: assessment.title,
            kind: assessment.kind,
            assessmentTypeId: assessment.assessmentTypeId,
            durationHours: assessment.durationHours,
            skillIds: assessment.skills?.map(s => s.skillId) || [],
            passingCutoff: assessment.passingCutoff,
            expertPercent: assessment.expertPercent || 90,
            intermediatePercent: assessment.intermediatePercent || 70,
            novicePercent: assessment.novicePercent || 50,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, assessmentId, isEditMode, addToast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Assessment title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.assessmentTypeId) {
      newErrors.assessmentTypeId = 'Assessment type is required';
    }
    if (formData.durationHours < 1) {
      newErrors.durationHours = 'Duration must be at least 1 hour';
    }
    if (formData.passingCutoff < 0 || formData.passingCutoff > 100) {
      newErrors.passingCutoff = 'Passing cutoff must be between 0 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (addQuestions: boolean = false) => {
    if (!validate() || !chapterId) return;

    setIsSubmitting(true);
    try {
      let savedAssessmentId = assessmentId;

      if (isEditMode && assessmentId) {
        const response = await assessmentService.updateAssessment(assessmentId, {
          title: formData.title.trim(),
          durationHours: formData.durationHours,
          passingCutoff: formData.passingCutoff,
          expertPercent: formData.expertPercent,
          intermediatePercent: formData.intermediatePercent,
          novicePercent: formData.novicePercent,
          skillIds: formData.skillIds,
        });
        if (response.success) {
          addToast('success', 'Assessment updated successfully');
        } else {
          addToast('error', response.error?.message || 'Failed to update assessment');
          return;
        }
      } else {
        const response = await assessmentService.createAssessment({
          chapterId,
          assessmentTypeId: formData.assessmentTypeId,
          kind: formData.kind,
          name: formData.title.trim(),  // Backend requires 'name' as the primary field
          title: formData.title.trim(), // Also send title for display
          durationHours: formData.durationHours,
          passingCutoff: formData.passingCutoff,
          expertPercent: formData.expertPercent,
          intermediatePercent: formData.intermediatePercent,
          novicePercent: formData.novicePercent,
          skillIds: formData.skillIds,
        });
        if (response.success && response.data) {
          addToast('success', 'Assessment created successfully');
          savedAssessmentId = response.data.assessment.id;
        } else {
          addToast('error', response.error?.message || 'Failed to create assessment');
          return;
        }
      }

      if (addQuestions && savedAssessmentId) {
        navigate(`/courses/chapters/${chapterId}/assessments/${savedAssessmentId}/questions`);
      } else {
        navigate('/courses/chapters');
      }
    } catch (error: unknown) {
      console.error('Failed to save assessment:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMore = async () => {
    if (!validate() || !chapterId) return;

    setIsSubmitting(true);
    try {
      const response = await assessmentService.createAssessment({
        chapterId,
        assessmentTypeId: formData.assessmentTypeId,
        kind: formData.kind,
        name: formData.title.trim(),  // Backend requires 'name' as the primary field
        title: formData.title.trim(), // Also send title for display
        durationHours: formData.durationHours,
        passingCutoff: formData.passingCutoff,
        expertPercent: formData.expertPercent,
        intermediatePercent: formData.intermediatePercent,
        novicePercent: formData.novicePercent,
        skillIds: formData.skillIds,
      });
      if (response.success) {
        addToast('success', 'Assessment added. You can add another one.');
        setFormData({
          title: '',
          kind: 'PRE_KBA',
          assessmentTypeId: '',
          durationHours: 1,
          skillIds: [],
          passingCutoff: 60,
          expertPercent: 90,
          intermediatePercent: 70,
          novicePercent: 50,
        });
        setErrors({});
      } else {
        addToast('error', response.error?.message || 'Failed to create assessment');
      }
    } catch (error: unknown) {
      console.error('Failed to save assessment:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(s => s !== skillId)
        : [...prev.skillIds, skillId],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

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

  const assessmentNumber = isEditMode
    ? (chapter._count?.assessments || 0)
    : (chapter._count?.assessments || 0) + 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      <div className="flex gap-8 items-start">
        {/* Sidebar Actions */}
        <div className="w-64 flex-shrink-0 space-y-2 hidden lg:block">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span>
              Course Master
            </div>
            <div className="space-y-1">
              <div onClick={() => navigate('/courses/core-skills')} className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Add Core Skills</div>
              <div onClick={() => navigate('/courses/assessment-types')} className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Add Assessment Types</div>
              <div className="px-3 py-2 text-sm text-purple-700 bg-purple-50 font-medium rounded-lg">Add Assessments</div>
              <div onClick={() => navigate('/courses/skills')} className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Add Skills</div>
              <div onClick={() => navigate('/courses/add')} className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">Create course</div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          {/* Back button */}
          <button onClick={() => navigate('/courses/chapters')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Chapters
          </button>

          {/* Form Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {isEditMode ? 'Edit Assessment' : `Assessment ${assessmentNumber}`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Chapter: {chapter.name}</p>
            </div>

            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Assessment Kind:</span>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value="PRE_KBA"
                      checked={formData.kind === 'PRE_KBA'}
                      onChange={() => setFormData({ ...formData, kind: 'PRE_KBA' })}
                      disabled={isEditMode}
                      className="text-purple-600 accent-purple-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pre-KBA</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value="POST_KBA"
                      checked={formData.kind === 'POST_KBA'}
                      onChange={() => setFormData({ ...formData, kind: 'POST_KBA' })}
                      disabled={isEditMode}
                      className="text-purple-600 accent-purple-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Post-KBA</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Duration (hrs):</span>
                <input
                  type="number"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:border-purple-600 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 max-w-3xl">
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:col-span-1">Title *</label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  className={`w-full px-4 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:border-purple-600 focus:outline-none`}
                  placeholder="Enter assessment title (min 3 chars)"
                />
                {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title}</span>}
              </div>
            </div>

            {/* Assessment Type Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:col-span-1">Assessment Type *</label>
              <div className="md:col-span-3">
                <select
                  value={formData.assessmentTypeId}
                  onChange={(e) => {
                    setFormData({ ...formData, assessmentTypeId: e.target.value });
                    if (errors.assessmentTypeId) setErrors({ ...errors, assessmentTypeId: '' });
                  }}
                  disabled={isEditMode}
                  className={`w-full px-4 py-2 border ${errors.assessmentTypeId ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:border-purple-600 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700`}
                >
                  <option value="">Select assessment type</option>
                  {assessmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors.assessmentTypeId && <span className="text-xs text-red-500 mt-1">{errors.assessmentTypeId}</span>}
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:col-span-1 pt-2">Skills:</label>
              <div className="md:col-span-3 w-full">
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !formData.skillIds.includes(val)) {
                      setFormData(p => ({ ...p, skillIds: [...p.skillIds, val] }));
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-600 focus:outline-none w-full mb-2"
                >
                  <option value="">Select Skills (optional)</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id} disabled={formData.skillIds.includes(s.id)}>{s.name}</option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {formData.skillIds.map(sid => {
                    const s = skills.find(sk => sk.id === sid);
                    if (!s) return null;
                    return (
                      <span key={sid} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs flex items-center gap-1 border border-purple-100">
                        {s.name}
                        <button onClick={() => toggleSkill(sid)} className="hover:text-purple-900">&times;</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Passing Cutoff */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:col-span-1">Passing Cut off (%) *</label>
              <div className="md:col-span-3">
                <input
                  type="number"
                  value={formData.passingCutoff}
                  onChange={(e) => setFormData({ ...formData, passingCutoff: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                />
                {errors.passingCutoff && <span className="text-xs text-red-500 mt-1">{errors.passingCutoff}</span>}
              </div>
            </div>

            {/* Proficiency */}
            <div className="pt-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-3">Proficiency Definition:</label>
              <div className="pl-0 md:pl-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400 md:col-span-1">Expert (%)</label>
                  <input
                    type="number"
                    value={formData.expertPercent}
                    onChange={(e) => setFormData({ ...formData, expertPercent: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                    className="md:col-span-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400 md:col-span-1">Intermediate (%)</label>
                  <input
                    type="number"
                    value={formData.intermediatePercent}
                    onChange={(e) => setFormData({ ...formData, intermediatePercent: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                    className="md:col-span-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400 md:col-span-1">Novice (%)</label>
                  <input
                    type="number"
                    value={formData.novicePercent}
                    onChange={(e) => setFormData({ ...formData, novicePercent: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                    className="md:col-span-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-600 focus:outline-none w-full max-w-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Questions Button (Inside Form) */}
          <div className="flex justify-end mt-8">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>}
              Add Questions
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-6 border-t pt-6 border-gray-100 dark:border-gray-700">
            {!isEditMode && (
              <button
                onClick={handleAddMore}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-white border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>}
                Add more
              </button>
            )}
            {isEditMode && <div></div>}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-10 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-md shadow-purple-200 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAssessment;
