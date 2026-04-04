import { useState } from "react";
import api from "../../api/axios";
import { setAuth } from "../../Utils/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      console.log("Login response:", res);

      setAuth(res.data.token, res.data.user);

      showToast(`Welcome back ${res.data.user.name}!`, "success");

      setTimeout(() => {
        if (res.data.user.role === "user") {
          navigate("/dashboard/user");
        } else if (res.data.user.role === "provider") {
          navigate("/dashboard/provider");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Invalid email or password";
      showToast(message, "error");
      
      if (message.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes("password")) {
        setErrors(prev => ({ ...prev, password: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
      errors[field] ? "border-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500"
    }`;

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          className={inputClass("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          className={inputClass("password")}
          // Remove 'required' attribute - we handle validation manually
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#0055b8] text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.99] shadow-lg shadow-blue-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      
      <p className="text-center text-sm text-blue-600 font-medium cursor-pointer hover:underline">
        Forgot Password?
      </p>
    </form>
  );
};

export default Login;