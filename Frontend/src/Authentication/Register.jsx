import { useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword, doSignOut } from "../firebase/auth";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const onSubmit = async (e) => {
      e.preventDefault();
  
      if (isRegistering) return;
  
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setShowAlert(true);
        return;
      }
  
      try {
        setIsRegistering(true);
        await doCreateUserWithEmailAndPassword(email, password);
        await doSignOut();
        navigate("/login");
      } catch (error) {
        setErrorMessage(error.message || "Registration failed");
        setShowAlert(true);
        setIsRegistering(false);
      }
    };

  const loginNav = () => {
    navigate("/login");
  };

  return (
    <>
      {/* {userLoggedIn && <Navigate to="/dashboard" replace={true} />} */}

      {showAlert && (
          <div className="absolute flex w-fit h-fit bg-red-500 top-2/5 left-2/5 rounded-2xl">
            <div className="w-80 p-4 min-h-fit">
              <p className="text-lg font-bold text-white">Alert Message</p>
              <p className="text-sm text-white">{errorMessage}</p>
              <button onClick={() => setShowAlert(false)} className="ml-60 mt-5 border border-white text-white w-10 h-fit rounded-md text-sm hover:cursor-pointer hover:bg-green-400  duration-500 ease-in-out">OK</button>
            </div>
          </div>
        )}

      <div className="flex justify-center items-center h-screen bg-emerald-950">
        <div className="w-11/12 sm:w-3/4 md:w-2/5 h-7/12 bg-transparent border rounded-xl border-white text-white flex items-center flex-col p-2">
          <div className="h-fit text-center text-2xl font-bold">Register</div>
          <form className="flex flex-col mt-2.5 h-3/4 min-w-11/12 p-2.5">
            <label className="font-semibold">Email *</label>
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              className="border rounded-md pl-1 text-xs h-10 border-gray-500 mt-2 hover:border-white focus:border-gray-500 focus:outline-none focus:ring-0"
            />
            <label className="font-semibold mt-2">Password *</label>
            <input
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              className="border rounded-md pl-1 text-xs h-10 border-gray-500 mt-2 hover:border-white focus:border-gray-500 focus:outline-none focus:ring-0"
            />
            <label className="font-semibold mt-2">Confirm Password *</label>
            <input
              type="password"
              placeholder="Confirm your password..."
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
              className="border rounded-md pl-1 text-xs h-10 border-gray-500 mt-2 hover:border-white focus:border-gray-500 focus:outline-none focus:ring-0"
            />
            <button className="border rounded-md border-gray-500 mt-4 h-7 hover:bg-green-500 hover:border-green-500 cursor-pointer duration-500 ease-in-out ani" onClick={onSubmit}>
              Register
            </button>
          </form>
          <hr className="w-11/12 mb-2 mt-2" />
          <div>
            <label>Already have an account ?</label>
            <button
              className="hover:cursor-pointer hover:text-green-500 duration-500 ease-in-out ml-1"
              onClick={loginNav}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
