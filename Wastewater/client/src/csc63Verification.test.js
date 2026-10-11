import test from "node:test";
import assert from "node:assert/strict";
import { calculateDesign } from "./calcEngine.js";

const spnDesignCase = {
  projectName: "SPN Design Verification",
  siteName: "SPN Reference Site",
  peakFlowM3h: 8,
  averageFlowM3h: 5,
  titrationDoseMlPerL: 2,
  dosingSafetyFactor: 1.2,
  storageDays: 2,
  operatingHoursPerDay: 8,
  currentPh: 5.5,
  targetPh: 7.0,
  chemicalName: "Neutralising chemical",
  maxSkidLengthM: 5.9,
  maxSkidWidthM: 2.35
};

test("CSC-63 complete SPN design case produces equipment recommendations", () => {
  const result = calculateDesign(spnDesignCase);

  assert.ok(result.equipmentSelection);
  assert.ok(result.equipmentSelection.selections);
  assert.ok(result.equipmentSelection.selections.equalisationTank.item);
  assert.ok(result.equipmentSelection.selections.correctionTank.item);
  assert.ok(result.equipmentSelection.selections.chemicalTank.item);
  assert.ok(result.equipmentSelection.selections.feedPump.item);
  assert.ok(result.equipmentSelection.selections.dosingPump.item);
});

test("CSC-63 selected tanks meet calculated tank requirements", () => {
  const result = calculateDesign(spnDesignCase);
  const selections = result.equipmentSelection.selections;

  assert.ok(
    selections.equalisationTank.item.capacityL >= result.tanks.equalisationL
  );

  assert.ok(
    selections.correctionTank.item.capacityL >= result.tanks.correctionL
  );

  assert.ok(
    selections.chemicalTank.item.capacityL >= result.tanks.chemicalStorageL
  );
});

test("CSC-63 transfer pump meets calculated flow requirement", () => {
  const result = calculateDesign(spnDesignCase);

  assert.ok(
    result.equipmentSelection.selections.feedPump.item.flowM3h >=
      result.pumps.feedM3h
  );
});

test("CSC-63 dosing pump meets calculated dosing requirement", () => {
  const result = calculateDesign(spnDesignCase);

  assert.ok(
    result.equipmentSelection.selections.dosingPump.item.flowLh >=
      result.pumps.dosingLh
  );
});

test("CSC-63 pipe requirements are retained in design output", () => {
  const result = calculateDesign(spnDesignCase);

  assert.ok(result.pipes);
  assert.ok(result.pipes.processNominal);
  assert.ok(result.pipes.dosingNominal);

  assert.match(result.pipes.processNominal, /^DN\d+$/);
  assert.match(result.pipes.dosingNominal, /^DN\d+$/);
});

test("CSC-63 preliminary prices and total cost are consistent", () => {
  const result = calculateDesign(spnDesignCase);
  const selection = result.equipmentSelection;

  const selectedItems = Object.values(selection.selections).map(
    entry => entry.item
  );

  selectedItems.forEach(item => {
    assert.ok(Number.isFinite(item.priceAUD));
    assert.ok(item.priceAUD > 0);
  });

  const expectedTotal = selectedItems.reduce(
    (total, item) => total + item.priceAUD,
    0
  );

  assert.equal(selection.currency, "AUD");
  assert.equal(selection.preliminaryTotalCostAUD, expectedTotal);
});

test("CSC-63 no-match condition returns warning", () => {
  const result = calculateDesign({
    ...spnDesignCase,
    peakFlowM3h: 100,
    averageFlowM3h: 80,
    titrationDoseMlPerL: 5,
    storageDays: 7
  });

  assert.ok(result.equipmentSelection.warnings.length > 0);
});

test("CSC-63 calculation output retains equipment and pipe recommendations", () => {
  const result = calculateDesign(spnDesignCase);

  assert.ok(result.equipmentSelection);
  assert.ok(result.pipes);
  assert.ok(result.skidFeasibility);
  assert.ok(Array.isArray(result.warnings));
});
