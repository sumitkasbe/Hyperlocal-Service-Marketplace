import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import gsap from "gsap";
import { getUser } from "../../../Utils/auth"; // Adjust path as needed

const WelcomeCard = () => {
  const navigate = useNavigate(); // Add this
  const borderRef = useRef(null);
  const cardRef = useRef(null);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Get user data from auth utility
    const user = getUser();
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  useLayoutEffect(() => {
    // 1. Entrance animation for the whole card
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    );

    // 2. Continuous moving gradient border animation
    if (borderRef.current) {
      gsap.to(borderRef.current, {
        backgroundPosition: "200% center",
        duration: 4,
        repeat: -1,
        ease: "none",
      });
    }
  }, []);

  const handleBookNow = () => {
    navigate('/services');
  };

  return (
    /* Outer Container: Provides the 2px "border" space */
    <div
      ref={cardRef}
      className="relative p-[2px] rounded-[34px] overflow-hidden w-full shadow-lg transition-transform hover:scale-[1.01] duration-300"
    >
      {/* GSAP Animated Gradient Layer */}
      <div
        ref={borderRef}
        className="absolute inset-0 w-[400%] h-full z-0"
        style={{
          background:
            "linear-gradient(90deg, #0055b8, #2ca091, #46bc84, #2ca091, #0055b8)",
          backgroundSize: "25% 100%",
        }}
      />

      {/* Main Inner Card Content */}
      <div className="relative z-10 bg-white rounded-[32px] p-10 flex flex-col md:flex-row justify-between items-center overflow-hidden">
        {/* Top Right Decorative Blur */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-50 rounded-full opacity-60 blur-3xl -z-10" />

        <div className="relative z-20 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055b8] via-[#2ca091] to-[#46bc84]">
              {userName}
            </span>{" "}
            👋
          </h1>
          <p className="text-lg text-slate-500 mt-2 font-medium">
            Ready to get things done today?
          </p>
        </div>

        <button 
          onClick={handleBookNow}
          className="relative z-20 mt-6 md:mt-0 px-8 py-4 rounded-2xl bg-[#0055b8] text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          Book New Service
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;