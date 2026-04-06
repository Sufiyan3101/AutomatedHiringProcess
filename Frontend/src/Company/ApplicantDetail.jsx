import { useEffect, useState } from "react";
import Header from "./Header";
import { db, auth } from "../firebase/firebase";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

const ApplicantDetail = () => {
  const [applicants, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formId, applicantId } = useParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ── Fetch single applicant document ──
        const applicantRef = doc(
          db,
          "companies",
          user.uid,
          "forms",
          formId,
          "applications",
          applicantId,
        );

        const snapshot = await getDoc(applicantRef);

        if (snapshot.exists()) {
          setApplicant({ id: snapshot.id, ...snapshot.data() });
        } else {
          console.log("Applicant not found");
        }
      } catch (err) {
        console.error("Error fetching applicant:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [formId, applicantId]);
  console.log("applicant:", applicants);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="bg-emerald-950 flex-1 flex items-center flex-col p-6">
        <h1 className="text-white text-xl font-bold mb-4">Applicant Form Details</h1>

        {/* Loading */}
        {loading && (
          <p className="text-emerald-400 text-lg">
            Loading Applicant Responses...
          </p>
        )}

        {/* Empty */}
        {!loading && !applicants && (
          <p className="text-emerald-400 text-sm">No response found.</p>
        )}

        {/* Forms list */}
        {!loading && applicants && (
          <div className="flex w-full min-[480px]:w-3/4 min-[640px]:w-2/4 flex-col gap-3">
            <div className="bg-emerald-900 border border-emerald-700 rounded-xl px-5 py-4">
              <div className="mt-2">
                <p className="text-xs text-gray-300">Email</p>
                <p className="text-white text-sm">
                  {applicants.applicantEmail ?? "—"}
                </p>
                <hr className="mt-2 w-full text-emerald-400" />
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-300">Status</p>
                <p className="text-white text-sm">{applicants.status ?? "—"}</p>
                <hr className="mt-2 w-full text-emerald-400" />
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-300">Submitted At</p>
                <p className="text-white text-sm">
                  {applicants.submittedAt
                    ?.toDate?.()
                    .toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) ?? "—"}
                </p>
                <hr className="mt-2 w-full text-emerald-400" />
              </div>
            </div>
          </div>
        )}
        <h1 className="text-white text-xl font-bold mt-4 mb-4">Applicant Q/A</h1>
        <div className="flex w-full min-[480px]:w-3/4 min-[640px]:w-2/4 flex-col gap-3 mt-2">
          <div className="bg-emerald-900 border border-emerald-700 rounded-xl px-5 py-4">
            {!loading &&
              applicants &&
              Object.entries(applicants.applicantData || {}).map(
                ([key, field]) => (
                  <div key={key} className="mt-2">
                    <p className="text-xs text-gray-300">Q: {field.label}</p>
                    <p className="text-white text-sm">
                      A:{" "}
                      {Array.isArray(field.value)
                        ? field.value.join(", ")
                        : (field.value ?? "—")}
                    </p>
                    <hr className="mt-2 w-full text-emerald-400" />
                  </div>
                ),
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
