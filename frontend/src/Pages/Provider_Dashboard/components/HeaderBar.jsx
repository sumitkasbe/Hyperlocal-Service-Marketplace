import { Bell } from "lucide-react";
import AvailabilityToggle from "./AvailabilityToggle";

const HeaderBar = ({ isOnline, onToggle, user }) => {
  const userName = user?.name || "Provider";
  const userRating = user?.rating || "4.6";
  const userAvatar = user?.avatar; // This will be the Cloudinary URL
  const userTitle = user?.title || "Service Provider";

  const getInitials = (name) => {
    if (!name || name === "Provider") return "P";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(userName);

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-red-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(userName);

  return (
    <div className="bg-white rounded-[32px] shadow-sm px-8 py-5 flex items-center justify-between border border-slate-100">
      <div className="flex items-center gap-5">
        <div className="relative">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50"
            />
          ) : (
            <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white text-xl font-bold ring-4 ring-slate-50`}>
              {initials}
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-slate-300"}`}
          />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {userName}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-blue-600">
              {userTitle}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg">
              ⭐ {userRating}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <AvailabilityToggle isOnline={isOnline} onToggle={onToggle} />
        <div className="relative cursor-pointer w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors">
          <Bell className="w-6 h-6 text-slate-700" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;