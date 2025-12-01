import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Designation } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const Designations: React.FC = () => {
  const navigate = useNavigate();
  const { designations, users, addDesignation, updateDesignation, deleteDesignation } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [title, setTitle] = useState('');

  const filteredDesignations = designations.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsersCount = (desTitle: string) => {
    return users.filter(u => u.designation === desTitle && u.status === 'active').length;
  };

  const handleOpenModal = (designation?: Designation) => {
    if (designation) {
      setEditingDesignation(designation);
      setTitle(designation.title);
    } else {
      setEditingDesignation(null);
      setTitle('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (title.trim()) {
      if (editingDesignation) {
        updateDesignation(editingDesignation.id, title);
      } else {
        addDesignation(title);
      }
      setIsModalOpen(false);
      setTitle('');
    }
  };

  const handleDelete = () => {
    deleteDesignation(deleteConfirm.id);
    setDeleteConfirm({ isOpen: false, id: '' });
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={handleDelete}
        title="Delete Designation"
        message="Are you sure you want to delete this designation?"
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDesignation ? 'Edit Designation' : 'Add Designation'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Designation Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Developer"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"
            >
              {editingDesignation ? 'Update' : 'Add'} Designation
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/users')} className="hover:text-primary-600">User Management</button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Designations</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designations</h1>
        <p className="text-sm text-gray-500">Manage job titles and designations</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full group">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
          <input
            type="text"
            placeholder="Search designations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Designation
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Sl.No</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Designation</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Users</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300">Created</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {filteredDesignations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No designations found matching your search.' : 'No designations added yet.'}
                </td>
              </tr>
            ) : (
              filteredDesignations.map((designation, idx) => (
                <tr key={designation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{designation.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      {getUsersCount(designation.title)} user{getUsersCount(designation.title) !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(designation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(designation)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: designation.id })}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
  );
};

export default Designations;
