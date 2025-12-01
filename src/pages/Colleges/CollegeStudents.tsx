import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, Student } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const CollegeStudents: React.FC = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { colleges, courses, users, addStudentToCollege, updateStudent, deleteStudent, addToast } = useStore();

  const college = colleges.find(c => c.id === collegeId);
  const trainers = users.filter(u => u.status === 'active' && (u.role === 'Trainer' || u.role === 'Admin'));

  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    batch: '',
    contactNumber: '',
    email: '',
    courseAssigned: '',
    trainer: '',
    batchStartDate: '',
    batchEndDate: '',
  });

  if (!college) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
        <h3 className="text-lg font-medium text-gray-600">College not found</h3>
        <button onClick={() => navigate('/colleges')} className="mt-4 text-primary-600 hover:underline">
          Go back to colleges
        </button>
      </div>
    );
  }

  const batches = [...new Set(college.students.map(s => s.batch))];

  const filteredStudents = college.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = !batchFilter || student.batch === batchFilter;
    return matchesSearch && matchesBatch;
  });

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        department: student.department,
        batch: student.batch,
        contactNumber: student.contactNumber,
        email: student.email,
        courseAssigned: student.courseAssigned,
        trainer: student.trainer,
        batchStartDate: new Date(student.batchStartDate).toISOString().split('T')[0],
        batchEndDate: new Date(student.batchEndDate).toISOString().split('T')[0],
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        department: '',
        batch: '',
        contactNumber: '',
        email: '',
        courseAssigned: '',
        trainer: '',
        batchStartDate: '',
        batchEndDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (formData.name.trim() && formData.email.trim()) {
      const studentData = {
        ...formData,
        batchStartDate: new Date(formData.batchStartDate),
        batchEndDate: new Date(formData.batchEndDate),
      };

      if (editingStudent) {
        updateStudent(college.id, editingStudent.id, studentData);
      } else {
        addStudentToCollege(college.id, studentData);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = () => {
    deleteStudent(college.id, deleteConfirm.id);
  };

  const handleBulkUpload = () => {
    addToast('info', 'Bulk upload feature coming soon');
  };

  const downloadSampleFormat = () => {
    addToast('info', 'Sample format download started');
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to remove this student?"
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Student Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Batch</label>
              <input
                type="text"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                placeholder="e.g., Batch A"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Course Assigned</label>
              <select
                value={formData.courseAssigned}
                onChange={(e) => setFormData({ ...formData, courseAssigned: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              >
                <option value="">Select course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Trainer</label>
              <select
                value={formData.trainer}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              >
                <option value="">Select trainer</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Batch Start Date</label>
              <input
                type="date"
                value={formData.batchStartDate}
                onChange={(e) => setFormData({ ...formData, batchStartDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Batch End Date</label>
              <input
                type="date"
                value={formData.batchEndDate}
                onChange={(e) => setFormData({ ...formData, batchEndDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.email.trim()}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"
            >
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
        <p className="text-sm text-gray-500 mt-1">Manage students enrolled in this college</p>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">Bulk Upload Students</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleBulkUpload}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-100 flex items-center gap-2"
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
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            />
          </div>
          {batches.length > 0 && (
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700"
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/colleges/${college.id}/schedule`)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 flex items-center gap-2"
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
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sl.No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Batch</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Course</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Trainer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {student.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">{student.contactNumber}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.courseAssigned || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.trainer || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: student.id })}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
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
