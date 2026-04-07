import { useEffect, useState } from "react";
import Header from "./Header";
import { db, auth } from "../firebase/firebase"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import CompanyDetails from "./CompanyDetails";
import useCompanySetup from "./Hooks/UseCompanySetup";

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const navigate = useNavigate();
  const { setUpLoading: companyLoading, hasDetails } = useCompanySetup();

 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.log("No user logged in");
      setLoading(false);
      return;
    }

    try {
      const formsRef = collection(db, "companies", user.uid, "forms");
      const q = query(formsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      let totalApplicants = 0;
      const data = [];

      for (const docSnap of snapshot.docs) {
        const formData = docSnap.data();
        const now = new Date();

        // ── Status ──
        let status = "Inactive";
        const start = formData.startDate?.toDate?.() ?? null;
        const end = formData.endDate?.toDate?.() ?? null;

        if (start && end) {
          if (now < start) status = "Upcoming";
          else if (now > end) status = "Expired";
          else status = "Active";
        }

        // ── Per-form applicant count ──
        const applicationsRef = collection(
          db,
          "companies", user.uid,
          "forms", docSnap.id,
          "applications"
        );
        const appSnapshot = await getDocs(applicationsRef);
        const formApplicantCount = appSnapshot.size;
        totalApplicants += formApplicantCount;

        data.push({
          id: docSnap.id,
          ...formData,
          status,
          applicantCount: formApplicantCount, // ← per form
        });
      }

      setForms(data);

    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);

  if (companyLoading) {
  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

if (!hasDetails) {
  return <CompanyDetails onComplete={() => window.location.reload()} />;
}

  const handleDelete = async (formId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this form?",
    );
    if (!confirmed) return;

    try {
      const user = auth.currentUser;

      const applicationsRef = collection(
        db,
        "companies",
        user.uid,
        "forms",
        formId,
        "applications",
      );

      const snapshot = await getDocs(applicationsRef);

      const deleteApps = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));

      await Promise.all(deleteApps);

      await deleteDoc(doc(db, "companies", user.uid, "forms", formId));

      setForms((prev) => prev.filter((f) => f.id !== formId));
    } catch (err) {
      console.error("Error deleting form:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-emerald-950">
      <Header />
      <div className="bg-emerald-950 flex-1 p-6">
        <h1 className="text-white text-xl font-bold mb-2">My Forms</h1>

        {/* Loading */}
        {loading && (
          <p className="text-emerald-400 text-lg flex justify-center items-center h-11/12">
            Loading forms...
          </p>
        )}

        {/* Empty */}
        {!loading && forms.length === 0 && (
          <p className="text-emerald-400 text-sm">No forms found.</p>
        )}

        {/* Forms list */}
        {!loading && forms.length > 0 && (
          <div className="flex flex-col gap-3 flex-1 justify-center sm-px-2 py-6 overflow-y-auto">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-emerald-900 border border-emerald-700 rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-semibold text-sm">
                      {form.title || "Untitled Form"}
                    </h2>
                    <p className="text-emerald-400 text-xs mt-1">
                      {form.fields?.length || 0} questions · {form.status}
                    </p>
                    <p className="text-emerald-400 text-xs mt-1">
                      Total Applicant : {form.applicantCount ?? 0}
                    </p>
                  </div>

                  {/* Desktop buttons */}
                  <div className="hidden sm:flex gap-5">
                    <button
                      onClick={() => navigate(`/form-detail/${form.id}`)}
                      className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      View Applicants
                    </button>

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/apply/${form.id}`;
                        navigator.clipboard.writeText(url);
                        alert("Link copied!\n" + url);
                      }}
                      className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      Copy Link
                    </button>

                    <button
                      onClick={() => navigate(`/edit-form/${form.id}`)}
                      className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(form.id)}
                      className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Mobile dropdown */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === form.id ? null : form.id)
                      }
                      className="text-white text-lg px-2"
                    >
                      ⋮
                    </button>

                    {menuOpenId === form.id && (
                      <div className="absolute right-0 mt-2 p-1 w-40 bg-emerald-800 border border-emerald-600 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => navigate(`/form-detail/${form.id}`)}
                          className="rounded-lg block w-full text-left px-4 py-2 text-sm text-white hover:bg-emerald-700"
                        >
                          View Applicants
                        </button>

                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/apply/${form.id}`;
                            navigator.clipboard.writeText(url);
                          }}
                          className="rounded-lg block w-full text-left px-4 py-2 text-sm text-white hover:bg-emerald-700"
                        >
                          Copy Link
                        </button>

                        <button
                          onClick={() => navigate(`/edit-form/${form.id}`)}
                          className="rounded-lg block w-full text-left px-4 py-2 text-sm text-white hover:bg-emerald-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(form.id)}
                          className="rounded-lg block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
