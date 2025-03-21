import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !email || !password) {
      toast.error("Please fill all fields.");
      return;
    }

    if (password !== confirmpassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const response = await axios.post("https://contactly-1clq.onrender.com/api/auth/signup", {
        username,
        email,
        password,
      });

      console.log("Signup response:", response); // Debugging

      toast.success("Signup Successful! Redirecting to login...");

      setTimeout(() => {
        window.location.href = ("/");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || "Signup failed!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-pink-700 flex flex-col justify-center items-center">
      {/* Toast Container */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Top Navigation Bar */}
      <div className="bg-white py-4 shadow-lg flex justify-between items-center px-8 w-full fixed top-0">
        <h1 className="text-3xl font-extrabold text-gray-800">Your Contact Book</h1>
        <span
          onClick={() => navigate("/")}
          className="text-blue-600 font-semibold cursor-pointer hover:underline text-lg"
        >
          Login
        </span>
      </div>

      {/* Signup Form */}
      <div className="flex items-center justify-center w-full flex-grow mt-16">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Signup</h2>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>
          <div className="mt-3">
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>
          <div className="mt-3">
            <label className="block mb-2 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>
          <div className="mt-3">
            <label className="block mb-2 font-semibold text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm your password"
            />
          </div>
          <button
            onClick={handleSignup}
            className="w-full mt-5 py-2.5 text-white font-bold rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Sign Up
          </button>
          <p className="mt-3 text-center text-gray-700">
            Already have an account? {" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
