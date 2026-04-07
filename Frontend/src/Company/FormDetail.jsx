import { useEffect, useState } from "react";
import Header from "./Header";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";

const FormDetail = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [menuOpenId, setMenuOpenId] = useState(null);
  const { formId } = useParams();

  let allApplicants = [];

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // ── Fetch only this form's applicants ──
      const applicationsRef = collection(
        db,
        "companies", user.uid,
        "forms", formId,         // ← specific form from URL
        "applications"
      );

      const q = query(applicationsRef, orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        formId,
        ...doc.data(),
      }));

      setApplicants(data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, [formId]); // ← re-fetch if formId changes

  console.log("All applicants:", applicants);

  const handleDelete = async (formId, applicantId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this applicant data ?",
    );
    if (!confirmed) return;

    try {
      const user = auth.currentUser;
      await deleteDoc(
        doc(
          db,
          "companies",
          user.uid,
          "forms",
          formId,
          "applications",
          applicantId,
        ),
      );
      setApplicants((prev) => prev.filter((f) => f.id !== applicantId));
    } catch (err) {
      console.error("Error deleting form:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-emerald-950">
      <Header />
      <div className="bg-emerald-950 h-screen p-6">
        <h1 className="text-white text-xl font-bold mb-2">Applicant List</h1>

        {/* Loading */}
        {loading && (
          <p className="text-emerald-400 text-lg flex justify-center items-center h-11/12">
            Loading Applicant Responses...
          </p>
        )}

        {/* Empty */}
        {!loading && applicants.length === 0 && (
          <p className="text-emerald-400 text-sm">No response found.</p>
        )}

        {/* Forms list */}
        {!loading && applicants.length > 0 && (
          <div className="flex flex-col gap-3 h-screen sm:px-4 py-6 overflow-y-auto">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-emerald-900 border border-emerald-700 rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-semibold text-sm">
                      {applicant.applicantEmail || "Untitled Form"}
                    </h2>
                  </div>

                  {/* Copy apply link */}
                  <div className="hidden sm:flex gap-5">
                    <button
                      onClick={() =>
                        navigate(
                          `/form-detail/${applicant.formId}/applicant-detail/${applicant.id}`,
                        )
                      }
                      className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600
                      text-white rounded-full transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(applicant.formId, applicant.id)
                      }
                      className="text-xs px-3 py-1.5 bg-red-700 hover:bg-red-600
                      text-white rounded-full transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="sm:hidden relative">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === applicant.id ? null : applicant.id)
                      }
                      className="text-white text-lg px-2"
                    >
                      ⋮
                    </button>

                    {menuOpenId === applicant.id && (
                      <div className="absolute right-0 mt-2 p-1 w-40 bg-emerald-800 border border-emerald-600 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() =>
                            navigate(
                              `/form-detail/${applicant.formId}/applicant-detail/${applicant.id}`,
                            )
                          }
                          className="rounded-lg block w-full text-left px-4 py-2 text-sm text-white hover:bg-emerald-700"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(applicant.formId, applicant.id)
                          }
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

export default FormDetail;
