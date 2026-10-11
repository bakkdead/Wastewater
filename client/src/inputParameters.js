export const sections = [
  {
    title: "1. Project & Site",
    description: "Identify the design and the dairy facility.",
    fields: [
      { key: "projectName", label: "Project name", type: "text", required: true },
      { key: "siteName", label: "Plant / site name", type: "text", required: true },
      {
        key: "wastewaterSource", label: "Primary wastewater source",
        type: "select", required: true,
        options: ["Mixed dairy wastewater", "CIP wastewater", "Process wastewater", "Washdown wastewater", "Other"]
      },
      { key: "notes", label: "Project notes", type: "textarea" }
    ]
  },
  {
    title: "2. Hydraulic Conditions",
    description: "Define normal and peak hydraulic loads.",
    fields: [
      { key: "averageFlowM3h", label: "Average flow (m³/h)", type: "number", min: 0.01, max: 500, step: 0.01, required: true },
      { key: "peakFlowM3h", label: "Peak flow (m³/h)", type: "number", min: 0.01, max: 1000, step: 0.01, required: true },
      { key: "operatingHoursPerDay", label: "Operating hours per day", type: "number", min: 1, max: 24, step: 0.5, required: true }
    ]
  },
  {
    title: "3. Wastewater Characteristics",
    description: "Capture wastewater chemistry and treatment context.",
    fields: [
      { key: "currentPh", label: "Current wastewater pH", type: "number", min: 0, max: 14, step: 0.01, required: true },
      { key: "temperatureC", label: "Wastewater temperature (°C)", type: "number", min: 0, max: 90, step: 0.1, required: true },
      { key: "fogMgL", label: "FOG (mg/L)", type: "number", min: 0, max: 100000, step: 1, required: true },
      { key: "tssMgL", label: "TSS (mg/L)", type: "number", min: 0, max: 100000, step: 1, required: true },
      { key: "codMgL", label: "COD (mg/L)", type: "number", min: 0, max: 200000, step: 1, required: true },
      { key: "alkalinityMgLCaCO3", label: "Alkalinity (mg/L as CaCO₃)", type: "number", min: 0, max: 100000, step: 1, required: true },
      { key: "upstreamTreatment", label: "Existing upstream treatment", type: "textarea", placeholder: "Example: screening, equalisation, DAF" }
    ]
  },
  {
    title: "4. Trade Waste & Target pH",
    description: "Define the permitted pH range and the control target.",
    fields: [
      { key: "dischargePhMin", label: "Trade waste minimum pH", type: "number", min: 0, max: 14, step: 0.01, required: true },
      { key: "dischargePhMax", label: "Trade waste maximum pH", type: "number", min: 0, max: 14, step: 0.01, required: true },
      { key: "targetPh", label: "Design target pH", type: "number", min: 0, max: 14, step: 0.01, required: true }
    ]
  },
  {
    title: "5. Chemical Dosing Data",
    description: "Provide neutralisation test data used by later calculations.",
    fields: [
      {
        key: "chemicalType", label: "Neutralising chemical type",
        type: "select", required: true,
        options: [
          { value: "acid", label: "Acid - reduce pH" },
          { value: "alkali", label: "Alkali - increase pH" }
        ]
      },
      { key: "chemicalName", label: "Chemical name", type: "text", required: true, placeholder: "Example: sodium hydroxide" },
      { key: "chemicalConcentrationPct", label: "Chemical concentration (% w/w)", type: "number", min: 0.01, max: 100, step: 0.01, required: true },
      { key: "chemicalDensityKgL", label: "Chemical density (kg/L)", type: "number", min: 0.1, max: 3, step: 0.001, required: true },
      {
        key: "titrationDoseMlPerL",
        label: "Bench titration dose to target (mL reagent/L wastewater)",
        type: "number", min: 0.0001, max: 1000, step: 0.0001, required: true,
        help: "Representative titration is captured because pH alone does not describe wastewater buffering capacity."
      },
      { key: "dosingSafetyFactor", label: "Dosing design factor", type: "number", min: 1, max: 2, step: 0.05, required: true },
      { key: "storageDays", label: "Desired chemical storage (days)", type: "number", min: 0.5, max: 60, step: 0.5, required: true }
    ]
  },
  {
    title: "6. Skid & Control Constraints",
    description: "Capture space, electrical and control requirements.",
    fields: [
      { key: "maxSkidLengthM", label: "Maximum skid length (m)", type: "number", min: 0.5, max: 20, step: 0.01, required: true },
      { key: "maxSkidWidthM", label: "Maximum skid width (m)", type: "number", min: 0.5, max: 10, step: 0.01, required: true },
      { key: "maxSkidHeightM", label: "Maximum skid height (m)", type: "number", min: 0.5, max: 10, step: 0.01, required: true },
      {
        key: "powerSupply", label: "Available electrical supply",
        type: "select", required: true,
        options: ["230 V single phase", "400 V three phase", "Other"]
      },
      {
        key: "controlMode", label: "Control requirement",
        type: "select", required: true,
        options: ["Local automatic pH control", "PLC integrated control", "Manual / concept only"]
      },
      {
        key: "communicationProtocol", label: "Preferred communication protocol",
        type: "select", required: true,
        options: ["None", "Modbus TCP", "Modbus RTU", "PROFINET", "EtherNet/IP", "Other"]
      }
    ]
  }
];

export const initialValues = {
  projectName: "",
  siteName: "",
  wastewaterSource: "",
  notes: "",
  averageFlowM3h: "",
  peakFlowM3h: "",
  operatingHoursPerDay: 16,
  currentPh: "",
  temperatureC: 25,
  fogMgL: "",
  tssMgL: "",
  codMgL: "",
  alkalinityMgLCaCO3: "",
  upstreamTreatment: "",
  dischargePhMin: 6,
  dischargePhMax: 10,
  targetPh: 7,
  chemicalType: "",
  chemicalName: "",
  chemicalConcentrationPct: "",
  chemicalDensityKgL: "",
  titrationDoseMlPerL: "",
  dosingSafetyFactor: 1.2,
  storageDays: 7,
  maxSkidLengthM: 6,
  maxSkidWidthM: 2.4,
  maxSkidHeightM: 2.5,
  powerSupply: "400 V three phase",
  controlMode: "Local automatic pH control",
  communicationProtocol: "Modbus TCP"
};
