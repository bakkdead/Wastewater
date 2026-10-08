import { selectEquipment } from "./equipmentDatabase.js";

/**
 * Final prototype calculation / integration layer.
 * The actual approved CSC-56 schema was not supplied with the previous ZIP.
 * normaliseCsc56Output() is the single adapter point to update when that schema is supplied.
 */
const CONTAINER = { length: 5.90, width: 2.35 };
const round = (v, n = 2) => Number(v.toFixed(n));

function nominalPipeDn(flowM3h) {
  if (flowM3h <= 3) return "DN25";
  if (flowM3h <= 7) return "DN32";
  if (flowM3h <= 14) return "DN40";
  if (flowM3h <= 25) return "DN50";
  if (flowM3h <= 45) return "DN65";
  return "DN80";
}

export function calculateDesign(values) {
  const peakFlow = Number(values.peakFlowM3h);
  const averageFlow = Number(values.averageFlowM3h);
  const doseMlL = Number(values.titrationDoseMlPerL);
  const factor = Number(values.dosingSafetyFactor);
  const storageDays = Number(values.storageDays);
  const hours = Number(values.operatingHoursPerDay);
  const currentPh = Number(values.currentPh);
  const targetPh = Number(values.targetPh);

  if (![peakFlow, averageFlow, doseMlL, factor, storageDays, hours, currentPh, targetPh].every(Number.isFinite)) {
    throw new Error("Required calculation inputs are missing or invalid.");
  }
  if (peakFlow <= 0 || averageFlow <= 0 || doseMlL <= 0) {
    throw new Error("Flow and bench titration dose must be greater than zero.");
  }

  const chemicalFlowLh = peakFlow * doseMlL * factor;
  const dailyChemicalL = averageFlow * hours * doseMlL * factor;
  const chemicalStorageL = dailyChemicalL * storageDays;

  const correctionTankL = Math.max(500, Math.ceil((peakFlow * 0.5 * 1000) / 250) * 250);
  const equalisationTankL = Math.max(1000, Math.ceil((peakFlow * 1.0 * 1000) / 500) * 500);
  const dosingTankL = Math.max(200, Math.ceil(chemicalStorageL / 100) * 100);
  const dosingPumpLh = Math.max(5, Math.ceil((chemicalFlowLh * 1.25) / 5) * 5);
  const feedPumpM3h = Math.max(2, Math.ceil((peakFlow * 1.15) / 2) * 2);
  const processPipe = nominalPipeDn(peakFlow);
  const dosingPipe = chemicalFlowLh <= 20 ? "DN10" : chemicalFlowLh <= 50 ? "DN15" : "DN20";

  const equipment = [
    { id:"eq-tank", type:"tank", label:"Equalisation Tank", recommendation:`${equalisationTankL.toLocaleString()} L`, length:1.55, width:1.05 },
    { id:"ph-tank", type:"tank", label:"pH Correction Tank", recommendation:`${correctionTankL.toLocaleString()} L`, length:1.35, width:1.00 },
    { id:"chem-tank", type:"tank", label:"Chemical Tank", recommendation:`${dosingTankL.toLocaleString()} L`, length:0.75, width:0.70 },
    { id:"feed-pump", type:"pump", label:"Feed Pump", recommendation:`≥ ${feedPumpM3h} m³/h`, length:0.75, width:0.45 },
    { id:"dose-pump", type:"pump", label:"Dosing Pump", recommendation:`≥ ${dosingPumpLh} L/h`, length:0.65, width:0.40 },
    { id:"control", type:"control", label:"Control Panel", recommendation: values.controlMode || "Automatic pH control", length:0.75, width:0.35 }
  ];
const equipmentSelection = selectEquipment({
  tanks: {
    equalisationL: equalisationTankL,
    correctionL: correctionTankL,
    chemicalStorageL: dosingTankL
  },
  pumps: {
    feedM3h: feedPumpM3h,
    dosingLh: dosingPumpLh
  }
});
  return {
    schema: "CSC-56-PROTOTYPE",
    version: 1,
    project: { projectName: values.projectName, siteName: values.siteName },
    inputs: { peakFlow, averageFlow, currentPh, targetPh },
    dosing: {
      chemical: values.chemicalName || "Neutralising chemical",
      chemicalFlowLh: round(chemicalFlowLh),
      dailyChemicalL: round(dailyChemicalL),
      storageL: round(chemicalStorageL)
    },
    tanks: {
      equalisationL: equalisationTankL,
      correctionL: correctionTankL,
      chemicalStorageL: dosingTankL
    },
    pumps: { feedM3h: feedPumpM3h, dosingLh: dosingPumpLh },
    pipes: { processNominal: processPipe, dosingNominal: dosingPipe },
    equipment,
    equipmentSelection,
    warnings: [
      "Concept-level prototype sizing only; final engineering verification is required.",
      ...equipmentSelection.warnings
     ]
  };
}

export function normaliseCsc56Output(raw) {
  if (!raw || typeof raw !== "object") throw new Error("Calculation engine returned no structured output.");

  if (raw.schema === "CSC-56-PROTOTYPE") {
    if (!raw.tanks || !raw.pumps || !raw.pipes || !raw.dosing || !Array.isArray(raw.equipment)) {
      throw new Error("Structured calculation output is incomplete.");
    }
    return raw;
  }

  throw new Error(
    "Unsupported CSC-56 output structure. Update normaliseCsc56Output() with the approved CSC-56 schema."
  );
}

export function calculateSkidLayout(values, selectedEquipment = null) {
  if (!selectedEquipment || !Array.isArray(selectedEquipment) || selectedEquipment.length === 0) return null;

  const equipment = selectedEquipment.map(e => ({ ...e }));
  const gap = 0.12, aisle = 0.25;
  const split = Math.ceil(equipment.length / 2);
  const rows = [equipment.slice(0, split), equipment.slice(split)];

  let usedLength = 0, y = 0;
  rows.forEach(row => {
    let x = 0, rowHeight = 0;
    row.forEach(eq => {
      if (![eq.length, eq.width].every(n => Number.isFinite(Number(n)))) {
        throw new Error(`Equipment dimensions are missing for ${eq.label || "an item"}.`);
      }
      eq.xM = x; eq.yM = y;
      x += Number(eq.length) + gap;
      rowHeight = Math.max(rowHeight, Number(eq.width));
    });
    usedLength = Math.max(usedLength, Math.max(0, x - gap));
    y += rowHeight + aisle;
  });

  const usedWidth = Math.max(0, y - aisle);
  const maxSkidLength = Number(values.maxSkidLengthM) || CONTAINER.length;
  const maxSkidWidth = Number(values.maxSkidWidthM) || CONTAINER.width;
  const withinContainer = usedLength <= CONTAINER.length && usedWidth <= CONTAINER.width;
  const withinUserLimit = usedLength <= maxSkidLength && usedWidth <= maxSkidWidth;
  const scale = Math.min((830 - 40) / CONTAINER.length, (330 - 40) / CONTAINER.width);

  return {
    container: CONTAINER, usedLength, usedWidth, maxSkidLength, maxSkidWidth,
    withinLimits: withinContainer && withinUserLimit, withinContainer, withinUserLimit,
    equipment: equipment.map(eq => ({
      ...eq, x:eq.xM*scale, y:eq.yM*scale,
      w:Number(eq.length)*scale, h:Number(eq.width)*scale
    })),
    canvasSkid: {
      width:Math.min(usedLength,CONTAINER.length)*scale+8,
      height:Math.min(usedWidth,CONTAINER.width)*scale+8
    }
  };
}
