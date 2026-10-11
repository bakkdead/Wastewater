import test from "node:test";
import assert from "node:assert/strict";
import { selectEquipment } from "./equipmentDatabase.js";

test("CSC-55 selects the smallest suitable equipment", () => {
  const result = selectEquipment({
    tanks: {
      equalisationL: 2000,
      correctionL: 1000,
      chemicalStorageL: 2700
    },
    pumps: {
      feedM3h: 24,
      dosingLh: 60
    }
  });

  assert.equal(result.selections.equalisationTank.item.capacityL, 2000);
  assert.equal(result.selections.correctionTank.item.capacityL, 1000);
  assert.equal(result.selections.chemicalTank.item.capacityL, 3000);
  assert.equal(result.selections.feedPump.item.flowM3h, 30);
  assert.equal(result.selections.dosingPump.item.flowLh, 100);
});

test("CSC-55 equipment entries include preliminary pricing", () => {
  const result = selectEquipment({
    tanks: {
      equalisationL: 2000,
      correctionL: 1000,
      chemicalStorageL: 2700
    },
    pumps: {
      feedM3h: 24,
      dosingLh: 60
    }
  });

  assert.equal(result.selections.equalisationTank.item.priceAUD, 1850);
  assert.equal(result.selections.correctionTank.item.priceAUD, 1200);
  assert.equal(result.selections.chemicalTank.item.priceAUD, 2400);
  assert.equal(result.selections.feedPump.item.priceAUD, 2400);
  assert.equal(result.selections.dosingPump.item.priceAUD, 1500);
});

test("CSC-55 calculates preliminary total equipment cost", () => {
  const result = selectEquipment({
    tanks: {
      equalisationL: 2000,
      correctionL: 1000,
      chemicalStorageL: 2700
    },
    pumps: {
      feedM3h: 24,
      dosingLh: 60
    }
  });

  assert.equal(result.preliminaryTotalCostAUD, 9350);
  assert.equal(result.currency, "AUD");
});

test("CSC-55 handles no-match cases with closest option and warning", () => {
  const result = selectEquipment({
    tanks: {
      equalisationL: 15000,
      correctionL: 12000,
      chemicalStorageL: 11000
    },
    pumps: {
      feedM3h: 70,
      dosingLh: 300
    }
  });

  assert.equal(result.selections.equalisationTank.item.capacityL, 10000);
  assert.equal(result.selections.feedPump.item.flowM3h, 50);
  assert.equal(result.selections.dosingPump.item.flowLh, 200);
  assert.ok(result.warnings.length > 0);
});
