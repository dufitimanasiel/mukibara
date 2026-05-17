import { useState, useEffect } from 'react';
import { announcementAPI, getUploadUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiFileText, FiPlus, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, hidden: 0 });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAll({ limit: 5 });
      setAnnouncements(response.data.announcements);
      const total = response.data.pagination.total;
      const active = response.data.announcements.filter(a => a.status === 'active').length;
      setStats({ total, active, hidden: total - active });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Gutegura ibikubiyemo..." />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Murakaza neza, {user?.username}!</h1>
          <p className="text-gray-500 mt-1">Reba incamake y'amatangazo yawe</p>
        </div>
        <button
          onClick={() => navigate('/umuyobozi/itangazo-rishya')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm"
        >
          <FiPlus size={18} />
          Itangazo Rishya
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Amatangazo Yose</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <FiFileText className="text-white" size={22} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Akora</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <FiFileText className="text-white" size={22} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Yahishwe</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.hidden}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <FiFileText className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Amatangazo Mashya</h3>
        </div>
        {announcements.length === 0 ? (
          <EmptyState title="Nta matangazo" message="Ntabwo ufite amatangazo kuri ubu. Tangira wandike itangazo rishya!" />
        ) : (
          <div className="divide-y divide-gray-100">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-6 hover:bg-gray-50 transition-colors flex gap-4">
                {ann.image && (
                  <img src={getUploadUrl(ann.image)} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{ann.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <FiCalendar className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-400">{new Date(ann.created_at).toLocaleDateString('rw-RW')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
