import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../src/firebase/firebase"; // adjust path
import EditForm from "./Company/EditForm";
import Dashboard from "./Company/Dashboard";
import CreateForm from "./Company/CreateForm";
import Apply from "./Company/Apply";
import FormDetail from "./Company/FormDetail";
import ApplicantDetail from "./Company/ApplicantDetail";
import Login from './Authentication/Login'
import Register from './Authentication/Register'


const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-950">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// ─── APP ──────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} /> 
      <Route path="/register" element={<Register />} /> 
      <Route path="/apply/:formId" element={<Apply />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />


      {/* Protected routes — must be logged in */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-form"
        element={
          <ProtectedRoute>
            <CreateForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-form/:formId"
        element={
          <ProtectedRoute>
            <EditForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/form-detail/:formId"
        element={
          <ProtectedRoute>
            <FormDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/form-detail/:formId/applicant-detail/:applicantId"
        element={
          <ProtectedRoute>
            <ApplicantDetail />
          </ProtectedRoute>
        }
      />

 
    </Routes>
  );
};

export default App;
