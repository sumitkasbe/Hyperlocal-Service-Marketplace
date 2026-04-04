import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import Login from "./Login";
import Signup from "./Signup";
import { Home } from "lucide-react";

const Auth = () => {
  const { type } = useParams(); // login | signup
  const [isLogin, setIsLogin] = useState(type === "login");
  const formRef = useRef(null);

  // Sync state when URL changes
  useEffect(() => {
    setIsLogin(type === "login");
  }, [type]);

  const toggleAuth = (target) => {
    if ((target === "login" && isLogin) || (target === "signup" && !isLogin))
      return;

    gsap.to(formRef.current, {
      opacity: 0,
      x: isLogin ? -20 : 20,
      duration: 0.2,
      onComplete: () => {
        setIsLogin(target === "login");
        gsap.fromTo(
          formRef.current,
          { opacity: 0, x: isLogin ? 20 : -20 },
          { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
        );
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* Left Section */}
      <div className="w-full md:w-1/2 bg-[#0055b8] text-white p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="bg-white/20 p-2 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">RepairWalla</span>
          </div>

          <h1 className="text-5xl font-extrabold mb-6 text-[#111]">
            Connecting you with local experts.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Whether you need a quick repair or a major renovation, we have the right professional.
          </p>
        </div>

        <p className="text-sm opacity-70">&copy; 2026 RepairWalla Marketplace</p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8">
            <button
              onClick={() => toggleAuth("login")}
              className={`flex-1 py-2.5 font-semibold rounded-lg ${
                isLogin
                  ? "bg-white text-[#0055b8] shadow"
                  : "text-gray-500"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => toggleAuth("signup")}
              className={`flex-1 py-2.5 font-semibold rounded-lg ${
                !isLogin
                  ? "bg-white text-[#0055b8] shadow"
                  : "text-gray-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div ref={formRef}>
            {isLogin ? <Login /> : <Signup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
