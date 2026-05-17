import { useState, useEffect } from 'react';
import { announcementAPI, getUploadUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiCalendar, FiUser, FiImage } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import StatusBadge from '../../components/StatusBadge';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.page, search, statusFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await announcementAPI.getAll(params);
      setAnnouncements(response.data.announcements);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Habaye ikosa mu kubona amatangazo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Amatangazo Yose</h1>
        <p className="text-gray-500 mt-1">Reba amatangazo yose yo mu sisitemu</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} placeholder="Shakisha itangazo..." />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm bg-white"
        >
          <option value="">Imiterere Yose</option>
          <option value="active">Irakora</option>
          <option value="hidden">Yarahishwe</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Gutegura amatangazo..." />
      ) : announcements.length === 0 ? (
        <EmptyState title="Nta matangazo" message="Nta matangazo abonetse kuri ubu." />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Umutwe</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Umwanditsi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Itariki</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imiterere</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ifoto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {announcements.map((ann) => (
                    <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{ann.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs mt-1">{ann.message?.substring(0, 60)}...</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">{ann.creator?.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">{new Date(ann.created_at).toLocaleDateString('rw-RW')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ann.status} />
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {ann.image ? (
                          <img src={getUploadUrl(ann.image)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">Nta foto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </>
      )}
    </div>
  );
};

export default AdminAnnouncements;
