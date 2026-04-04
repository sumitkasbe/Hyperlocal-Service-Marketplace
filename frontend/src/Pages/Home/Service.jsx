import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Hammer, 
  Settings
} from "lucide-react";
import gsap from "gsap";

const Service = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Map service names to actual service IDs
  const serviceIdMap = {
    "AC & Appliance Repair": "b0394736-4f80-4d32-bb96-edce57db82c2",
    "Electrical Repairs": "56fe99f5-eeee-48ea-85e6-3363ff50d648",
    "Plumbing & Sanitary": "a5313d7b-9cf7-4be9-8719-50c5f56a099e",
    "Carpentry Services": "f2d261ce-62e7-4085-ba0f-69c035867168",
  };

  const handleCardClick = (serviceName) => {
    const serviceId = serviceIdMap[serviceName];
    if (serviceId) {
      navigate(`/services/${serviceId}/providers`);
    }
  };

  // Entrance animation - Keep this
  useLayoutEffect(() => {
    gsap.fromTo(
      cardRefs.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );
  }, []);

  // Optimized hover animations - faster and snappier
  const handleMouseEnter = (index) => {
    const card = cardRefs.current[index];
    const iconContainer = card.querySelector(".icon-container");

    // Use faster duration and easier easing
    gsap.to(card, { 
      y: -6, 
      duration: 0.2, 
      ease: "power2.out",
      overwrite: true
    });
    gsap.to(iconContainer, { 
      scale: 1.05, 
      rotate: 5, 
      duration: 0.2, 
      ease: "back.out(0.8)",
      overwrite: true
    });
  };

  const handleMouseLeave = (index) => {
    const card = cardRefs.current[index];
    const iconContainer = card.querySelector(".icon-container");

    gsap.to(card, { 
      y: 0, 
      duration: 0.25, 
      ease: "power2.out",
      overwrite: true
    });
    gsap.to(iconContainer, { 
      scale: 1, 
      rotate: 0, 
      duration: 0.25, 
      ease: "power2.out",
      overwrite: true
    });
  };

  const services = [
    {
      name: "AC & Appliance Repair",
      icon: <Settings className="w-8 h-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      accent: "group-hover:bg-blue-100",
    },
    {
      name: "Electrical Repairs",
      icon: <Zap className="w-8 h-8" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      accent: "group-hover:bg-amber-100",
    },
    {
      name: "Plumbing & Sanitary",
      icon: <Droplets className="w-8 h-8" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      accent: "group-hover:bg-emerald-100",
    },
    {
      name: "Carpentry Services",
      icon: <Hammer className="w-8 h-8" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      accent: "group-hover:bg-purple-100",
    },
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Our Premium Services
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Choose from our specialized categories to find the best local professionals for your home needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" ref={containerRef}>
          {services.map((service, i) => (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => handleCardClick(service.name)}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
              className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col items-center text-center p-6"
            >
              {/* Decorative background glow - removed for performance */}
              <div className={`icon-container w-16 h-16 ${service.bgColor} ${service.color} rounded-xl flex items-center justify-center mb-5 transition-all duration-200`}>
                {service.icon}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {service.name}
              </h3>

              <p className="text-sm text-slate-500 mb-3">
                {service.name === "AC & Appliance Repair" && "Cooling & appliance experts"}
                {service.name === "Electrical Repairs" && "Wiring & electrical solutions"}
                {service.name === "Plumbing & Sanitary" && "Leak & pipe specialists"}
                {service.name === "Carpentry Services" && "Woodwork & furniture repair"}
              </p>

              {/* Simple hover indicator */}
              <div className="w-6 h-0.5 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Service;