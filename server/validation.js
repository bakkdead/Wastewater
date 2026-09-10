const isNumber = (v) => typeof v === "number" && Number.isFinite(v);
const hasText = (v) => typeof v === "string" && v.trim().length > 0;

export function validateSubmission(data) {
  const errors = {};

  for (const [key, label] of [
    ["projectName", "Project name"],
    ["siteName", "Site name"],
    ["wastewaterSource", "Wastewater source"],
    ["chemicalType", "Neutralising chemical type"],
    ["chemicalName", "Chemical name"],
    ["powerSupply", "Power supply"],
    ["controlMode", "Control mode"],
    ["communicationProtocol", "Communication protocol"]
  ]) {
    if (!hasText(data[key])) errors[key] = `${label} is required.`;
  }

  const range = (key, label, min, max) => {
    if (!isNumber(data[key])) errors[key] = `${label} must be a number.`;
    else if (data[key] < min || data[key] > max) {
      errors[key] = `${label} must be between ${min} and ${max}.`;
    }
  };

  range("averageFlowM3h", "Average flow", 0.01, 500);
  range("peakFlowM3h", "Peak flow", 0.01, 1000);
  range("operatingHoursPerDay", "Operating hours", 1, 24);
  range("currentPh", "Current pH", 0, 14);
  range("targetPh", "Target pH", 0, 14);
  range("dischargePhMin", "Minimum discharge pH", 0, 14);
  range("dischargePhMax", "Maximum discharge pH", 0, 14);
  range("temperatureC", "Temperature", 0, 90);
  range("fogMgL", "FOG", 0, 100000);
  range("tssMgL", "TSS", 0, 100000);
  range("codMgL", "COD", 0, 200000);
  range("alkalinityMgLCaCO3", "Alkalinity", 0, 100000);
  range("titrationDoseMlPerL", "Bench titration dose", 0.0001, 1000);
  range("chemicalConcentrationPct", "Chemical concentration", 0.01, 100);
  range("chemicalDensityKgL", "Chemical density", 0.1, 3);
  range("dosingSafetyFactor", "Dosing design factor", 1, 2);
  range("storageDays", "Storage days", 0.5, 60);
  range("maxSkidLengthM", "Maximum skid length", 0.5, 20);
  range("maxSkidWidthM", "Maximum skid width", 0.5, 10);
  range("maxSkidHeightM", "Maximum skid height", 0.5, 10);

  if (isNumber(data.peakFlowM3h) && isNumber(data.averageFlowM3h) &&
      data.peakFlowM3h < data.averageFlowM3h) {
    errors.peakFlowM3h = "Peak flow must be greater than or equal to average flow.";
  }

  if (isNumber(data.dischargePhMin) && isNumber(data.dischargePhMax) &&
      data.dischargePhMin >= data.dischargePhMax) {
    errors.dischargePhMax = "Maximum discharge pH must be greater than minimum discharge pH.";
  }

  if (
    isNumber(data.targetPh) &&
    isNumber(data.dischargePhMin) &&
    isNumber(data.dischargePhMax) &&
    (data.targetPh < data.dischargePhMin || data.targetPh > data.dischargePhMax)
  ) {
    errors.targetPh = "Target pH must be within the permitted discharge range.";
  }

  if (isNumber(data.currentPh) && isNumber(data.targetPh) && hasText(data.chemicalType)) {
    if (data.currentPh < data.targetPh && data.chemicalType !== "alkali") {
      errors.chemicalType = "Select an alkali when the design needs to raise pH.";
    }
    if (data.currentPh > data.targetPh && data.chemicalType !== "acid") {
      errors.chemicalType = "Select an acid when the design needs to lower pH.";
    }
  }

  return errors;
}
