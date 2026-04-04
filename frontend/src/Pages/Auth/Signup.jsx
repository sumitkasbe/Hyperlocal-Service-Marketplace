import { useState } from "react";
import { ChevronDown } from "lucide-react";
import api from "../../api/axios";
import { setAuth } from "../../Utils/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const Signup = () => {
  const [role, setRole] = useState("Customer");
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });

  const roles = ["Customer", "Provider"];
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ── Validators ──────────────────────────────────────────
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  };

  // ── Input handlers ──────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setForm((prev) => ({ ...prev, phone: value }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleEmailBlur = () => {
    if (form.email && !validateEmail(form.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address (e.g. name@example.com)",
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setForm((prev) => ({ ...prev, role: selectedRole }));
    setIsOpen(false);
  };

  // ── Full validation before submit ───────────────────────
  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(form.email))
      newErrors.email = "Please enter a valid email address";
    if (!form.phone) newErrors.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length !== 10)
      newErrors.phone = "Please enter a valid 10-digit phone number";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const backendRole = form.role === "Customer" ? "user" : "provider";

      const requestData = {
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: backendRole,
        phone: form.phone || null,
      };

      const res = await api.post("/auth/signup", requestData);
      setAuth(res.data.token, res.data.user);

      // Show success toast
      showToast(
        `Welcome ${res.data.user.name}! Account created successfully.`,
        "success"
      );

      // Redirect based on role
      setTimeout(() => {
        if (res.data.user.role === "user") {
          navigate("/dashboard/user");
        } else if (res.data.user.role === "provider") {
          navigate("/dashboard/provider");
        }
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);
      const message = err.response?.data?.message || "Signup failed";
      
      // Show error toast
      if (message.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: message }));
        showToast(message, "error");
      } else {
        showToast(message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
      errors[field] ? "border-red-400 bg-red-50/30" : "border-slate-200"
    }`;

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Full Name + Role */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
              className={inputClass("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1.5">{errors.fullName}</p>
            )}
          </div>

          <div className="flex-1 relative">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              I want to be a
            </label>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex justify-between items-center hover:border-blue-400 transition-all"
            >
              <span className="text-slate-700 font-medium">{role}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>

            {isOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                {roles.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleRoleSelect(option)}
                    className="px-4 py-3 text-slate-700 cursor-pointer transition-colors hover:bg-blue-50 hover:text-[#0055b8] font-medium"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            onBlur={handleEmailBlur}
            placeholder="name@example.com"
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="9876543210"
            maxLength={10}
            className={inputClass("phone")}
          />
          {errors.phone ? (
            <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              Required for WhatsApp notifications
            </p>
          )}
        </div>

        {/* Password + Confirm Password */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={inputClass("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={inputClass("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#0055b8] text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.99] shadow-lg shadow-blue-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Signup;