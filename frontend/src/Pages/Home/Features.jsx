import React, { useRef } from "react";
import { ShieldCheck, Star, Clock } from "lucide-react";
import gsap from "gsap";

const Features = () => {
  const iconRefs = useRef([]);

  // Vertical flip animation (Y-axis)
  const onIconEnter = (index) => {
    // Check if an animation is already running to prevent "infinite spinning" on fast hover
    if (!gsap.isTweening(iconRefs.current[index])) {
      gsap.to(iconRefs.current[index], {
        rotationY: "+=360", // Performs exactly one full flip per hover
        duration: 1,
        ease: "power2.out",
      });
    }
  };

  const featureData = [
    {
      title: "Verified Pros",
      desc: "Every provider undergoes a strict background check.",
      icon: ShieldCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Top Rated",
      desc: "See ratings and reviews from real customers before booking.",
      icon: Star,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      title: "On Time",
      desc: "Track your pro's arrival in real-time with our app.",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {featureData.map((feature, i) => {
            const IconComponent = feature.icon;
            
            return (
              <div key={i} className="flex flex-col items-center">
                {/* The perspective style is key for the 3D "flip" look */}
                <div
                  style={{ perspective: "1000px" }} 
                  className="mb-6"
                >
                  <div
                    ref={(el) => (iconRefs.current[i] = el)}
                    onMouseEnter={() => onIconEnter(i)}
                    className={`w-20 h-20 ${feature.bgColor} rounded-3xl flex items-center justify-center cursor-pointer`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed max-w-[280px]">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;