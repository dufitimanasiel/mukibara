import { useState, useEffect } from 'react';
import { pinAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiKey, FiPlus, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const AdminPins = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    try {
      const response = await pinAPI.getAll();
      setPins(response.data);
    } catch (error) {
      toast.error('Habaye ikosa mu kubona PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPin = async (e) => {
    e.preventDefault();
    if (!newPin.trim()) {
      toast.error('Andika PIN.');
      return;
    }
    setAdding(true);
    try {
      await pinAPI.create(newPin.trim());
      toast.success('PIN yashyizweho neza!');
      setNewPin('');
      setShowAddForm(false);
      fetchPins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Habaye ikosa.');
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await pinAPI.updateStatus(id, newStatus);
      toast.success(newStatus === 'active' ? 'PIN yatangijwe!' : 'PIN yarahishwe!');
      fetchPins();
    } catch (error) {
      toast.error('Habaye ikosa mu guhindura imiterere.');
    }
  };

  if (loading) return <LoadingSpinner message="Gutegura PIN..." />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PIN z'Abaturage</h1>
          <p className="text-gray-500 mt-1">Gucunga PIN zifasha abaturage kwinjira</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm"
        >
          <FiPlus size={18} />
          Ongeraho PIN
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">PIN Nshya</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <FiX size={20} />
            </button>
          </div>
          <form onSubmit={handleAddPin} className="flex gap-3">
            <input
              type="text"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Urugero: *13672#"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm disabled:opacity-50"
            >
              {adding ? 'Gutegereza...' : 'Ongeraho'}
            </button>
          </form>
        </div>
      )}

      {pins.length === 0 ? (
        <EmptyState icon={FiKey} title="Nta PIN" message="Nta PIN z'abaturage zibonetse." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PIN Code</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imiterere</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Itariki</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ibikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pins.map((pin) => (
                  <tr key={pin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">#{pin.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{pin.pin_code}</span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={pin.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(pin.created_at).toLocaleDateString('rw-RW')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(pin.id, pin.status)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          pin.status === 'active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {pin.status === 'active' ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                        {pin.status === 'active' ? 'Hisha' : 'Tangiza'}
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

export default AdminPins;
