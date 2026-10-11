// CSC-58 skid feasibility layer.
// Evaluates selected Sprint 3 equipment against practical skid constraints.

export const CONTAINER_20FT = {
  lengthM: 5.90,
  widthM: 2.35,
  heightM: 2.39
};

const GAP_M = 0.12;
const AISLE_M = 0.25;

function getSelectedItems(equipmentSelection) {
  if (!equipmentSelection?.selections) return [];

  return Object.values(equipmentSelection.selections)
    .map(selection => selection?.item)
    .filter(Boolean);
}

function calculateFootprint(items) {
  if (items.length === 0) {
    return {
      usedLengthM: 0,
      usedWidthM: 0,
      maxHeightM: 0
    };
  }

  for (const item of items) {
    if (
      ![item.lengthM, item.widthM, item.heightM].every(value =>
        Number.isFinite(Number(value))
      )
    ) {
      throw new Error(`Equipment dimensions are missing for ${item.name}.`);
    }
  }

  const split = Math.ceil(items.length / 2);
  const rows = [items.slice(0, split), items.slice(split)];

  let usedLengthM = 0;
  let usedWidthM = 0;
  let maxHeightM = 0;

  rows.forEach(row => {
    if (row.length === 0) return;

    const rowLength =
      row.reduce((total, item) => total + Number(item.lengthM), 0) +
      GAP_M * Math.max(0, row.length - 1);

    const rowWidth = Math.max(
      ...row.map(item => Number(item.widthM))
    );

    usedLengthM = Math.max(usedLengthM, rowLength);
    usedWidthM += rowWidth;
    maxHeightM = Math.max(
      maxHeightM,
      ...row.map(item => Number(item.heightM))
    );
  });

  if (rows[1].length > 0) {
    usedWidthM += AISLE_M;
  }

  return {
    usedLengthM: Number(usedLengthM.toFixed(2)),
    usedWidthM: Number(usedWidthM.toFixed(2)),
    maxHeightM: Number(maxHeightM.toFixed(2))
  };
}

function suggestAlternative(items, footprint, limits) {
  const largestTank = items
    .filter(item => item.type === "tank")
    .sort(
      (a, b) =>
        b.lengthM * b.widthM - a.lengthM * a.widthM
    )[0];

  if (largestTank) {
    return {
      equipmentId: largestTank.id,
      equipmentName: largestTank.name,
      suggestion:
        `Review ${largestTank.name} for a smaller-footprint equivalent, ` +
        `split storage arrangement, or external tank installation.`
    };
  }

  return {
    equipmentId: null,
    equipmentName: null,
    suggestion:
      "Review equipment orientation or select smaller-footprint equivalent equipment."
  };
}

export function evaluateSkidFeasibility(
  equipmentSelection,
  designLimits = {}
) {
  const items = getSelectedItems(equipmentSelection);
  const footprint = calculateFootprint(items);

  const requestedLengthM =
    Number(designLimits.maxSkidLengthM) || CONTAINER_20FT.lengthM;

  const requestedWidthM =
    Number(designLimits.maxSkidWidthM) || CONTAINER_20FT.widthM;

  const requestedHeightM =
    Number(designLimits.maxSkidHeightM) || CONTAINER_20FT.heightM;

  const effectiveLimits = {
    lengthM: Math.min(requestedLengthM, CONTAINER_20FT.lengthM),
    widthM: Math.min(requestedWidthM, CONTAINER_20FT.widthM),
    heightM: Math.min(requestedHeightM, CONTAINER_20FT.heightM)
  };

  const withinContainer =
    footprint.usedLengthM <= CONTAINER_20FT.lengthM &&
    footprint.usedWidthM <= CONTAINER_20FT.widthM &&
    footprint.maxHeightM <= CONTAINER_20FT.heightM;

  const withinDesignLimits =
    footprint.usedLengthM <= effectiveLimits.lengthM &&
    footprint.usedWidthM <= effectiveLimits.widthM &&
    footprint.maxHeightM <= effectiveLimits.heightM;

  const warnings = [];

  if (!withinContainer) {
    warnings.push(
      "Selected equipment cannot reasonably fit within the 20-ft container design boundary."
    );
  }

  if (withinContainer && !withinDesignLimits) {
    warnings.push(
      "Selected equipment fits within the 20-ft container boundary but exceeds the specified skid-space constraint."
    );
  }

  if (equipmentSelection?.warnings?.length) {
    warnings.push(...equipmentSelection.warnings);
  }

  let status = "feasible";

  if (!withinContainer) {
    status = "infeasible";
  } else if (
    !withinDesignLimits ||
    (equipmentSelection?.warnings?.length ?? 0) > 0
  ) {
    status = "review required";
  }

  const alternative =
    status === "feasible"
      ? null
      : suggestAlternative(items, footprint, effectiveLimits);

  return {
    status,
    container: CONTAINER_20FT,
    effectiveLimits,
    footprint,
    withinContainer,
    withinDesignLimits,
    warnings,
    alternative,

    // Retain Sprint 3 preliminary pricing.
    preliminaryTotalCostAUD:
      equipmentSelection?.preliminaryTotalCostAUD ?? 0,
    currency: equipmentSelection?.currency ?? "AUD",

    selectedEquipment: items
  };
}
