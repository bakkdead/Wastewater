import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSkidFeasibility } from "./skidFeasibility.js";

function makeSelection(items, warnings = []) {
  const selections = {};

  items.forEach((item, index) => {
    selections[`item${index + 1}`] = {
      item,
      warning: null
    };
  });

  return {
    selections,
    warnings,
    preliminaryTotalCostAUD: items.reduce(
      (total, item) => total + item.priceAUD,
      0
    ),
    currency: "AUD"
  };
}

test("CSC-58 returns feasible when equipment fits skid constraints", () => {
  const selection = makeSelection([
    {
      id: "TANK-1000",
      type: "tank",
      name: "1,000 L Tank",
      lengthM: 1.0,
      widthM: 0.8,
      heightM: 1.5,
      priceAUD: 1200
    },
    {
      id: "FP-10",
      type: "feed-pump",
      name: "10 m3/h Feed Pump",
      lengthM: 0.7,
      widthM: 0.5,
      heightM: 0.7,
      priceAUD: 1250
    }
  ]);

  const result = evaluateSkidFeasibility(selection);

  assert.equal(result.status, "feasible");
  assert.equal(result.withinContainer, true);
  assert.equal(result.withinDesignLimits, true);
  assert.equal(result.alternative, null);
});

test("CSC-58 returns review required when equipment exceeds user skid limit", () => {
  const selection = makeSelection([
    {
      id: "TANK-3000",
      type: "tank",
      name: "3,000 L Tank",
      lengthM: 2.0,
      widthM: 1.5,
      heightM: 2.0,
      priceAUD: 2400
    },
    {
      id: "FP-20",
      type: "feed-pump",
      name: "20 m3/h Feed Pump",
      lengthM: 1.0,
      widthM: 0.6,
      heightM: 0.8,
      priceAUD: 1800
    }
  ]);

  const result = evaluateSkidFeasibility(selection, {
    maxSkidLengthM: 2.5,
    maxSkidWidthM: 1.2,
    maxSkidHeightM: 2.3
  });

  assert.equal(result.status, "review required");
  assert.equal(result.withinContainer, true);
  assert.equal(result.withinDesignLimits, false);
  assert.ok(result.warnings.length > 0);
  assert.ok(result.alternative);
});

test("CSC-58 returns infeasible when equipment exceeds 20-ft boundary", () => {
  const selection = makeSelection([
    {
      id: "TANK-LARGE-1",
      type: "tank",
      name: "Large Process Tank",
      lengthM: 4.0,
      widthM: 2.5,
      heightM: 2.5,
      priceAUD: 5000
    },
    {
      id: "TANK-LARGE-2",
      type: "tank",
      name: "Large Storage Tank",
      lengthM: 4.0,
      widthM: 2.5,
      heightM: 2.5,
      priceAUD: 5000
    }
  ]);

  const result = evaluateSkidFeasibility(selection);

  assert.equal(result.status, "infeasible");
  assert.equal(result.withinContainer, false);
  assert.ok(result.warnings.length > 0);
  assert.ok(result.alternative);
});

test("CSC-58 retains Sprint 3 preliminary equipment pricing", () => {
  const selection = makeSelection([
    {
      id: "TANK-1000",
      type: "tank",
      name: "1,000 L Tank",
      lengthM: 1.0,
      widthM: 0.8,
      heightM: 1.5,
      priceAUD: 1200
    },
    {
      id: "DP-50",
      type: "dosing-pump",
      name: "50 L/h Dosing Pump",
      lengthM: 0.5,
      widthM: 0.4,
      heightM: 0.6,
      priceAUD: 1100
    }
  ]);

  const result = evaluateSkidFeasibility(selection);

  assert.equal(result.preliminaryTotalCostAUD, 2300);
  assert.equal(result.currency, "AUD");
});

test("CSC-58 includes selected equipment and footprint in result", () => {
  const selection = makeSelection([
    {
      id: "TANK-500",
      type: "tank",
      name: "500 L Tank",
      lengthM: 0.8,
      widthM: 0.7,
      heightM: 1.2,
      priceAUD: 850
    }
  ]);

  const result = evaluateSkidFeasibility(selection);

  assert.equal(result.selectedEquipment.length, 1);
  assert.equal(result.selectedEquipment[0].id, "TANK-500");
  assert.ok(result.footprint);
  assert.equal(typeof result.footprint.usedLengthM, "number");
  assert.equal(typeof result.footprint.usedWidthM, "number");
});
