import test from "node:test";
import assert from "node:assert/strict";
import { calculateDesign } from "./calcEngine.js";

const baseInput = {
  projectName: "CSC-44 Unit Test",
  siteName: "Test Site",
  peakFlowM3h: 20,
  averageFlowM3h: 10,
  titrationDoseMlPerL: 2,
  dosingSafetyFactor: 1.2,
  storageDays: 7,
  operatingHoursPerDay: 16,
  currentPh: 5,
  targetPh: 7,
  chemicalName: "Sodium Hydroxide",
  controlMode: "Automatic pH control"
};

test("Sample Case 1 - calculates chemical dosing correctly", () => {
  const result = calculateDesign(baseInput);

  assert.equal(result.dosing.chemicalFlowLh, 48);
  assert.equal(result.dosing.dailyChemicalL, 384);
  assert.equal(result.dosing.storageL, 2688);
});

test("Sample Case 2 - calculates tank sizing correctly", () => {
  const result = calculateDesign(baseInput);

  assert.equal(result.tanks.correctionL, 10000);
  assert.equal(result.tanks.equalisationL, 20000);
  assert.equal(result.tanks.chemicalStorageL, 2700);
});

test("Sample Case 3 - calculates pump sizing correctly", () => {
  const result = calculateDesign(baseInput);

  assert.equal(result.pumps.feedM3h, 24);
  assert.equal(result.pumps.dosingLh, 60);
});

test("Sample Case 4 - rejects invalid zero flow", () => {
  assert.throws(
    () => calculateDesign({ ...baseInput, peakFlowM3h: 0 }),
    /greater than zero/
  );
});
