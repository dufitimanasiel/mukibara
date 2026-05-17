import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiLogIn, FiHash, FiArrowRight } from 'react-icons/fi';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginCitizen } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Uzuza izina n\'ijambo ry\'ibanga.');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(username, password);
      toast.success('Winjiye neza!');
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/umuyobozi');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kwinjira byanze. Ongera ugerageze.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinAccess = async (e) => {
    e.preventDefault();
    if (!pin) {
      toast.error('Andika PIN yawe.');
      return;
    }
    setLoading(true);
    try {
      await pinAPI.verify(pin);
      loginCitizen();
      toast.success('Winjiye neza!');
      navigate('/abaturage');
    } catch (error) {
      toast.error(error.response?.data?.message || 'PIN ntabwo ari yo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MukibaraConnect</h1>
          <p className="text-teal-200/80 text-sm">Itangazo Rigera Kuri Bose</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiLogIn className="inline mr-2" />
              Injira
            </button>
            <button
              onClick={() => setActiveTab('pin')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'pin'
                  ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiHash className="inline mr-2" />
              Abaturage (PIN)
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Izina ry'umukoresha</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Andika izina ryawe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ijambo ry'ibanga</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Andika ijambo ry'ibanga"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Injira
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePinAccess} className="space-y-5">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center">
                    <FiHash className="text-teal-600 text-2xl" />
                  </div>
                  <p className="text-gray-600 text-sm">Andika PIN yawe kugira ngo ubone amatangazo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN y'Abaturage</label>
                  <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Urugero: *13672#"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm text-center text-lg tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Injira
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-teal-200/60 text-xs mt-6">
          &copy; 2024 MukibaraConnect. Uburenganzira bwose bwabikiwe.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
