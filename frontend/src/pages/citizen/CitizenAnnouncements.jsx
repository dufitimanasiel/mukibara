import { useState, useEffect } from 'react';
import { announcementAPI, getUploadUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiLogOut, FiSearch, FiMenu, FiX, FiChevronRight, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';

const CitizenAnnouncements = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.page, search]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 10 };
      if (search) params.search = search;
      const response = await announcementAPI.getPublic(params);
      setAnnouncements(response.data.announcements);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/injira');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="gradient-primary text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">MukibaraConnect</h1>
            <p className="text-teal-100 text-xs">Amatangazo y'Abaturage</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            <FiLogOut size={16} />
            Sohoka
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Amatangazo ({pagination.total})</h2>
          <p className="text-gray-500 text-sm">Soma amatangazo mashya yo mu karere</p>
        </div>

        <div className="mb-6">
          <SearchBar
            onSearch={(q) => { setSearch(q); setPagination(prev => ({ ...prev, page: 1 })); }}
            placeholder="Shakisha itangazo..."
          />
        </div>

        {loading ? (
          <LoadingSpinner message="Gutegura amatangazo..." />
        ) : announcements.length === 0 ? (
          <EmptyState title="Nta matangazo" message="Nta matangazo ahari kuri ubu. Garuka nyuma." />
        ) : (
          <>
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer animate-slide-up"
                  onClick={() => setSelectedAnn(selectedAnn?.id === ann.id ? null : ann)}
                >
                  <div className="flex">
                    {ann.image && (
                      <img src={getUploadUrl(ann.image)} alt={ann.title} className="w-24 h-24 sm:w-32 sm:h-32 object-cover flex-shrink-0" />
                    )}
                    <div className="p-4 flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{ann.title}</h3>
                      <p className={`text-sm text-gray-600 mt-1 ${selectedAnn?.id === ann.id ? '' : 'line-clamp-2'}`}>
                        {ann.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={12} />
                          {new Date(ann.created_at).toLocaleDateString('rw-RW')}
                        </div>
                        {ann.creator && (
                          <div className="flex items-center gap-1">
                            <FiUser size={12} />
                            {ann.creator.username}
                          </div>
                        )}
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
      </div>
    </div>
  );
};

export default CitizenAnnouncements;
