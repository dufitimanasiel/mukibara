import { useState, useEffect } from 'react';
import { announcementAPI, getUploadUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiCalendar, FiPlus, FiImage, FiX, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';

const ManagerAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editModal, setEditModal] = useState({ open: false, announcement: null });
  const [editForm, setEditForm] = useState({ title: '', message: '', status: 'active' });
  const [editImage, setEditImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.page, search]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 10 };
      if (search) params.search = search;
      const response = await announcementAPI.getAll(params);
      setAnnouncements(response.data.announcements);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Habaye ikosa mu kubona amatangazo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await announcementAPI.delete(deleteModal.id);
      toast.success('Itangazo ryasibwe neza!');
      setDeleteModal({ open: false, id: null });
      fetchAnnouncements();
    } catch (error) {
      toast.error('Habaye ikosa mu gusiba itangazo.');
    }
  };

  const openEdit = (ann) => {
    setEditForm({ title: ann.title, message: ann.message, status: ann.status });
    setEditImage(null);
    setEditModal({ open: true, announcement: ann });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.message) {
      toast.error('Uzuza umutwe n\'ubutumwa.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('message', editForm.message);
      formData.append('status', editForm.status);
      if (editImage) formData.append('image', editImage);

      await announcementAPI.update(editModal.announcement.id, formData);
      toast.success('Itangazo ryavuguruwe neza!');
      setEditModal({ open: false, announcement: null });
      fetchAnnouncements();
    } catch (error) {
      toast.error('Habaye ikosa mu kuvugurura itangazo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amatangazo Yanjye</h1>
          <p className="text-gray-500 mt-1">Gucunga amatangazo yawe yose</p>
        </div>
        <button
          onClick={() => navigate('/umuyobozi/itangazo-rishya')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm"
        >
          <FiPlus size={18} />
          Itangazo Rishya
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={(q) => { setSearch(q); setPagination(prev => ({ ...prev, page: 1 })); }} placeholder="Shakisha mu matangazo..." />
      </div>

      {loading ? (
        <LoadingSpinner message="Gutegura amatangazo..." />
      ) : announcements.length === 0 ? (
        <EmptyState title="Nta matangazo" message="Ntabwo ufite amatangazo kuri ubu." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {ann.image && (
                  <img src={getUploadUrl(ann.image)} alt={ann.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{ann.title}</h3>
                    <StatusBadge status={ann.status} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ann.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <FiCalendar size={13} />
                      <span className="text-xs">{new Date(ann.created_at).toLocaleDateString('rw-RW')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(ann)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: ann.id })}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Siba Itangazo"
        message="Urashaka gusiba iri tangazo? Ibi ntibihindurwa."
      />

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Hindura Itangazo</h3>
              <button onClick={() => setEditModal({ open: false, announcement: null })} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Umutwe</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubutumwa</label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imiterere</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                >
                  <option value="active">Irakora</option>
                  <option value="hidden">Yahishwe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ifoto (ntibisabwa)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, announcement: null })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={16} />}
                  Bika
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAnnouncements;
