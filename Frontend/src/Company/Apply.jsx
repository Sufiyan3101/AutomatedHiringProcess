import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebase"; // adjust path if needed
import {
  collectionGroup,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const isExpired = (endDate) => {
  if (!endDate) return false;
  return endDate.toDate() < new Date();
};

const isNotStarted = (startDate) => {
  if (!startDate) return false;
  return startDate.toDate() > new Date();
};

// ─── FIELD RENDERER ───────────────────────────────────────────────────────────
// Renders each field dynamically based on its type
const FieldRenderer = ({ field, value, onChange, error }) => {
  const baseInput =
    "w-full bg-white border rounded-lg px-4 py-2.5 text-gray-800 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400";
  const errorBorder = error ? "border-red-400" : "border-gray-200";

  switch (field.type) {
    case "short_text":
      return (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          className={`${baseInput} ${errorBorder}`}
        />
      );

    case "long_text":
      return (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          rows={4}
          className={`${baseInput} ${errorBorder} resize-none`}
        />
      );

    case "email":
      return (
        <input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@example.com"
          className={`${baseInput} ${errorBorder}`}
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="+91 98765 43210"
          className={`${baseInput} ${errorBorder}`}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={`${baseInput} ${errorBorder}`}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${errorBorder}`}
        />
      );

    case "dropdown":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${errorBorder} cursor-pointer`}
        >
          <option value="" disabled>
            Select an option
          </option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "multiple_choice":
      return (
        <div className="space-y-2 mt-1">
          {(field.options || []).map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all
                ${
                  value === opt
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white hover:border-emerald-300 text-gray-700"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${value === opt ? "border-emerald-500" : "border-gray-300"}`}
              >
                {value === opt && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="hidden"
              />
              <span className="text-sm font-medium">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-2 mt-1">
          {(field.options || []).map((opt, i) => {
            const selected = Array.isArray(value) ? value : [];
            const isChecked = selected.includes(opt);
            return (
              <label
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-white hover:border-emerald-300 text-gray-700"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                    ${isChecked ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}
                >
                  {isChecked && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const next = isChecked
                      ? selected.filter((v) => v !== opt)
                      : [...selected, opt];
                    onChange(next);
                  }}
                  className="hidden"
                />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case "yes_no":
      return (
        <div className="flex gap-3 mt-1">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer
                ${
                  value === opt
                    ? "border-emerald-500 bg-emerald-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          className={`${baseInput} ${errorBorder}`}
        />
      );
  }
};

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
const SuccessScreen = ({ formTitle }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg
          className="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-gray-900 text-2xl font-bold mb-2">
        Application Submitted!
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed">
        Your application for{" "}
        <span className="font-semibold text-gray-700">"{formTitle}"</span> has
        been received. The HR team will review it and get back to you.
      </p>
      <div className="mt-6 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700">
        You can close this tab now.
      </div>
    </div>
  </div>
);

// ─── MAIN APPLY COMPONENT ─────────────────────────────────────────────────────
const Apply = () => {
  const { formId } = useParams();

  const [form, setForm] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { fieldId: value }
  const [errors, setErrors] = useState({}); // { fieldId: errorMsg }
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [companyData, setCompanyData] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
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

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const snapshot = await getDocs(collectionGroup(db, "forms"));
        const match = snapshot.docs.find((d) => d.id === formId);

        if (match) {
          const data = match.data();
          setForm({ id: match.id, ...data });
          const pathSegments = match.ref.path.split("/");
          setCompanyId(pathSegments[1]); // index 1 = companyId
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  // ── Handle answer change ──
  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: null }));
    }
  };

  // ── Validate all required fields ──
  const validate = () => {
    const newErrors = {};
    (form.fields || []).forEach((field) => {
      if (!field.required) return;
      const val = answers[field.id];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (isEmpty) {
        newErrors[field.id] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit application ──
  const handleSubmit = async () => {
    if (!validate()) {
      document
        .querySelector(".field-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const emailValue = answers["field_email_locked"];

      // ── Check for duplicate email in this form's applications ──
      const applicationsRef = collection(
        db,
        "companies",
        companyId,
        "forms",
        formId,
        "applications",
      );

      const duplicateCheck = await getDocs(
        query(applicationsRef, where("applicantEmail", "==", emailValue)),
      );

      if (!duplicateCheck.empty) {
        setErrors((prev) => ({
          ...prev,
          field_email_locked:
            "This email has already submitted an application for this form.",
        }));
        // Scroll to email field
        document
          .querySelector(".field-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        setSubmitting(false);
        return;
      }

      const formattedAnswers = {};

      (form.fields || []).forEach((field) => {
        formattedAnswers[field.id] = {
          label: field.label,
          value: answers[field.id] ?? null,
          type: field.type,
        };
      });

      await addDoc(applicationsRef, {
        applicantData: formattedAnswers,
        applicantEmail: emailValue, 
        status: "Application Submitted",
        submittedAt: serverTimestamp(),
        formId,
        companyId,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading form...</span>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-gray-800 text-xl font-bold mb-2">
            Form Not Found
          </h2>
          <p className="text-gray-400 text-sm">
            This link may be invalid or the form has been removed.
          </p>
        </div>
      </div>
    );
  }

  // ── Expired ──
  if (isExpired(form.endDate)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">⏰</p>
          <h2 className="text-gray-800 text-xl font-bold mb-2">
            Applications Closed
          </h2>
          <p className="text-gray-400 text-sm">
            The application period for <strong>"{form.title}"</strong> has
            ended.
          </p>
        </div>
      </div>
    );
  }

  // ── Not started yet ──
  if (isNotStarted(form.startDate)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">📅</p>
          <h2 className="text-gray-800 text-xl font-bold mb-2">Not Open Yet</h2>
          <p className="text-gray-400 text-sm">
            Applications for <strong>"{form.title}"</strong> open on{" "}
            {new Date(form.startDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        </div>
      </div>
    );
  }

  // ── Submitted success ──
  if (submitted) return <SuccessScreen formTitle={form.title} />;

  // ── Main form ──
  return (
    <>
        <div className="min-h-screen bg-emerald-950 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-xl shadow-sm border-t-8 border-emerald-600 overflow-hidden">
            <div className="p-7">
              <h1 className="text-xl font-bold text-gray-900">
                Title : {form.title}
              </h1>
              {form.description && (
                <p className="font-semibold text-sm ">
                  Description : {form.description}
                </p>
              )}
              <p className="text-sm font-semibold">Name : {companyData.companyName}</p>
              <p className="text-sm font-semibold">Address : {companyData.address}</p>
          <p className="text-sm font-semibold">City : {companyData.city}</p>
              {form.endDate && (
                <div
                  className="mt-4 inline-flex font-semibold items-center gap-1.5 text-xs text-amber-600
                bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Closes on{" "}
                  {new Date(form.endDate?.toDate?.() ?? null).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Required notice */}
          <p className="text-xs text-gray-400 px-1">
            Fields marked with <span className="text-red-500 font-bold">*</span>{" "}
            are required
          </p>

          {/* Question Cards */}
          {(form.fields || []).map((field, index) => (
            <div
              key={field.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              {/* Question label */}
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <span className="text-gray-400 mr-2 font-normal">
                  {index + 1}.
                </span>
                {field.label || "Untitled Question"}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Field input */}
              <FieldRenderer
                field={field}
                value={answers[field.id]}
                onChange={(val) => handleChange(field.id, val)}
                error={errors[field.id]}
              />

              {/* Error message */}
              {errors[field.id] && (
                <p className="field-error mt-2 text-xs text-red-500 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="pb-10">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all
              ${
                submitting
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              By submitting, your responses will be reviewed by the hiring team.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Apply;
