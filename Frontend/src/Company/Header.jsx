import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContexts";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "../firebase/auth";
import { NavLink } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";


const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [companyData, setCompanyData] = useState('');

  useEffect(() => {
  const fetchForms = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "companies", user.uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        console.log(snapshot.data());
        setCompanyData(snapshot.data());
      }

    } catch (err) {
      console.error("Error fetching forms:", err);
    }
  };

  fetchForms();
}, []);

  if (!currentUser) {
    navigate("/login");
  }
  return (
    <div className="flex relative pb-2 bg-emerald-950">
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="w-24 flex-none flex justify-center items-center p-2.5 font-bold text-white">
        {companyData.companyName}
      </div>
      <div className="w-5/6 flex-1 flex justify-center items-center p-2.5 gap-2.5 sm:gap-10">
        <NavLink to="/dashboard">
          {({ isActive }) => (
            <div
              className={`group relative sm:text-lg px-2 py-1 transition-all duration-300
                ${isActive ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              Dashboard
              <span
                className="absolute left-0 bottom-0 h-0.5 bg-white w-0 transition-all duration-300 group-hover:w-full"
              ></span>
            </div>
          )}
        </NavLink>

        <NavLink to="/create-form">
          {({ isActive }) => (
            <div
              className={`group relative sm:text-lg px-2 py-1 transition-all duration-300
                ${isActive ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              Create Form
              <span
                className="absolute left-0 bottom-0 h-0.5 bg-white w-0 transition-all duration-300 group-hover:w-full"
              ></span>
            </div>
          )}
        </NavLink>
      </div>
      <div className="w-24 p-2.5 flex-none items-center flex justify-center">
        <button
          className="signOut w-full h-9/12 border rounded-md px-1 border-red-400 bg-red-400 text-white font-semibold hover:cursor-pointer hover:bg-red-500 flex items-center justify-center"
          onClick={() => {
            doSignOut().then(() => {
              navigate("/login");
            });
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Header;
