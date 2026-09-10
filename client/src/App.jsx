import React, { useEffect, useMemo, useState } from "react";
import { sections, initialValues } from "./inputParameters.js";
import { validate } from "./validation.js";

const API = "http://localhost:3001/api";

function toPayload(values) {
  const numericKeys = [
    "averageFlowM3h", "peakFlowM3h", "operatingHoursPerDay", "currentPh",
    "temperatureC", "fogMgL", "tssMgL", "codMgL", "alkalinityMgLCaCO3",
    "dischargePhMin", "dischargePhMax", "targetPh",
    "chemicalConcentrationPct", "chemicalDensityKgL", "titrationDoseMlPerL",
    "dosingSafetyFactor", "storageDays",
    "maxSkidLengthM", "maxSkidWidthM", "maxSkidHeightM"
  ];
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [
    key,
    numericKeys.includes(key) && value !== "" ? Number(value) : value
  ]));
}

export default function App() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(0);

  const currentSection = sections[step];
  const progress = Math.round(((step + 1) / sections.length) * 100);

  const loadSaved = async () => {
    try {
      const res = await fetch(`${API}/submissions`);
      if (res.ok) setSaved(await res.json());
    } catch {
      setStatus("API unavailable. Start the Express server on port 3001.");
    }
  };

  useEffect(() => { loadSaved(); }, []);

  const setField = (key, value) => {
    setValues((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
  };

  const validateStep = () => {
    const allErrors = validate(values);
    const keys = new Set(currentSection.fields.map((f) => f.key));
    const stepErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([key]) => keys.has(key))
    );
    setErrors((old) => ({ ...old, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, sections.length - 1));
  };

  const save = async () => {
    const allErrors = validate(values);
    setErrors(allErrors);

    if (Object.keys(allErrors).length) {
      setStatus("Please correct the highlighted fields before saving.");
      const firstKey = Object.keys(allErrors)[0];
      const sectionIndex = sections.findIndex((s) => s.fields.some((f) => f.key === firstKey));
      if (sectionIndex >= 0) setStep(sectionIndex);
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/submissions/${editingId}` : `${API}/submissions`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values))
      });

      const body = await res.json();
      if (!res.ok) {
        if (body.errors) setErrors(body.errors);
        setStatus(body.error || "Could not save questionnaire.");
        return;
      }

      if (!editingId) setEditingId(body.id);
      setStatus(editingId ? "Questionnaire updated." : `Saved as submission #${body.id}.`);
      await loadSaved();
    } catch {
      setStatus("Could not connect to the API.");
    }
  };

  const retrieve = async (id) => {
    const res = await fetch(`${API}/submissions/${id}`);
    if (!res.ok) return;
    const item = await res.json();
    setValues({ ...initialValues, ...item.data });
    setEditingId(item.id);
    setStep(0);
    setErrors({});
    setStatus(`Loaded submission #${item.id}.`);
  };

  const startNew = () => {
    setValues(initialValues);
    setEditingId(null);
    setErrors({});
    setStep(0);
    setStatus("Started a new questionnaire.");
  };

  const estimatedDose = useMemo(() => {
    const peak = Number(values.peakFlowM3h);
    const dose = Number(values.titrationDoseMlPerL);
    const factor = Number(values.dosingSafetyFactor);
    return peak && dose && factor ? peak * dose * factor : null;
  }, [values.peakFlowM3h, values.titrationDoseMlPerL, values.dosingSafetyFactor]);

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SPN Consulting - Capstone Prototype</p>
          <h1>Wastewater Skid Design Questionnaire</h1>
          <p>Guided plant and wastewater data entry for preliminary pH-correction skid design.</p>
        </div>
        <button className="secondary" onClick={startNew}>New questionnaire</button>
      </header>

      <div className="layout">
        <main className="card">
          <div className="progressRow">
            <strong>Step {step + 1} of {sections.length}</strong>
            <span>{progress}% complete</span>
          </div>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>

          <h2>{currentSection.title}</h2>
          <p className="muted">{currentSection.description}</p>

          <div className="formGrid">
            {currentSection.fields.map((field) => (
              <label className={field.type === "textarea" ? "field full" : "field"} key={field.key}>
                <span>{field.label}{field.required && <b className="required"> *</b>}</span>

                {field.type === "select" ? (
                  <select value={values[field.key]} onChange={(e) => setField(field.key, e.target.value)}>
                    <option value="">Select...</option>
                    {field.options.map((option) => {
                      const value = typeof option === "string" ? option : option.value;
                      const label = typeof option === "string" ? option : option.label;
                      return <option key={value} value={value}>{label}</option>;
                    })}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea rows="4" value={values[field.key]} placeholder={field.placeholder || ""}
                    onChange={(e) => setField(field.key, e.target.value)} />
                ) : (
                  <input type={field.type} min={field.min} max={field.max} step={field.step}
                    value={values[field.key]} placeholder={field.placeholder || ""}
                    onChange={(e) => setField(field.key, e.target.value)} />
                )}

                {field.help && <small className="help">{field.help}</small>}
                {errors[field.key] && <small className="error">{errors[field.key]}</small>}
              </label>
            ))}
          </div>

          {estimatedDose !== null && step === 4 && (
            <div className="estimate">
              <strong>Prototype peak chemical solution flow</strong>
              <span>{estimatedDose.toFixed(2)} L/h</span>
              <small>Peak flow x bench titration dose x design factor. Preliminary only.</small>
            </div>
          )}

          <div className="actions">
            <button className="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </button>
            <div>
              <button className="secondary" onClick={save}>
                {editingId ? "Update saved input" : "Save input"}
              </button>
              {step < sections.length - 1
                ? <button className="primary" onClick={next}>Next</button>
                : <button className="primary" onClick={save}>Finish & Save</button>}
            </div>
          </div>

          {status && <div className="status">{status}</div>}
        </main>

        <aside className="card">
          <h2>Saved inputs</h2>
          <p className="muted">Retrieve a previous plant questionnaire.</p>
          <div className="savedList">
            {saved.length === 0 && <p>No saved questionnaires yet.</p>}
            {saved.map((item) => (
              <button className="savedItem" key={item.id} onClick={() => retrieve(item.id)}>
                <strong>{item.project_name}</strong>
                <span>{item.site_name}</span>
                <small>Submission #{item.id}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
