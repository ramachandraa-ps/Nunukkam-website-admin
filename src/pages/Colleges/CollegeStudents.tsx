import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import collegeService from '../../services/collegeService';
import batchService from '../../services/batchService';
import courseService from '../../services/courseService';
import studentService from '../../services/studentService';
import userService from '../../services/userService';
import { ApiCollege, ApiBatch } from '../../types/college';
import { ApiCourse } from '../../types/course';
import { ApiStudent, CreateStudentRequest, UpdateStudentRequest } from '../../types/student';
import { ApiUser } from '../../types/user';

const CollegeStudents: React.FC = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();

  // State for API data
  const [college, setCollege] = useState<ApiCollege | null>(null);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [trainers, setTrainers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ApiStudent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    batchId: '',
    phoneNumber: '',
    email: '',
    password: '',
    courseId: '',
    trainerId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch college and related data
  const fetchData = useCallback(async () => {
    if (!collegeId) return;

    setIsLoading(true);
    try {
      // Fetch college details
      const collegeResponse = await collegeService.getCollegeById(collegeId);
      if (collegeResponse.success && collegeResponse.data) {
        setCollege(collegeResponse.data.college);
      }

      // Fetch batches for this college
      const batchesResponse = await batchService.getBatches(collegeId);
      if (batchesResponse.success && batchesResponse.data) {
        setBatches(batchesResponse.data.batches);
      }

      // Fetch students for this college
      const studentsResponse = await studentService.getStudents({ collegeId, limit: 100 });
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data.students);
      }

      // Fetch all courses (admin can assign any course to students)
      const coursesResponse = await courseService.getCourses({ limit: 100 });
      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data.courses);
      }

      // Fetch trainers
      const trainersResponse = await userService.getUsers({ role: 'TRAINER', status: 'ACTIVE', limit: 100 });
      if (trainersResponse.success && trainersResponse.data) {
        setTrainers(trainersResponse.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load college data');
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = !batchFilter || student.batch?.id === batchFilter;
    return matchesSearch && matchesBatch;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      department: '',
      batchId: '',
      phoneNumber: '',
      email: '',
      password: '',
      courseId: '',
      trainerId: '',
    });
    setErrors({});
  };

  const handleOpenModal = (student?: ApiStudent) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        department: student.department || '',
        batchId: student.batch?.id || '',
        phoneNumber: student.phoneNumber || '',
        email: student.email,
        password: '',
        courseId: student.course?.id || '',
        trainerId: student.trainer?.id || '',
      });
    } else {
      setEditingStudent(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!editingStudent && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!editingStudent && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !collegeId) return;

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Update student
        const updateData: UpdateStudentRequest = {
          name: formData.name,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          batchId: formData.batchId || undefined,
          courseId: formData.courseId || undefined,
          trainerId: formData.trainerId || undefined,
        };

        const response = await studentService.updateStudent(editingStudent.id, updateData);
        if (response.success) {
          addToast('success', 'Student updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to update student');
        }
      } else {
        // Create new student
        const createData: CreateStudentRequest = {
          collegeId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          batchId: formData.batchId || undefined,
          courseId: formData.courseId || undefined,
          trainerId: formData.trainerId || undefined,
        };

        const response = await studentService.createStudent(createData);
        if (response.success) {
          addToast('success', 'Student created successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to create student');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save student:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await studentService.deleteStudent(deleteConfirm.id);
      if (response.success) {
        addToast('success', 'Student deleted successfully');
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to delete student');
      }
    } catch (error: unknown) {
      console.error('Failed to delete student:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete student');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  const handleBulkUpload = () => {
    navigate(`/colleges/${collegeId}/students/bulk-upload`);
  };

  const downloadSampleFormat = () => {
    // Create sample CSV content
    const headers = ['name', 'email', 'password', 'phoneNumber', 'department', 'batchId', 'courseId', 'trainerId'];
    const sampleRow = ['John Doe', 'john@example.com', 'Password123', '9876543210', 'Computer Science', '', '', ''];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    addToast('success', 'Sample format downloaded');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading college data...</span>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">error</span>
        <h3 className="text-lg font-medium text-gray-600">College not found</h3>
        <button onClick={() => navigate('/colleges')} className="mt-4 text-primary-600 hover:underline">
          Go back to colleges
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to remove "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Student Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Min 3 characters"
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700`}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                disabled={!!editingStudent}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700 ${editingStudent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
            </div>
            {!editingStudent && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className={`w-full px-4 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:border-primary-700`}
                />
                {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., +91 9876543210"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Batch</label>
              {batches.length === 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">No batches available</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/colleges/${collegeId}/batches`)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Create Batch
                  </button>
                </div>
              ) : (
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
                >
                  <option value="">Select batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Course Assigned</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
              >
                <option value="">Select course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Trainer</label>
              <select
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700"
              >
                <option value="">Select trainer</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.username} ({t.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingStudent ? 'Update' : 'Add'} Student
            </button>
          </div>
        </div>
      </Modal>

      <div>
        <button onClick={() => navigate('/colleges')} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Colleges
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{college.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Manage students enrolled in this college ({students.length} total)</p>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">Bulk Upload Students</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleBulkUpload}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">upload_file</span>
            Bulk Upload
          </button>
          <button
            onClick={downloadSampleFormat}
            className="px-4 py-2.5 text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined">download</span>
            Download Sample Format
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="relative max-w-sm w-full group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
            />
          </div>
          {batches.length > 0 && (
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/colleges/${college.id}/batches`)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">groups</span>
            Manage Batches
          </button>
          <button
            onClick={() => navigate(`/colleges/${college.id}/schedule`)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Schedule Sessions
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Student ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Batch</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Course</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Trainer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">school</span>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">No students found</h3>
                    <p className="text-sm text-gray-400">Add students to this college to get started</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{student.displayId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.department || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.batch ? (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                          {student.batch.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{student.phoneNumber || '-'}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{student.course?.title || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{student.trainer?.username || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit student"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: student.id, name: student.name })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Delete student"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollegeStudents;
