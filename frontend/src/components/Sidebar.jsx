import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiFileText, FiUsers, FiKey, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiSettings
} from 'react-icons/fi';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/injira');
  };

  const adminLinks = [
    { to: '/admin', icon: FiHome, label: 'Ibikubiyemo' },
    { to: '/admin/amatangazo', icon: FiFileText, label: 'Amatangazo' },
    { to: '/admin/abayobozi', icon: FiUsers, label: 'Abayobozi' },
    { to: '/admin/pin', icon: FiKey, label: 'PIN z\'Abaturage' },
    { to: '/admin/imibare', icon: FiBarChart2, label: 'Imibare' },
  ];

  const managerLinks = [
    { to: '/umuyobozi', icon: FiHome, label: 'Ibikubiyemo' },
    { to: '/umuyobozi/amatangazo', icon: FiFileText, label: 'Amatangazo Yanjye' },
    { to: '/umuyobozi/itangazo-rishya', icon: FiFileText, label: 'Itangazo Rishya' },
  ];

  const links = isAdmin ? adminLinks : managerLinks;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/20 text-white shadow-lg'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl gradient-primary text-white shadow-lg"
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 gradient-sidebar transform transition-transform duration-300 lg:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col min-h-screen`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white tracking-tight">MukibaraConnect</h1>
          <p className="text-xs text-teal-200/70 mt-1">Itangazo Rigera Kuri Bose</p>
        </div>

        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-white/10">
          <p className="text-white text-sm font-semibold">{user?.username}</p>
          <p className="text-teal-200/70 text-xs capitalize">
            {user?.role === 'admin' ? 'Umuyobozi Mukuru' : 'Umuyobozi'}
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/umuyobozi'}
              className={linkClass}
              onClick={() => setIsOpen(false)}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all text-sm font-medium"
          >
            <FiLogOut size={18} />
            Sohoka
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
