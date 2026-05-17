import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await userAPI.getAll({ role: 'manager' });
      setManagers(response.data);
    } catch (error) {
      toast.error('Habaye ikosa mu kubona abayobozi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await userAPI.updateStatus(id, newStatus);
      toast.success(newStatus === 'active' ? 'Umuyobozi yatangijwe!' : 'Umuyobozi yarahishwe!');
      fetchManagers();
    } catch (error) {
      toast.error('Habaye ikosa mu guhindura imiterere.');
    }
  };

  if (loading) return <LoadingSpinner message="Gutegura abayobozi..." />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gucunga Abayobozi</h1>
        <p className="text-gray-500 mt-1">Tangiza cyangwa hisha konti z'abayobozi</p>
      </div>

      {managers.length === 0 ? (
        <EmptyState icon={FiUsers} title="Nta bayobozi" message="Nta bayobozi babonetse muri sisitemu." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Izina</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uruhare</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imiterere</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Itariki</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ibikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {managers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">#{manager.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">{manager.username[0].toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{manager.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">Umuyobozi</td>
                    <td className="px-6 py-4"><StatusBadge status={manager.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(manager.created_at).toLocaleDateString('rw-RW')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(manager.id, manager.status)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          manager.status === 'active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {manager.status === 'active' ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                        {manager.status === 'active' ? 'Hisha' : 'Tangiza'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagers;
