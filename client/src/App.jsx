import React, { useEffect, useMemo, useState } from "react";
import { sections, initialValues } from "./inputParameters.js";
import { validate } from "./validation.js";
import { calculateDesign, calculateSkidLayout, normaliseCsc56Output } from "./calcEngine.js";

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
  const [design, setDesign] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [calcError, setCalcError] = useState("");

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
    setDesign(null); setSelectedEquipment(null); setCalcError("");
  };

  const estimatedDose = useMemo(() => {
    const peak = Number(values.peakFlowM3h);
    const dose = Number(values.titrationDoseMlPerL);
    const factor = Number(values.dosingSafetyFactor);
    return peak && dose && factor ? peak * dose * factor : null;
  }, [values.peakFlowM3h, values.titrationDoseMlPerL, values.dosingSafetyFactor]);

  const layout = useMemo(() => {
    try { return calculateSkidLayout(values, selectedEquipment); }
    catch { return null; }
  }, [values, selectedEquipment]);

  const runCalculation = () => {
    const allErrors = validate(values);
    setErrors(allErrors);
    if (Object.keys(allErrors).length) {
      setCalcError("Please correct the highlighted questionnaire fields before calculating the design.");
      const firstKey = Object.keys(allErrors)[0];
      const sectionIndex = sections.findIndex((s) => s.fields.some((f) => f.key === firstKey));
      if (sectionIndex >= 0) setStep(sectionIndex);
      return;
    }
    try {
      const rawOutput = calculateDesign(toPayload(values));
      const result = normaliseCsc56Output(rawOutput);
      setDesign(result);
      setSelectedEquipment(result.equipment);
      setCalcError("");
      setStatus("Design calculated successfully. Equipment recommendations are ready for the 2D layout.");
      setTimeout(() => document.getElementById("design-results")?.scrollIntoView({behavior:"smooth"}), 0);
    } catch (err) {
      setDesign(null); setSelectedEquipment(null);
      setCalcError(err.message || "The design could not be calculated.");
    }
  };

  const loadSpnExample = () => {
    setValues({...initialValues, projectName:"SPN Dairy pH Skid Example", siteName:"Example Dairy Facility", wastewaterSource:"Mixed dairy wastewater", averageFlowM3h:8, peakFlowM3h:12, operatingHoursPerDay:16, currentPh:5.2, targetPh:7, temperatureC:25, fogMgL:650, tssMgL:800, codMgL:3200, alkalinityMgLCaCO3:250, upstreamTreatment:"Screening and DAF", dischargePhMin:6, dischargePhMax:10, chemicalType:"alkali", chemicalName:"Sodium hydroxide", chemicalConcentrationPct:25, chemicalDensityKgL:1.28, titrationDoseMlPerL:0.8, dosingSafetyFactor:1.2, storageDays:7, maxSkidLengthM:5.9, maxSkidWidthM:2.35, maxSkidHeightM:2.5, powerSupply:"400 V three phase", controlMode:"Local automatic pH control", communicationProtocol:"Modbus TCP"});
    setErrors({}); setDesign(null); setSelectedEquipment(null); setCalcError(""); setStep(0); setStatus("SPN demonstration example loaded. Review the inputs, then calculate the design.");
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SPN Consulting - Capstone Prototype</p>
          <h1>Wastewater Skid Design Questionnaire</h1>
          <p>Guided plant and wastewater data entry for preliminary pH-correction skid design.</p>
        </div>
        <div className="headerActions"><button className="secondary" onClick={loadSpnExample}>Load SPN example</button><button className="secondary" onClick={() => document.getElementById("skid-layout")?.scrollIntoView({ behavior: "smooth" })}>2D skid layout</button><button className="secondary" onClick={startNew}>New questionnaire</button></div>
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

          <div className="calculateBox">
            <h3>Ready to generate the preliminary design?</h3>
            <p className="muted">Validate the questionnaire, run the calculation engine, then pass its equipment recommendations into the layout.</p>
            <button className="primary" onClick={runCalculation}>Calculate Skid Design</button>
          </div>
          {calcError && <div className="warning">{calcError}</div>}
          {status && <div className="status">{status}</div>}
        </main>

        {design && <section id="design-results" className="card resultsCard">
          <p className="eyebrow">CSC-56 STRUCTURED OUTPUT</p>
          <h2>Preliminary Design Results</h2>
          <p className="muted">One structured calculation result feeds the summary, equipment recommendations and 2D layout.</p>

          <div className="resultGrid">
            <div><span>Peak wastewater flow</span><strong>{design.inputs.peakFlow.toFixed(2)} m³/h</strong></div>
            <div><span>pH correction</span><strong>{design.inputs.currentPh} → {design.inputs.targetPh}</strong></div>
            <div><span>Peak chemical dose</span><strong>{design.dosing.chemicalFlowLh.toFixed(2)} L/h</strong></div>
            <div><span>Daily chemical use</span><strong>{design.dosing.dailyChemicalL.toFixed(1)} L/day</strong></div>
          </div>

          <h3>Tank, pump, pipe & dosing results</h3>
          <div className="engineeringGrid">
            <div className="resultGroup">
              <span>Tanks</span>
              <strong>Equalisation: {design.tanks.equalisationL.toLocaleString()} L</strong>
              <strong>pH correction: {design.tanks.correctionL.toLocaleString()} L</strong>
              <strong>Chemical: {design.tanks.chemicalStorageL.toLocaleString()} L</strong>
            </div>
            <div className="resultGroup">
              <span>Pumps</span>
              <strong>Feed: ≥ {design.pumps.feedM3h} m³/h</strong>
              <strong>Dosing: ≥ {design.pumps.dosingLh} L/h</strong>
            </div>
            <div className="resultGroup">
              <span>Pipe sizing</span>
              <strong>Process: {design.pipes.processNominal}</strong>
              <strong>Dosing: {design.pipes.dosingNominal}</strong>
            </div>
            <div className="resultGroup">
              <span>Chemical dosing</span>
              <strong>{design.dosing.chemical}</strong>
              <strong>{design.dosing.chemicalFlowLh.toFixed(2)} L/h peak</strong>
              <strong>{design.dosing.storageL.toFixed(0)} L calculated storage</strong>
            </div>
          </div>

          <h3>Equipment recommendations</h3>
          <div className="equipmentTable">
            {design.equipment.map(eq => <div key={eq.id}><span>{eq.label}</span><strong>{eq.recommendation}</strong></div>)}
          </div>

          {design.warnings?.map((warning, i) => <div className="notice" key={i}>{warning}</div>)}
          <button className="primary" onClick={() => document.getElementById("skid-layout")?.scrollIntoView({behavior:"smooth"})}>
            View 2D Skid Layout
          </button>
        </section>}

        <section id="skid-layout" className="card layoutCard">
          <div className="layoutHeader">
            <div>
              <p className="eyebrow">CALC ENGINE OUTPUT</p>
              <h2>2D Skid Layout</h2>
              <p className="muted">Top-down conceptual placement generated from the questionnaire inputs.</p>
            </div>
            <div className={!layout ? "badge neutral" : layout.withinLimits ? "badge good" : "badge bad"}>
              {layout ? (layout.withinLimits ? "Within footprint" : "Footprint exceeded") : "Calculate first"}
            </div>
          </div>
          {!layout ? <div className="warning">Complete the questionnaire and calculate the design before generating the equipment layout.</div> : <>
          <div className="layoutStats">
            <div><span>20 ft container</span><strong>{layout.container.length.toFixed(2)} m × {layout.container.width.toFixed(2)} m</strong></div>
            <div><span>Generated skid</span><strong>{layout.usedLength.toFixed(2)} m × {layout.usedWidth.toFixed(2)} m</strong></div>
            <div><span>Equipment</span><strong>{layout.equipment.length} items</strong></div>
          </div>
          {!layout.withinLimits && <div className="warning">The calculated equipment footprint exceeds the available container/skid footprint. Adjust the skid constraints or equipment inputs.</div>}
          <div className="svgWrap">
            <svg viewBox="0 0 900 430" role="img" aria-label="Top-down 2D skid layout">
              <rect x="35" y="35" width="830" height="330" rx="8" className="containerRect" />
              <text x="55" y="28" className="svgTitle">20 ft container footprint</text>
              <text x="450" y="408" textAnchor="middle" className="svgDimension">Length: {layout.container.length.toFixed(2)} m</text>
              <text x="15" y="205" transform="rotate(-90 15 205)" textAnchor="middle" className="svgDimension">Width: {layout.container.width.toFixed(2)} m</text>
              <rect x="58" y="58" width={layout.canvasSkid.width} height={layout.canvasSkid.height} className={layout.withinLimits ? "skidRect" : "skidRect danger"} />
              {layout.equipment.map((eq) => (
                <g key={eq.id}>
                  <rect x={58 + eq.x} y={58 + eq.y} width={eq.w} height={eq.h} rx={eq.type === "tank" ? 10 : 5} className={eq.type === "tank" ? "tankRect" : "pumpRect"} />
                  <text x={58 + eq.x + eq.w / 2} y={58 + eq.y + eq.h / 2} textAnchor="middle" dominantBaseline="middle" className="equipmentLabel">{eq.label}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="layoutLegend"><span><i className="legend tank"></i>Tank</span><span><i className="legend pump"></i>Pump / control</span><span><i className="legend skid"></i>Skid frame</span></div>
          <small className="help">Conceptual layout only. Equipment recommendations are passed from the calculation engine and should be verified by the engineering design.</small>
          </>}
        </section>

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
