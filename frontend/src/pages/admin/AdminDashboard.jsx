import { useState, useEffect } from 'react';
import { statsAPI } from '../../services/api';
import { FiFileText, FiUsers, FiKey, FiEye, FiTrendingUp, FiUserX } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getAll();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Gutegura imibare..." />;

  const statCards = [
    { label: 'Amatangazo Yose', value: stats?.totalAnnouncements || 0, icon: FiFileText, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Abayobozi Bakora', value: stats?.activeManagers || 0, icon: FiUsers, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Abayobozi Bahishwe', value: stats?.hiddenManagers || 0, icon: FiUserX, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
    { label: 'PIN Zikora', value: stats?.activePins || 0, icon: FiKey, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: 'PIN Zahishwe', value: stats?.hiddenPins || 0, icon: FiKey, color: 'from-red-500 to-red-600', bg: 'bg-red-50' },
    { label: 'Abashyitsi Bose', value: stats?.totalVisits || 0, icon: FiEye, color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50' },
  ];

  const visitData = [
    { name: 'Abaturage', value: stats?.citizenVisits || 0 },
    { name: 'Abayobozi', value: stats?.managerVisits || 0 },
    { name: 'Admin', value: stats?.adminVisits || 0 },
  ];

  const barData = [
    { name: 'Amatangazo', umubare: stats?.totalAnnouncements || 0 },
    { name: 'Abayobozi', umubare: (stats?.activeManagers || 0) + (stats?.hiddenManagers || 0) },
    { name: 'PIN', umubare: (stats?.activePins || 0) + (stats?.hiddenPins || 0) },
    { name: 'Abashyitsi', umubare: stats?.totalVisits || 0 },
  ];

  const COLORS = ['#0d9488', '#f59e0b', '#6366f1'];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Ibikubiyemo</h1>
        <p className="text-gray-500 mt-1">Murakaza neza, Umuyobozi Mukuru</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="text-white" size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abashyitsi mu Bwoko</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={visitData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {visitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incamake y'Imibare</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="umubare" fill="#0d9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
