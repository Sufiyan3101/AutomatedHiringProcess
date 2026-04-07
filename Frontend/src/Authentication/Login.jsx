import React, { useState } from "react";
import { useNavigate,Navigate } from "react-router-dom";
import {
  doSignInWithEmailAndPassword,
  doSignWithGoogle,
} from "../firebase/auth";
import { useAuth } from "../contexts/authContexts";

const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  const regNav = () => {
    navigate("/register");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      await doSignInWithEmailAndPassword(email, password);
    } catch (error) {
      setErrorMessage(error.message || "Login failed");
      setShowAlert(true);
      setIsSigningIn(false);
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      await doSignWithGoogle();
    } catch (error) {
      setErrorMessage("Google sign-in failed");
      setShowAlert(true);
      setIsSigningIn(false);
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to="/dashboard" replace={true} />}
      <div className="relative flex justify-center items-center min-h-screen bg-emerald-950 px-4">
 
      {/* ── Alert ── */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-red-500 rounded-2xl p-5 w-80 shadow-xl">
            <p className="text-lg font-bold text-white mb-1">Alert</p>
            <p className="text-sm text-white mb-5">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAlert(false)}
                className="px-4 py-1.5 border border-white text-white text-sm rounded-lg
                  hover:bg-white hover:text-red-500 transition-all duration-300 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* ── Card ── */}
      <div className="w-full max-w-sm bg-transparent border border-white/20 rounded-2xl p-8
        shadow-lg backdrop-blur-sm">
 
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-emerald-400 text-sm mt-1">Sign in to your account</p>
        </div>
 
        {/* Form */}
        <div className="flex flex-col gap-4">
 
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-semibold">
              Email <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white
                text-sm placeholder:text-white/30 outline-none
                focus:border-emerald-500 hover:border-white/40 transition-colors duration-200"
            />
          </div>
 
          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-semibold">
              Password <span className="text-emerald-400">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white
                text-sm placeholder:text-white/30 outline-none
                focus:border-emerald-500 hover:border-white/40 transition-colors duration-200"
            />
          </div>
 
          {/* Login Button */}
          <button
            onClick={onSubmit}
            className="w-full mt-2 py-2.5 rounded-lg border border-white/20 text-white
              text-sm font-semibold hover:bg-emerald-600 hover:border-emerald-600
              transition-all duration-300 cursor-pointer"
          >
            Login
          </button>
        </div>
 
        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-white/10"/>
          <span className="text-white/30 text-xs">or</span>
          <hr className="flex-1 border-white/10"/>
        </div>
 
        {/* Google Sign In */}
        <button
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg
            border border-white/20 text-white text-sm font-medium
            hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-4 h-4"
          />
          Sign in with Google
        </button>
 
        {/* Sign Up */}
        <p className="text-center text-white/50 text-sm mt-6">
          New to the platform?{" "}
          <button
            onClick={regNav}
            className="text-emerald-400 hover:text-emerald-300 font-semibold
              transition-colors duration-300 cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;
