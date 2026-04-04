import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Zap, Droplets, Sparkles } from "lucide-react";

const services = [
  {
    name: "Plumbing",
    icon: <Droplets />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    glow: "shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]",
    hoverBorder: "group-hover:border-emerald-200",
    serviceId: "a5313d7b-9cf7-4be9-8719-50c5f56a099e"
  },
  {
    name: "Electrician",
    icon: <Zap />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    glow: "shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]",
    hoverBorder: "group-hover:border-amber-200",
    serviceId: "56fe99f5-eeee-48ea-85e6-3363ff50d648"
  },
  {
    name: "Cleaning",
    icon: <Sparkles />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    glow: "shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]",
    hoverBorder: "group-hover:border-blue-200",
    serviceId: "035ee8d2-68ad-49a2-8e6d-1c7f4209ce26"
  },
  {
    name: "AC Repair",
    icon: <Wrench />,
    color: "text-purple-600",
    bg: "bg-purple-50",
    glow: "shadow-[0_20px_40px_-10px_rgba(147,51,234,0.3)]",
    hoverBorder: "group-hover:border-purple-200",
    serviceId: "b0394736-4f80-4d32-bb96-edce57db82c2"
  },
];

const PopularServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId, serviceName) => {
    navigate(`/services/${serviceId}/providers`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight px-2">
        Popular Services
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <div
            key={i}
            onClick={() => handleServiceClick(service.serviceId, service.name)}
            /* REMOVED hover:shadow-xl to prevent the double-box effect */
            className={`group relative bg-white rounded-[32px] p-8 border border-slate-200 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center ${service.hoverBorder}`}
          >
            {/* GLOW LAYER: Removed -bottom-2 to keep it perfectly aligned with the box */}
            <div
              className={`absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${service.glow}`}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-16 h-16 ${service.bg} ${service.color} rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110`}
              >
                {React.cloneElement(service.icon, { size: 28 })}
              </div>

              <span className="font-bold text-slate-800 text-lg transition-colors duration-300 group-hover:text-slate-900">
                {service.name}
              </span>

              <div className="w-0 h-1 bg-slate-200 rounded-full mt-2 group-hover:w-8 transition-all duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularServices;