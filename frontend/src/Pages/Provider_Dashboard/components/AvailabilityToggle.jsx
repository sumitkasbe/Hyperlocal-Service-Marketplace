const AvailabilityToggle = ({ isOnline, onToggle }) => {
  return (
    <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-2xl px-4 border border-slate-100">
      <span className={`text-sm font-bold tracking-tight transition-colors ${
        isOnline ? "text-green-600" : "text-slate-400"
      }`}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </span>

      <button
        onClick={onToggle}
        className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${
          isOnline ? "bg-green-500" : "bg-slate-300"
        }`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${
          isOnline ? "left-8" : "left-1"
        }`} />
      </button>
    </div>
  );
};

export default AvailabilityToggle;