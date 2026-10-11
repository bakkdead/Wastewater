// Supported neutralisation reagents. Selection does NOT validate concentration, density,
// titration results or chemical compatibility; those require engineering review.
export const SUPPORTED_CHEMICALS = [
  { name: "Sodium hydroxide", type: "alkali", formula: "NaOH" },
  { name: "Potassium hydroxide", type: "alkali", formula: "KOH" },
  { name: "Calcium hydroxide", type: "alkali", formula: "Ca(OH)₂" },
  { name: "Hydrochloric acid", type: "acid", formula: "HCl" },
  { name: "Sulfuric acid", type: "acid", formula: "H₂SO₄" }
];
export function findSupportedChemical(name) {
  return SUPPORTED_CHEMICALS.find(c => c.name === name) || null;
}
