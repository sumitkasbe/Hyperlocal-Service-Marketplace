import WelcomeCard from "./components/WelcomeCard";
import ServiceSearch from "./components/ServiceSearch";
import PopularServices from "./components/PopuplarServices";
import RecentBookings from "./components/RecentBookings";
import { Navigate } from "react-router-dom";
import { getUser } from "../../Utils/auth";

const UserDashboard = () => {
  const user = getUser();

  if (!user || user.role !== "user") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Header Section - Pass user to WelcomeCard */}
        <WelcomeCard user={user} />

        {/* Search Section */}
        <div className="py-4">
          <ServiceSearch />
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          <PopularServices />
          <RecentBookings />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;