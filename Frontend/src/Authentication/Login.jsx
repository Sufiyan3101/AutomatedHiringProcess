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
      {showAlert && (
          <div className="absolute flex w-80 h-1/5 bg-red-500 top-2/5 left-2/5 rounded-2xl">
            <div className="w-80 p-4 min-h-fit">
              <p className="text-lg font-bold text-white">Alert Message</p>
              <p className="text-sm text-white">{errorMessage}</p>
              <button onClick={() => setShowAlert(false)} className="ml-60 mt-5 border border-white text-white w-10 h-fit rounded-md text-sm hover:cursor-pointer hover:bg-green-400  duration-500 ease-in-out">OK</button>
            </div>
          </div>
        )}
      <div className="flex justify-center items-center h-screen bg-emerald-950">
        <div className="w-11/12 sm:w-3/4 md:w-2/5 h-fit bg-transparent border rounded-xl border-white text-white flex items-center flex-col p-2">
          <div className="h-fit text-center text-2xl font-bold">
            Welcome Back
          </div>
          <form className="flex flex-col mt-2.5 h-fit min-w-11/12 p-2.5">
            <label className="font-semibold">Email *</label>
            <input
              type="email"
              placeholder="Enter your email..."
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              className="border rounded-md pl-1 text-xs h-7 border-gray-500 mt-2 hover:border-white focus:border-gray-500 focus:outline-none focus:ring-0"
            />
            <label className="font-semibold mt-4">Password *</label>
            <input
              type="password"
              placeholder="Enter your password..."
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              className="border rounded-md pl-1 text-xs h-7 border-gray-500 mt-2 hover:border-white focus:border-gray-500 focus:outline-none focus:ring-0"
            />
            <button
              className="border rounded-md border-gray-500 mt-6 h-7 hover:bg-green-500 hover:border-none cursor-pointer duration-500 ease-in-out"
              onClick={onSubmit}
            >
              Login
            </button>
          </form>
          <hr className="w-11/12 mb-2 mt-3" />
          <div>
            <label>New to the platform ?</label>
            <button
              className="hover:cursor-pointer hover:text-green-500 duration-500 ease-in-out ml-1"
              onClick={regNav}
            >
              SignUp
            </button>
          </div>
          <div>
            <button
              className="h-4 mt-3 rounded-md flex flex-row justify-center items-center gap-2 hover:text-green-500 cursor-pointer duration-500 ease-in-out ani"
              onClick={onGoogleSignIn}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-4 h-4"
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
