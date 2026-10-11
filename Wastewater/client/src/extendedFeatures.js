/** Demonstration aids only. Not a validated process-control system. */
export function controlDecision({ measuredPh, targetPh, minPh, maxPh, enabled, chemicalType, tolerance = 0.15 }) {
  const ph = Number(measuredPh), target = Number(targetPh);
  if (![ph, target, Number(minPh), Number(maxPh)].every(Number.isFinite) || ph < 0 || ph > 14) {
    return { state: 'INVALID SENSOR', output: 0, alarm: 'Invalid pH measurement. Simulated dosing inhibited.' };
  }
  if (!enabled) return { state: 'MANUAL / STOP', output: 0, alarm: 'Automatic operation disabled.' };
  if (ph < Number(minPh) || ph > Number(maxPh)) {
    return { state: 'DISCHARGE ALARM', output: 0, alarm: 'Measured pH outside discharge window. Simulated dosing inhibited; divert/hold wastewater for operator review.' };
  }
  if (Math.abs(ph - target) <= tolerance) return { state: 'AT SETPOINT', output: 0, alarm: '' };
  const needsAlkali = ph < target;
  const isAlkali = String(chemicalType).toLowerCase().includes('alkali');
  if (needsAlkali !== isAlkali) return { state: 'WRONG REAGENT', output: 0, alarm: 'Configured chemical cannot correct pH in this direction. Simulated dosing inhibited.' };
  return { state: 'SIMULATED DOSING', output: Math.min(100, Math.round(15 + Math.abs(target - ph) * 22)), alarm: '' };
}
export function electricalIO(values) {
  const protocol = values.communicationProtocol || 'Protocol TBD';
  return [
    ['AI-01', 'pH probe / transmitter', '4–20 mA analogue input', 'pH feedback'],
    ['AI-02', 'Process flow transmitter', '4–20 mA analogue input', 'Flow monitoring'],
    ['DI-01', 'Low chemical tank level', 'Dry contact input', 'Dose inhibition / alarm'],
    ['DI-02', 'E-stop / safety chain status', 'Dry contact input', 'Hardwired interlock required'],
    ['DO-01', 'Chemical dosing pump enable', 'Relay/digital output', 'Command (proposed only)'],
    ['AO-01', 'Dosing pump speed reference', '4–20 mA analogue output', 'Modulated dose (proposed only)'],
    ['DO-02', 'High/low pH alarm beacon', 'Relay/digital output', 'Operator alarm'],
    ['COM-01', 'PLC / HMI communications', protocol, 'Operator telemetry (proposed only)']
  ];
}
export function treatmentAdvisory(values) {
  const recommendations = [
    ['Screening', 'Remove large solids before downstream equipment.', 'General preliminary stage'],
    ['DAF / FOG removal', 'Assess flotation and chemical pre-treatment for dairy fats, oil and grease.', Number(values.fogMgL) >= 200 ? 'Priority review: entered FOG ≥ 200 mg/L (illustrative trigger)' : 'Review site-specific requirement'],
    ['Suspended solids', 'Assess screening, settling or DAF based on measured TSS.', Number(values.tssMgL) >= 500 ? 'Priority review: entered TSS ≥ 500 mg/L (illustrative trigger)' : 'Review site-specific requirement'],
    ['Organics / COD', 'Assess biological or other downstream treatment if discharge limits require.', Number(values.codMgL) >= 1500 ? 'Priority review: entered COD ≥ 1500 mg/L (illustrative trigger)' : 'Review site-specific requirement'],
    ['pH neutralisation', 'Provide chemical dosing, contact/mixing tank, pH sensor and hold/divert strategy.', 'Main scope of this prototype'],
    ['Trade waste compliance', 'Confirm site permit limits, sampling, alarms and discharge approval.', 'External acceptance criteria required']
  ];
  return recommendations;
}
