import { useState } from "react";
import { db, auth } from "../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const EMPLOYEE_RANGES = [
  "1 - 10",
  "11 - 50",
  "51 - 200",
  "201 - 500",
  "501 - 1000",
  "1000+",
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Marketing & Advertising",
  "Consulting",
  "Real Estate",
  "Logistics",
  "Other",
];

const CompanyDetails = ({ onComplete }) => {
  const [form, setForm] = useState({
    companyName: "",
    address: "",
    city: "",
    country: "",
    industry: "",
    employees: "",
    website: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.industry) e.industry = "Please select an industry";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Save to companies/{userId} — same doc used for forms subcollection
      await setDoc(
        doc(db, "companies", user.uid),
        {
          companyName: form.companyName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          industry: form.industry,
          employees: form.employees || null,
          website: form.website.trim() || null,
          description: form.description.trim() || null,
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      onComplete(); // tell parent to hide this screen
    } catch (err) {
      console.error("Error saving company details:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">Set up your company</h1>
          <p className="text-emerald-400 text-sm mt-2">
            Tell us a bit about your company to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">

          {/* Company Name */}
          <Field label="Company Name" required error={errors.companyName}>
            <input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Acme Corp"
              className={input(errors.companyName)}
            />
          </Field>

          {/* Industry */}
          <Field label="Industry" required error={errors.industry}>
            <select
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              className={input(errors.industry)}
            >
              <option value="" disabled>Select your industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </Field>

          {/* Address */}
          <Field label="Office Address" required error={errors.address}>
            <input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Main Street"
              className={input(errors.address)}
            />
          </Field>

          {/* City + Country */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" required error={errors.city}>
              <input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Mumbai"
                className={input(errors.city)}
              />
            </Field>
            <Field label="Country" required error={errors.country}>
              <input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="India"
                className={input(errors.country)}
              />
            </Field>
          </div>

          {/* Employees — optional */}
          <Field label="Number of Employees" hint="Optional">
            <select
              value={form.employees}
              onChange={(e) => update("employees", e.target.value)}
              className={input()}
            >
              <option value="">Select range</option>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          {/* Website — optional */}
          <Field label="Website" hint="Optional">
            <input
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://yourcompany.com"
              className={input()}
            />
          </Field>

          {/* Description — optional */}
          <Field label="About the Company" hint="Optional">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief description of what your company does..."
              rows={3}
              className={`${input()} resize-none`}
            />
          </Field>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all mt-2
              ${saving
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
              }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save & Continue →"
            )}
          </button>
        </div>

        <p className="text-center text-emerald-500 text-xs mt-4">
          You can update these details later from your settings.
        </p>
      </div>
    </div>
  );
};

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, error, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const input = (error) =>
  `w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all
   focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white
   ${error ? "border-red-400" : "border-gray-200 hover:border-gray-300"}`;

export default CompanyDetails;