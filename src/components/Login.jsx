import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsRedirecting(true);

    try {
      const response = await axios.post("https://contactly-1clq.onrender.com/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data; // Extract user details and token

      // Save token & user data in local storage
      localStorage.setItem("authToken", token);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      toast.success("Login Successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid email or password!";
      toast.error(errorMessage);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-700 to-pink-700 flex flex-col">
      {/* Toast Notification */}
      <Toaster position="top-right" toastOptions={{ duration: 1500 }} />

      {/* Top Navigation Bar */}
      <div className="bg-white py-4 shadow-lg flex justify-between items-center px-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Your Contact Book</h1>
        <span
          onClick={() => !isRedirecting && navigate("/signup")}
          className={`text-blue-600 font-semibold cursor-pointer hover:underline text-lg ${
            isRedirecting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          Sign Up
        </span>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-200">
          <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">Login</h2>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              disabled={isRedirecting}
            />
          </div>
          <div className="mt-4">
            <label className="block mb-2 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              disabled={isRedirecting}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={isRedirecting}
            className={`w-full mt-6 py-3 text-white font-bold rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:scale-105 transition-transform duration-300 shadow-md ${
              isRedirecting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isRedirecting ? "Logging in..." : "Login"}
          </button>
          <p className="mt-4 text-center text-gray-700">
            Don't have an account?{" "}
            <span
              onClick={() => !isRedirecting && navigate("/signup")}
              className={`text-blue-600 font-semibold cursor-pointer hover:underline ${
                isRedirecting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              Sign up here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
