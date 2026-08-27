import { useState, useEffect } from 'react';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../services/skillService';
import { usePagination } from '../../hooks/usePagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { SKILL_CATEGORIES } from '../../utils/constants';
import { toast } from 'react-toastify';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, limit, totalPages, setPage, setTotalPages } = usePagination(1, 10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState(null);
  const [skillToDelete, setSkillToDelete] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', category: 'Other', description: '' });

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await getSkills({ page, limit });
      if (res.success) {
        setSkills(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [page, limit]);

  const openModal = (skill = null) => {
    if (skill) {
      setSkillToEdit(skill);
      setFormData({ name: skill.name, category: skill.category, description: skill.description || '' });
    } else {
      setSkillToEdit(null);
      setFormData({ name: '', category: 'Other', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (skillToEdit) {
        res = await updateSkill(skillToEdit._id, formData);
      } else {
        res = await createSkill(formData);
      }
      if (res.success) {
        toast.success(`Skill ${skillToEdit ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchSkills();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Error saving skill');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteSkill(skillToDelete._id);
      if (res.success) {
        toast.success('Skill deleted');
        fetchSkills();
      }
    } catch (err) {
      toast.error('Error deleting skill');
    } finally {
      setSkillToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Skills</h1>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Skill
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="large" className="py-20" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skills.map(skill => (
                <tr key={skill._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{skill.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(skill)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => setSkillToDelete(skill)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {skillToEdit ? 'Edit Skill' : 'Add New Skill'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                      {SKILL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="mt-1 w-full border border-gray-300 rounded-md p-2"></textarea>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!skillToDelete}
        onClose={() => setSkillToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete ${skillToDelete?.name}?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminSkills;
