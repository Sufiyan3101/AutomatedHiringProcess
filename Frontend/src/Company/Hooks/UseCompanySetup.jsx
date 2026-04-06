// useCompanySetup.js
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

// useCompanySetup.js
const useCompanySetup = () => {
  // null  = not checked yet (show spinner)
  // true  = checked, has details
  // false = checked, no details
  const [hasDetails, setHasDetails] = useState(null); // ← null instead of false

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setHasDetails(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "companies", user.uid));
        if (snap.exists() && snap.data()?.companyName) {
          setHasDetails(true);
        } else {
          setHasDetails(false);
        }
      } catch (err) {
        setHasDetails(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // null = still loading, true/false = done
  return { loading: hasDetails === null, hasDetails };
};

export default useCompanySetup;