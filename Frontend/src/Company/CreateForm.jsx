import { useState, useRef } from "react";
import Header from "./Header";
import { db, auth } from "../firebase/firebase"; // adjust path as needed
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

// ─── FIELD TYPE DEFINITIONS ───────────────────────────────────────────────────
const FIELD_TYPES = {
  short_text: { label: "Short answer", icon: "─", desc: "Single line text" },
  long_text: { label: "Paragraph", icon: "≡", desc: "Multi-line text" },
  multiple_choice: {
    label: "Multiple choice",
    icon: "◉",
    desc: "Pick one option",
  },
  checkbox: { label: "Checkboxes", icon: "☑", desc: "Pick many options" },
  dropdown: { label: "Dropdown", icon: "▾", desc: "Select from list" },
  file_upload: { label: "File upload", icon: "↑", desc: "Upload a file" },
  date: { label: "Date", icon: "▦", desc: "Date picker" },
  number: { label: "Number", icon: "#", desc: "Numeric input" },
  email: { label: "Email", icon: "@", desc: "Email address" },
  phone: { label: "Phone", icon: "☏", desc: "Phone number" },
  yes_no: { label: "Yes / No", icon: "⇌", desc: "Boolean choice" },
};

// ─── GENERATE ID ──────────────────────────────────────────────────────────────
const uid = () =>
  `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── OPTION LIST EDITOR ───────────────────────────────────────────────────────
const OptionEditor = ({ options, onChange }) => {
  const addOption = () =>
    onChange([...options, `Option ${options.length + 1}`]);
  const removeOption = (i) => onChange(options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) =>
    onChange(options.map((o, idx) => (idx === i ? val : o)));

  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="w-4 h-4 rounded-full border-2 border-gray-400 shrink-0" />
          <input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="flex-1 border-b border-transparent hover:border-gray-300 focus:border-emerald-500 outline-none bg-transparent text-sm text-gray-800 pb-0.5 transition-colors"
            placeholder={`Option ${i + 1}`}
          />
          {options.length > 1 && (
            <button
              onClick={() => removeOption(i)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addOption}
        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 mt-1 font-medium"
      >
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
        Add option
      </button>
    </div>
  );
};

const CheckboxOptionEditor = ({ options, onChange }) => {
  const addOption = () =>
    onChange([...options, `Option ${options.length + 1}`]);
  const removeOption = (i) => onChange(options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) =>
    onChange(options.map((o, idx) => (idx === i ? val : o)));

  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="w-4 h-4 rounded border-2 border-gray-400 shrink-0" />
          <input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="flex-1 border-b border-transparent hover:border-gray-300 focus:border-emerald-500 outline-none bg-transparent text-sm text-gray-800 pb-0.5 transition-colors"
            placeholder={`Option ${i + 1}`}
          />
          {options.length > 1 && (
            <button
              onClick={() => removeOption(i)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addOption}
        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 mt-1 font-medium"
      >
        <div className="w-4 h-4 rounded border-2 border-gray-300 shrink-0" />
        Add option
      </button>
    </div>
  );
};

// ─── FIELD PREVIEW (inside card) ─────────────────────────────────────────────
const FieldPreview = ({ field }) => {
  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "number":
      return (
        <div className="mt-3 border-b border-gray-300 pb-1 text-sm text-gray-400 italic">
          {field.type === "short_text"
            ? "Short-answer text"
            : field.type === "email"
              ? "Email address"
              : field.type === "phone"
                ? "Phone number"
                : "Number"}
        </div>
      );
    case "long_text":
      return (
        <div className="mt-3 border-b border-gray-300 pb-4 text-sm text-gray-400 italic">
          Long-answer text
        </div>
      );
    case "multiple_choice":
      return (
        <OptionEditor
          options={field.options || ["Option 1"]}
          onChange={() => {}}
        />
      );
    case "checkbox":
      return (
        <CheckboxOptionEditor
          options={field.options || ["Option 1"]}
          onChange={() => {}}
        />
      );
    case "dropdown":
      return (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 border-b border-gray-300 pb-1">
            <span className="flex-1 italic">Choose</span>
            <span className="text-gray-400">▾</span>
          </div>
        </div>
      );
    case "file_upload":
      return (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <div className="border border-gray-300 rounded px-3 py-1.5 text-emerald-600 text-xs font-medium">
            Add file
          </div>
        </div>
      );
    case "date":
      return (
        <div className="mt-3 border-b border-gray-300 pb-1 text-sm text-gray-400 italic flex items-center gap-1">
          <span>MM / DD / YYYY</span>
          <span className="ml-auto text-gray-400">▦</span>
        </div>
      );
    case "yes_no":
      return (
        <div className="mt-3 space-y-2">
          {["Yes", "No"].map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
              <span className="text-sm text-gray-700">{opt}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

// ─── SINGLE FIELD CARD ────────────────────────────────────────────────────────
const FieldCard = ({
  field,
  isActive,
  onClick,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const updateLabel = (val) => onUpdate({ ...field, label: val });
  const updateRequired = () =>
    onUpdate({ ...field, required: !field.required });
  const updateOptions = (options) => onUpdate({ ...field, options });
  const updateType = (type) => {
    const needsOptions = ["multiple_choice", "checkbox", "dropdown"].includes(
      type,
    );
    onUpdate({
      ...field,
      type,
      options: needsOptions
        ? field.options?.length
          ? field.options
          : ["Option 1", "Option 2"]
        : undefined,
    });
  };

  return (
    // At the top of FieldCard return, replace the outer div with:
    <div
      onClick={() => !field.locked && onClick()}
      className={`bg-white rounded-lg shadow-sm transition-all duration-200 mb-3
    ${
      field.locked
        ? "cursor-default border-l-4 border-l-emerald-600" // always highlighted, not clickable
        : "cursor-pointer hover:border-l-4 hover:border-l-emerald-300 hover:shadow"
    }
    ${isActive && !field.locked ? "border-l-4 border-l-emerald-600 shadow-md ring-1 ring-emerald-100" : ""}
  `}
    >
      <div className="p-5">
        {field.locked ? (
          // ── LOCKED FIELD — always shows, can't be edited or deleted ──
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-800">
                  {field.label}
                </p>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                Required · Locked
              </span>
            </div>
            <div className="mt-3 border-b border-gray-300 pb-1 text-sm text-gray-400 italic">
              Email address
            </div>
          </div>
        ) : isActive ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                autoFocus
                value={field.label}
                onChange={(e) => updateLabel(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Question"
                className="flex-1 text-base font-medium text-gray-800 bg-gray-50 border-b-2 border-emerald-500 outline-none px-2 py-1.5 rounded-t"
              />
              <select
                value={field.type}
                onChange={(e) => updateType(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none focus:border-emerald-400 bg-white cursor-pointer"
              >
                {Object.entries(FIELD_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {field.type === "multiple_choice" && (
              <OptionEditor
                options={field.options || ["Option 1"]}
                onChange={updateOptions}
              />
            )}
            {field.type === "checkbox" && (
              <CheckboxOptionEditor
                options={field.options || ["Option 1"]}
                onChange={updateOptions}
              />
            )}
            {field.type === "dropdown" && (
              <OptionEditor
                options={field.options || ["Option 1"]}
                onChange={updateOptions}
              />
            )}
            {!["multiple_choice", "checkbox", "dropdown"].includes(
              field.type,
            ) && <FieldPreview field={field} />}

            <div
              className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onDuplicate}
                className="text-gray-400 hover:text-emerald-600 transition-colors hover:cursor-pointer"
                title="Duplicate"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 transition-colors hover:cursor-pointer"
                title="Delete"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-200" />
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <span>Required</span>
                <button
                  onClick={updateRequired}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 hover:cursor-pointer
                    ${field.required ? "bg-emerald-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${field.required ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </label>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-1">
              <p className="text-sm font-medium text-gray-800">
                {field.label || (
                  <span className="text-gray-400 italic">
                    Untitled Question
                  </span>
                )}
              </p>
              {field.required && (
                <span className="text-red-500 text-sm ml-0.5">*</span>
              )}
            </div>
            <FieldPreview field={field} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ADD QUESTION BUTTON WITH DROPDOWN ───────────────────────────────────────
const AddQuestionButton = ({ onAdd }) => {
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => onAdd("short_text")}
        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700
          text-white text-sm font-semibold rounded-full shadow-md transition-all
          hover:cursor-pointer hover:shadow-lg active:scale-95"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Question
      </button>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const CreateForm = () => {
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [fields, setFields] = useState([
    {
      id: "field_email_locked",
      type: "email",
      label: "Email Address",
      required: true,
      locked: true,
    },
  ]);
  const [activeId, setActiveId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef(null);

  // const [jobDocument, setJobDocument] = useState(null); // the File object
  // const [uploadProgress, setUploadProgress] = useState(0); // 0-100
  // const [uploading, setUploading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // const uploadDocument = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append(
  //     "upload_preset",
  //     import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  //   );
  //   formData.append("folder", "job-documents");

  //   // raw → for PDFs and docs (not images)
  //   const res = await fetch(
  //     `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
  //     { method: "POST", body: formData },
  //   );

  //   if (!res.ok) throw new Error("Upload failed");

  //   const data = await res.json();
  //   console.log("Uploaded:", data.secure_url);
  //   return data.secure_url + "?fl_attachment=true";
  // };

  const addField = (type) => {
    const needsOptions = ["multiple_choice", "checkbox", "dropdown"].includes(
      type,
    );
    const newField = {
      id: uid(),
      type,
      label: "",
      required: false,
      ...(needsOptions && { options: ["Option 1", "Option 2"] }),
    };
    setFields((prev) => [...prev, newField]);
    setActiveId(newField.id);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const updateField = (updated) =>
    setFields((prev) =>
      prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)),
    );

  const duplicateField = (id) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    const copy = {
      ...field,
      id: uid(),
      label: field.label ? `${field.label} (copy)` : "",
    };
    const idx = fields.findIndex((f) => f.id === id);
    const next = [...fields];
    next.splice(idx + 1, 0, copy);
    setFields(next);
    setActiveId(copy.id);
  };

  const deleteField = (id) => {
    const field = fields.find((f) => f.id === id);
    if (field?.locked) return; // guard
    setFields((prev) => prev.filter((f) => f.id !== id));
    setActiveId(null);
  };

  // const cleanObject = (obj) => {
  //   if (Array.isArray(obj)) {
  //     return obj
  //       .filter((item) => item !== undefined)
  //       .map((item) => cleanObject(item));
  //   }

  //   if (obj && typeof obj === "object") {
  //     return Object.fromEntries(
  //       Object.entries(obj)
  //         .filter(([_, v]) => v !== undefined)
  //         .map(([k, v]) => [k, cleanObject(v)]),
  //     );
  //   }

  //   return obj;
  // };

  // const cleanedFields = cleanObject(fields);

  const handleSave = async () => {
    if (!formTitle.trim()) {
      alert("Please add a form title");
      return;
    }
    if (fields.length === 0) {
      alert("Please add at least one question");
      return;
    }
    if (!startDate) {
      alert("Please set a start date");
      return;
    }
    if (!endDate) {
      alert("Please set an end date");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      alert("End date must be after start date");
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Upload to Cloudinary first if file selected
      // let documentURL = null;
      // let documentName = null;

      // if (jobDocument) {
      //   setUploading(true);
      //   documentURL = await uploadDocument(jobDocument);
      //   documentName = jobDocument.name;
      //   setUploading(false);
      // }

      // Save form to Firestore with the Cloudinary URL
      const formsRef = collection(db, "companies", user.uid, "forms");

      const docRef = await addDoc(formsRef, {
        title: formTitle,
        description: formDesc,
        fields: fields,
        status: "active",
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        createdAt: serverTimestamp(),
        companyId: user.uid,
      });
      console.log("Form saved:", docRef.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-emerald-950">
      <Header />

      {/* ── TOP ACTION BAR ── */}
      <div className="bg-emerald-950 border-b border-emerald-900 px-6 py-2 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <p className="text-sm text-white font-medium truncate max-w-xs">
          {formTitle || "Untitled Form"}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all
    ${
      saved
        ? "bg-green-100 text-green-700 border border-green-200"
        : "bg-emerald-600 hover:bg-emerald-700 text-white"
    }
    ${saving ? "opacity-60 cursor-not-allowed" : "hover:cursor-pointer"}`}
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Form"}
        </button>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-1 justify-center px-4 py-6 max-w-3xl mx-auto w-full">
        <div className="flex-1 space-y-3">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm border-t-8 border-emerald-600 overflow-hidden">
            <div className="p-6">
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter Title"
                className="w-full text-3xl font-normal text-gray-800 outline-none border-b-2
                  border-transparent focus:border-emerald-600 pb-1 mb-3 bg-transparent transition-colors"
              />
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Form description (optional)"
                className="w-full text-sm text-gray-500 outline-none border-b border-transparent
                  focus:border-emerald-600 pb-1 bg-transparent transition-colors"
              />
            </div>
          </div>

          {/* ── DOCUMENT + DATES CARD ── */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-700">
              Form Settings
            </h3>

            {/* Document Upload */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Job Description Document
                <span className="text-gray-400 font-normal ml-1">
                  (Optional)
                </span>
              </label>

              {!jobDocument ? (
                <label
                  className="flex flex-col items-center justify-center border-2 border-dashed
                  border-gray-200 rounded-lg p-6 cursor-pointer hover:border-emerald-400
                  hover:bg-emerald-50 transition-all"
                >
                  <svg
                    className="w-8 h-8 text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    <span className="text-emerald-600 font-medium">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        alert("File must be under 10MB");
                        return;
                      }
                      setJobDocument(file);
                    }}
                  />
                </label>
              ) : (
                <div
                  className="flex items-center justify-between bg-emerald-50 border
                    border-emerald-200 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-emerald-800 font-medium">
                      {jobDocument.name}
                    </span>
                    <span className="text-xs text-emerald-500">
                      ({(jobDocument.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setJobDocument(null);
                      setUploadProgress(0);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {uploading && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div> */}

            {/* Start + End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]} // can't pick past dates
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm
                  text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500
                  focus:border-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm
                  text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500
                  focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Visual reminder of what expiry does */}
            {endDate && (
              <div
                className="flex items-start gap-2 bg-amber-50 border border-amber-200
                  rounded-lg px-3 py-2.5 text-xs text-amber-700"
              >
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
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
                Form will automatically close on{" "}
                {new Date(endDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . AI matching will run after this date.
              </div>
            )}
          </div>

          {/* Field Cards */}
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              isActive={activeId === field.id}
              onClick={() => setActiveId(field.id)}
              onUpdate={updateField}
              onDuplicate={() => duplicateField(field.id)}
              onDelete={() => deleteField(field.id)}
            />
          ))}

          {/* Empty state */}
          {fields.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-10 flex flex-col justify-center items-center text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm font-medium text-gray-500">
                No questions yet
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Click the button below to add your first question
              </p>
            </div>
          )}

          {/* ── CENTERED ADD QUESTION BUTTON ── */}
          <AddQuestionButton onAdd={addField} />

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default CreateForm;
