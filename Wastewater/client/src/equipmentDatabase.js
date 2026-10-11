// CSC-55 equipment catalogue and selection logic.
// Prices are preliminary estimates only and are intended for concept-level costing.

// CSC-58 uses preliminary concept-level dimensions for skid feasibility.
// Dimensions are in metres and are not final manufacturer dimensions.

export const tanks = [
  { id: "TANK-500", type: "tank", name: "500 L Tank", capacityL: 500, priceAUD: 850, lengthM: 0.75, widthM: 0.75, heightM: 1.10 },
  { id: "TANK-1000", type: "tank", name: "1,000 L Tank", capacityL: 1000, priceAUD: 1200, lengthM: 1.00, widthM: 1.00, heightM: 1.35 },
  { id: "TANK-2000", type: "tank", name: "2,000 L Tank", capacityL: 2000, priceAUD: 1850, lengthM: 1.25, widthM: 1.25, heightM: 1.65 },
  { id: "TANK-3000", type: "tank", name: "3,000 L Tank", capacityL: 3000, priceAUD: 2400, lengthM: 1.45, widthM: 1.45, heightM: 1.85 },
  { id: "TANK-5000", type: "tank", name: "5,000 L Tank", capacityL: 5000, priceAUD: 3400, lengthM: 1.75, widthM: 1.75, heightM: 2.10 },
  { id: "TANK-10000", type: "tank", name: "10,000 L Tank", capacityL: 10000, priceAUD: 5800, lengthM: 2.20, widthM: 2.20, heightM: 2.45 }
];

export const feedPumps = [
  { id: "FP-5", type: "feed-pump", name: "5 m3/h Feed Pump", flowM3h: 5, priceAUD: 900, lengthM: 0.55, widthM: 0.35, heightM: 0.45 },
  { id: "FP-10", type: "feed-pump", name: "10 m3/h Feed Pump", flowM3h: 10, priceAUD: 1250, lengthM: 0.60, widthM: 0.40, heightM: 0.50 },
  { id: "FP-20", type: "feed-pump", name: "20 m3/h Feed Pump", flowM3h: 20, priceAUD: 1800, lengthM: 0.70, widthM: 0.45, heightM: 0.55 },
  { id: "FP-30", type: "feed-pump", name: "30 m3/h Feed Pump", flowM3h: 30, priceAUD: 2400, lengthM: 0.80, widthM: 0.50, heightM: 0.60 },
  { id: "FP-50", type: "feed-pump", name: "50 m3/h Feed Pump", flowM3h: 50, priceAUD: 3300, lengthM: 0.90, widthM: 0.55, heightM: 0.65 }
];

export const dosingPumps = [
  { id: "DP-10", type: "dosing-pump", name: "10 L/h Dosing Pump", flowLh: 10, priceAUD: 650, lengthM: 0.35, widthM: 0.25, heightM: 0.35 },
  { id: "DP-25", type: "dosing-pump", name: "25 L/h Dosing Pump", flowLh: 25, priceAUD: 850, lengthM: 0.40, widthM: 0.30, heightM: 0.40 },
  { id: "DP-50", type: "dosing-pump", name: "50 L/h Dosing Pump", flowLh: 50, priceAUD: 1100, lengthM: 0.45, widthM: 0.30, heightM: 0.45 },
  { id: "DP-100", type: "dosing-pump", name: "100 L/h Dosing Pump", flowLh: 100, priceAUD: 1500, lengthM: 0.50, widthM: 0.35, heightM: 0.50 },
  { id: "DP-200", type: "dosing-pump", name: "200 L/h Dosing Pump", flowLh: 200, priceAUD: 2100, lengthM: 0.60, widthM: 0.40, heightM: 0.55 }
];

function selectSmallestSuitable(items, requiredValue, capacityField, label) {
  const sorted = [...items].sort(
    (a, b) => a[capacityField] - b[capacityField]
  );

  const match = sorted.find(
    item => item[capacityField] >= requiredValue
  );

  if (match) {
    return {
      item: match,
      warning: null
    };
  }

  const closest = sorted[sorted.length - 1];

  return {
    item: closest,
    warning:
      `No ${label} fully meets the required capacity of ${requiredValue}. ` +
      `Closest available option ${closest.name} has been selected for preliminary review.`
  };
}

export function selectEquipment(calculationOutput) {
  const selections = {
    equalisationTank: selectSmallestSuitable(
      tanks,
      calculationOutput.tanks.equalisationL,
      "capacityL",
      "equalisation tank"
    ),

    correctionTank: selectSmallestSuitable(
      tanks,
      calculationOutput.tanks.correctionL,
      "capacityL",
      "pH correction tank"
    ),

    chemicalTank: selectSmallestSuitable(
      tanks,
      calculationOutput.tanks.chemicalStorageL,
      "capacityL",
      "chemical tank"
    ),

    feedPump: selectSmallestSuitable(
      feedPumps,
      calculationOutput.pumps.feedM3h,
      "flowM3h",
      "feed pump"
    ),

    dosingPump: selectSmallestSuitable(
      dosingPumps,
      calculationOutput.pumps.dosingLh,
      "flowLh",
      "dosing pump"
    )
  };

  const selectedItems = Object.values(selections).map(
    selection => selection.item
  );

  const warnings = Object.values(selections)
    .map(selection => selection.warning)
    .filter(Boolean);

  const preliminaryTotalCostAUD = selectedItems.reduce(
    (total, item) => total + item.priceAUD,
    0
  );

  return {
    selections,
    preliminaryTotalCostAUD,
    currency: "AUD",
    warnings
  };
}
