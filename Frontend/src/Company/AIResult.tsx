import React, { useEffect, useState } from "react";
import { db, auth } from '../firebase/firebase'
import { useParams } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore'
import Header from "./Header";



const AIResult = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formId } = useParams();

  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (!formId) return;

        const resultRef = doc(
          db,
          "companies",
          user.uid,
          "forms",
          formId
        );

        const snapshot = await getDoc(resultRef);
        if (snapshot.exists()) {
          setResults({ id: snapshot.id, ...snapshot.data() })
        }
        else {
          console.log("Result Not Found");

        }



      } catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false);
      }
    });

    return () => unSubscribe();

  }, [formId]);

  // const result = results?.aiResults;
  for (const res of results?.aiResults || []) {
    console.log(res.score);
    console.log(res.applicantId);
    console.log(res.email);
  }


  return (
    <div className="flex flex-col h-screen overflow-hidded">
      <Header />

      <div className="bg-emerald-950 flex-1 flex items-center flex-col p-6 thin-scrollbar">
        <h1 className="text-white text-xl font-bold mt-4 mb-4">
          Ranking
        </h1>

        {/* Loading */}
        {loading && (
          <p className="text-emerald-400 text-lg">
            Loading AI Results...
          </p>
        )}

        {/* Empty */}
        {!loading && !results?.aiResults?.length && (
          <p className="text-emerald-400 text-sm">
            No AI results found.
          </p>
        )}

        {!loading && results?.aiResults && (
          <div className="flex w-full min-[640px]:w-3/5 flex-col gap-3 mt-2 thin-scrollbar">

            {results.aiResults.map((res: any) => (
              <div
                key={res.applicantId}
                className="bg-emerald-900 border border-emerald-700 rounded-xl px-5 py-4"
              >

                <p className="text-white text-sm">
                  <span className="text-xs text-gray-300">Applicant Id</span> : {res.applicantId ?? "—"}
                </p>
                <hr className="mt-2 w-full text-emerald-400" />

                <div className="mt-2">

                  <p className="text-white text-sm">
                    <span className="text-xs text-gray-300">Email</span> : {res.email ?? "—"}
                  </p>
                  <hr className="mt-2 w-full text-emerald-400" />
                </div>

                <div className="mt-2">

                  <p className="text-white text-sm">
                    <span className="text-xs text-gray-300">Score</span> : {res.score ?? "—"}
                  </p>
                  <hr className="mt-2 w-full text-emerald-400" />
                </div>

                <div className="mt-2">

                  <p className="text-white text-sm">
                    <span className="text-xs text-gray-300">Reason</span> : {res.reason ?? "—"}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  )
}

export default AIResult