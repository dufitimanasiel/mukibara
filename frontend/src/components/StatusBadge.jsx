const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
      {isActive ? 'Irakora' : 'Yarahishwe'}
    </span>
  );
};

export default StatusBadge;
