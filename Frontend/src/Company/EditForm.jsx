import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import { db, auth } from "../firebase/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";

// ─── FIELD TYPE DEFINITIONS ───────────────────────────────────────────────────
const FIELD_TYPES = {
  short_text: { label: "Short answer", icon: "─" },
  long_text: { label: "Paragraph", icon: "≡" },
  multiple_choice: { label: "Multiple choice", icon: "◉" },
  checkbox: { label: "Checkboxes", icon: "☑" },
  dropdown: { label: "Dropdown", icon: "▾" },
  file_upload: { label: "File upload", icon: "↑" },
  date: { label: "Date", icon: "▦" },
  number: { label: "Number", icon: "#" },
  email: { label: "Email", icon: "@" },
  phone: { label: "Phone", icon: "☏" },
  yes_no: { label: "Yes / No", icon: "⇌" },
};

const uid = () =>
  `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── OPTION EDITOR ────────────────────────────────────────────────────────────
const OptionEditor = ({ options, onChange, isCheckbox = false }) => {
  const addOption = () =>
    onChange([...options, `Option ${options.length + 1}`]);
  const removeOption = (i) => onChange(options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) =>
    onChange(options.map((o, idx) => (idx === i ? val : o)));

  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div
            className={`w-4 h-4 border-2 border-gray-400 shrink-0 ${
              isCheckbox ? "rounded" : "rounded-full"
            }`}
          />
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
        <div
          className={`w-4 h-4 border-2 border-gray-300 shrink-0 ${
            isCheckbox ? "rounded" : "rounded-full"
          }`}
        />
        Add option
      </button>
    </div>
  );
};

// ─── FIELD PREVIEW ────────────────────────────────────────────────────────────
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
        <OptionEditor
          options={field.options || ["Option 1"]}
          onChange={() => {}}
          isCheckbox
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
        <div className="mt-3">
          <div className="border border-gray-300 rounded px-3 py-1.5 text-emerald-600 text-xs font-medium inline-block">
            Add file
          </div>
        </div>
      );
    case "date":
      return (
        <div className="mt-3 border-b border-gray-300 pb-1 text-sm text-gray-400 italic flex items-center">
          <span>MM / DD / YYYY</span>
          <span className="ml-auto">▦</span>
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

// ─── FIELD CARD ───────────────────────────────────────────────────────────────
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
            {/* Label + Type row */}
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

            {/* Options editor */}
            {field.type === "multiple_choice" && (
              <OptionEditor
                options={field.options || ["Option 1"]}
                onChange={updateOptions}
              />
            )}
            {field.type === "checkbox" && (
              <OptionEditor
                options={field.options || ["Option 1"]}
                onChange={updateOptions}
                isCheckbox
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

            {/* Bottom toolbar */}
            <div
              className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Duplicate */}
              <button
                onClick={onDuplicate}
                className="text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
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

              {/* Delete */}
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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

              {/* Required toggle */}
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <span>Required</span>
                <button
                  onClick={updateRequired}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
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
          // View mode
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

// ─── ADD QUESTION BUTTON ──────────────────────────────────────────────────────
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

// ─── MAIN EDIT FORM ───────────────────────────────────────────────────────────
const EditForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [fields, setFields] = useState([
    {
      id: "field_email_locked",
      type: "email",
      label: "Email Address",
      required: true,
      locked: true, // custom flag so we never let it be deleted
    },
  ]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ── Load existing form data ──
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "companies", user.uid, "forms", formId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormTitle(data.title || "");
          setFormDesc(data.description || "");
          setFields(data.fields || []);
        } else {
          alert("Form not found");
          navigate("/dashboard");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, navigate]);

  // ── Field operations ──
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
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));

  const duplicateField = (id) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    const copy = cleanObject({
      ...field,
      id: uid(),
      label: field.label ? `${field.label} (copy)` : "",
    });

    const idx = fields.findIndex((f) => f.id === id);
    const next = [...fields];
    next.splice(idx + 1, 0, copy);

    setFields(next);
    setActiveId(copy.id);
  };

  const deleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setActiveId(null);
  };

  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj
        .filter((item) => item !== undefined)
        .map((item) => cleanObject(item));
    }

    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, cleanObject(v)]),
      );
    }

    return obj;
  };

  // ── Save updates to Firestore ──
  const handleUpdate = async () => {
    if (!formTitle.trim()) {
      alert("Please add a form title");
      return;
    }
    if (fields.length === 0) {
      alert("Add at least one question");
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

      const docRef = doc(db, "companies", user.uid, "forms", formId);

      const cleanedFields = cleanObject(fields);

      await updateDoc(docRef, {
        title: formTitle,
        description: formDesc,
        fields: cleanedFields,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        updatedAt: serverTimestamp(),
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-emerald-950">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-emerald-400">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading form...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-emerald-950">
      <Header />

      {/* ── Top Bar ── */}
      <div className="bg-emerald-950 border-b border-emerald-900 px-6 py-2 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-white text-sm transition-colors cursor-pointer"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </button>
          <span className="text-emerald-700">/</span>
          <p className="text-sm text-white font-medium truncate max-w-xs">
            {formTitle || "Edit Form"}
          </p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer
            ${
              saved
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {saving ? "Updating..." : saved ? "✓ Updated!" : "Update Form"}
        </button>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 justify-center px-4 py-6 max-w-3xl mx-auto w-full">
        <div className="flex-1 space-y-3">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm border-t-8 border-emerald-600 overflow-hidden">
            <div className="p-6">
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Form Title"
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
            <div className="bg-white rounded-lg shadow-sm p-10 flex flex-col items-center text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm font-medium text-gray-500">
                No questions yet
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Click the button below to add your first question
              </p>
            </div>
          )}

          {/* Add Question Button */}
          <AddQuestionButton onAdd={addField} />

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default EditForm;
