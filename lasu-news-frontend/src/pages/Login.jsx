import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms & Conditions");
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex">

        {/* Left — Image Panel */}
        <div className="hidden md:block w-[45%] relative overflow-hidden rounded-3xl m-3">
          {/* Replace src with your preferred image */}
          <img
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop"
            alt="News"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />

          {/* Logo on image */}
          <div className="absolute top-6 left-6 z-10">
            <div className="flex items-center gap-1">
              <span className="text-white font-black text-2xl tracking-tighter">
                LASU
              </span>
              <span className="text-[#e63946] font-black text-2xl tracking-tighter">
                .NEWS
              </span>
            </div>
          </div>

          {/* Bottom text on image */}
          <div className="absolute bottom-8 left-6 right-6 z-10">
            <h2 className="text-white font-black text-3xl leading-tight mb-2">
              Stay Ahead of{" "}
              <span className="text-[#e63946]">Every Story.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Breaking news, campus updates, and the stories that matter.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">
                Live Updates
              </span>
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          {/* Back */}
          <Link
            to="/"
            className="flex items-center gap-1 text-[#9ca3af] hover:text-[#1a1a2e] text-sm mb-10 transition-colors w-fit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          <h1 className="text-4xl font-black text-[#0a0a0a] mb-1 tracking-tight">
            Log in
          </h1>
          <p className="text-[#9ca3af] text-sm mb-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#0a0a0a] font-bold underline underline-offset-2 hover:text-[#e63946] transition-colors"
            >
              Create an Account
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0a0a0a] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full px-5 py-3.5 border border-[#e5e7eb] rounded-full text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-black/5 transition-all placeholder:text-[#d1d5db]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#0a0a0a] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full px-5 py-3.5 border border-[#e5e7eb] rounded-full text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-black/5 transition-all placeholder:text-[#d1d5db] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#0a0a0a] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <button type="button" className="text-xs text-[#9ca3af] hover:text-[#0a0a0a] underline underline-offset-2 transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold py-4 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide mt-1"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>

            {/* Terms */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded accent-[#0a0a0a]"
              />
              <span className="text-xs text-[#6b7280]">
                I agree to the{" "}
                <span className="text-[#0a0a0a] font-bold underline underline-offset-1 cursor-pointer">
                  Terms & Condition
                </span>
              </span>
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#e5e7eb]" />
              <span className="text-xs text-[#9ca3af]">or</span>
              <div className="flex-1 h-px bg-[#e5e7eb]" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-gray-50 rounded-full py-2.5 text-xs font-medium text-[#374151] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-gray-50 rounded-full py-2.5 text-xs font-medium text-[#374151] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Login;