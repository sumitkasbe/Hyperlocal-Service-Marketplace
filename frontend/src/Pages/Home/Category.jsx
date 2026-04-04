import { Star, Briefcase, CheckCircle2 } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const Category = () => {
  const navigate = useNavigate();

  const borderRefs = useRef([]);
  const cardContainerRefs = useRef([]);
  const iconRefs = useRef([]);

  useLayoutEffect(() => {
    borderRefs.current.forEach((el) => {
      if (el) {
        gsap.to(el, {
          backgroundPosition: "200% center",
          duration: 4,
          repeat: -1,
          ease: "none",
        });
      }
    });
  }, []);

  const onMouseEnter = (index) => {
    gsap.to(cardContainerRefs.current[index], {
      y: -10,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(borderRefs.current[index], {
      duration: 1.5,
      ease: "none",
      overwrite: "auto",
    });

    gsap.to(iconRefs.current[index], {
      scale: 1.2,
      rotate: 5,
      duration: 0.3,
    });
  };

  const onMouseLeave = (index) => {
    gsap.to(cardContainerRefs.current[index], {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "power2.inOut",
    });

    gsap.to(borderRefs.current[index], {
      duration: 4,
      ease: "none",
      overwrite: "auto",
    });

    gsap.to(iconRefs.current[index], {
      scale: 1,
      rotate: 0,
      duration: 0.3,
    });
  };

  const cards = [
    {
      title: "For Customers",
      desc: "Get access to thousands of verified professionals for your home service needs.",
      list: ["Verified professionals", "Upfront pricing", "Secure payments"],
      dark: false,
      icon: <Star className="w-6 h-6 text-blue-600" />,
      btnText: "Find a Pro",
      action: () => navigate("/auth/login"),
      btnClass:
        "border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white",
    },
    {
      title: "For Providers",
      desc: "Grow your business, manage your schedule, and get paid securely.",
      list: ["Zero lead fees", "Flexible schedule", "Direct payments"],
      dark: true,
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
      btnText: "Become a Provider",
      action: () => navigate("/auth/signup"),
      btnClass:
        "bg-gradient-to-r from-[#2ca091] to-[#46bc84] text-white hover:brightness-110",
    },
  ];

  return (
    <section className="bg-slate-50/50 mt-15 p-10">
      <div className="text-center pt-8 ">
        <h2 className="text-slate-900 text-4xl font-bold">
          Choose your path
        </h2>
        <p className="text-gray-500 mt-3 text-lg">
          Join our marketplace as a customer or service provider
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-12 mt-16 px-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            ref={(el) => (cardContainerRefs.current[idx] = el)}
            onMouseEnter={() => onMouseEnter(idx)}
            onMouseLeave={() => onMouseLeave(idx)}
            className="relative p-[2px] rounded-[34px] overflow-hidden w-full max-w-[440px] shadow-lg"
          >
            {/* Animated Border */}
            <div
              ref={(el) => (borderRefs.current[idx] = el)}
              className="absolute inset-0 w-[400%] h-full"
              style={{
                background:
                  "linear-gradient(90deg, #0055b8, #1a84a7, #46bc84, #1a84a7, #0055b8)",
                backgroundSize: "25% 100%",
              }}
            />

            {/* Card Body */}
            <div
              className={`relative z-10 rounded-[32px] p-8 ${
                card.dark ? "bg-[#0a1120]" : "bg-white"
              }`}
            >
              <div className="relative z-20">
                <div
                  ref={(el) => (iconRefs.current[idx] = el)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    card.dark
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-blue-50"
                  }`}
                >
                  {card.icon}
                </div>

                <h3
                  className={`text-3xl font-bold ${
                    card.dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.title}
                </h3>

                <p
                  className={`mt-4 text-lg ${
                    card.dark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {card.desc}
                </p>

                <ul className="mt-8 space-y-4">
                  {card.list.map((item) => (
                    <li
                      key={item}
                      className={`flex items-center gap-3 ${
                        card.dark ? "text-slate-200" : "text-slate-700"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={card.action}
                  className={`w-full mt-10 py-4 rounded-2xl font-bold text-lg transition ${card.btnClass}`}
                >
                  {card.btnText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Category;
