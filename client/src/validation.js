export function validate(values) {
  const errors = {};

  const required = [
    "projectName", "siteName", "wastewaterSource",
    "averageFlowM3h", "peakFlowM3h", "operatingHoursPerDay",
    "currentPh", "temperatureC", "fogMgL", "tssMgL", "codMgL",
    "alkalinityMgLCaCO3", "dischargePhMin", "dischargePhMax", "targetPh",
    "chemicalType", "chemicalName", "chemicalConcentrationPct",
    "chemicalDensityKgL", "titrationDoseMlPerL", "dosingSafetyFactor",
    "storageDays", "maxSkidLengthM", "maxSkidWidthM", "maxSkidHeightM",
    "powerSupply", "controlMode", "communicationProtocol"
  ];

  required.forEach((key) => {
    if (values[key] === "" || values[key] === null || values[key] === undefined) {
      errors[key] = "Required";
    }
  });

  const range = (key, min, max) => {
    if (values[key] === "") return;
    const v = Number(values[key]);
    if (!Number.isFinite(v)) errors[key] = "Must be a number";
    else if (v < min || v > max) errors[key] = `Must be ${min}-${max}`;
  };

  range("averageFlowM3h", 0.01, 500);
  range("peakFlowM3h", 0.01, 1000);
  range("operatingHoursPerDay", 1, 24);
  range("currentPh", 0, 14);
  range("temperatureC", 0, 90);
  range("fogMgL", 0, 100000);
  range("tssMgL", 0, 100000);
  range("codMgL", 0, 200000);
  range("alkalinityMgLCaCO3", 0, 100000);
  range("dischargePhMin", 0, 14);
  range("dischargePhMax", 0, 14);
  range("targetPh", 0, 14);
  range("chemicalConcentrationPct", 0.01, 100);
  range("chemicalDensityKgL", 0.1, 3);
  range("titrationDoseMlPerL", 0.0001, 1000);
  range("dosingSafetyFactor", 1, 2);
  range("storageDays", 0.5, 60);
  range("maxSkidLengthM", 0.5, 20);
  range("maxSkidWidthM", 0.5, 10);
  range("maxSkidHeightM", 0.5, 10);

  if (Number(values.peakFlowM3h) < Number(values.averageFlowM3h)) {
    errors.peakFlowM3h = "Peak flow must be >= average flow";
  }

  if (Number(values.dischargePhMin) >= Number(values.dischargePhMax)) {
    errors.dischargePhMax = "Maximum pH must be greater than minimum pH";
  }

  const target = Number(values.targetPh);
  if (target < Number(values.dischargePhMin) || target > Number(values.dischargePhMax)) {
    errors.targetPh = "Target pH must be within the discharge range";
  }

  if (values.currentPh !== "" && values.targetPh !== "" && values.chemicalType) {
    const current = Number(values.currentPh);
    const targetPh = Number(values.targetPh);
    if (current < targetPh && values.chemicalType !== "alkali") {
      errors.chemicalType = "Select alkali when the design needs to raise pH";
    }
    if (current > targetPh && values.chemicalType !== "acid") {
      errors.chemicalType = "Select acid when the design needs to lower pH";
    }
  }

  return errors;
}
