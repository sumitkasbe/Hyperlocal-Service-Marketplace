import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home/Home";
import Auth from "./Pages/Auth/Auth";

import CustomerDashboard from "./Pages/User_Dashboard/CustomerDashboard";
import ProviderDashboard from "./Pages/Provider_Dashboard/ProviderDashboard";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Services from "./Pages/Services/Services";
import ServiceProviders from "./Pages/Services/ServiceProviders";

import BookingForm from "./components/booking/BookingForm";
import MyBookings from "./components/booking/MyBooking";
import BookingDetails from "./components/booking/BookingDetails";
import ProviderBookingQueue from "./components/booking/ProviderBookingQueue";
import ProviderProfile from "./Pages/Provider_Dashboard/components/ProviderProfile"
import UserProfile from "./Pages/User_Dashboard/components/UserProfile";
import EditProfile from "./Pages/User_Dashboard/components/EditProfile";

import AllReviews from "./Pages/Provider_Dashboard/components/AllReviews"

// Admin imports - FIXED PATHS
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ProviderManagement from "./Pages/Admin/ProviderManagement";
import BookingMonitoring from "./Pages/Admin/BookingMonitoring";
import ComplaintHandling from "./Pages/Admin/ComplaintHandling";
import PlatformManagement from "./Pages/Admin/PlatformManagement";
import PaymentTransactions from "./Pages/Admin/PaymentTransactions";
import Analytics from "./Pages/Admin/Analytics";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminBookingDetails  from "./Pages/Admin/AdminBookingDetails"

// import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

function App() {
  return ( 
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth/:type" element={<Auth />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:serviceId/providers" element={<ServiceProviders />} />
      </Route>

      {/* PROTECTED DASHBOARD ROUTES (with header) */}
      <Route element={<DashboardLayout />}>
        {/* User Routes */}
        <Route path="/dashboard/user" element={<CustomerDashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/book/:serviceId" element={<BookingForm />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        {/* Provider Routes */}
        <Route path="/dashboard/provider" element={<ProviderDashboard />} />
        <Route path="/provider/queue" element={<ProviderBookingQueue />} />
        <Route path="/provider/reviews" element={<AllReviews />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
      </Route>

     {/* ADMIN ROUTES */}
      <Route path="/admin/login" element={<AdminLogin />} />
      {/* <Route element={<ProtectedAdminRoute />}> */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/providers" element={<ProviderManagement />} />
          <Route path="/admin/bookings" element={<BookingMonitoring />} />
          <Route path="/admin/complaints" element={<ComplaintHandling />} />
          <Route path="/admin/categories" element={<PlatformManagement />} />
          <Route path="/admin/payments" element={<PaymentTransactions />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/bookings/:id" element={<AdminBookingDetails />} />
        </Route>
      {/* </Route> */}
    </Routes>
  );
}
export default App;