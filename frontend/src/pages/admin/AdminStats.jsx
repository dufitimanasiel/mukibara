import { useState, useEffect } from 'react';
import { statsAPI } from '../../services/api';
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await statsAPI.getAll();
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Gutegura imibare..." />;

  const visitPieData = [
    { name: 'Abaturage', value: stats?.citizenVisits || 0 },
    { name: 'Abayobozi', value: stats?.managerVisits || 0 },
    { name: 'Admin', value: stats?.adminVisits || 0 },
  ];

  const statusData = [
    { name: 'Abayobozi Bakora', value: stats?.activeManagers || 0 },
    { name: 'Abayobozi Bahishwe', value: stats?.hiddenManagers || 0 },
    { name: 'PIN Zikora', value: stats?.activePins || 0 },
    { name: 'PIN Zahishwe', value: stats?.hiddenPins || 0 },
  ];

  const overviewData = [
    { name: 'Amatangazo', umubare: stats?.totalAnnouncements || 0 },
    { name: 'Abayobozi', umubare: (stats?.activeManagers || 0) + (stats?.hiddenManagers || 0) },
    { name: 'PIN', umubare: (stats?.activePins || 0) + (stats?.hiddenPins || 0) },
    { name: 'Abashyitsi', umubare: stats?.totalVisits || 0 },
  ];

  const COLORS = ['#0d9488', '#f59e0b', '#6366f1', '#ef4444'];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imibare Yose</h1>
          <p className="text-gray-500 mt-1">Isesengura ry'imibare y'isisitemu</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          <FiRefreshCw size={16} />
          Vugurura
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incamake Rusange</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="umubare" fill="#0d9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abashyitsi mu Bwoko</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={visitPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {visitPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Imiterere y'Isisitemu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
