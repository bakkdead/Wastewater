# Input Parameter Definition

## 1. Project & Site
- Project name: required text
- Plant/site name: required text
- Wastewater source: required selection
- Notes: optional text

## 2. Hydraulic Conditions
- Average flow (m3/h): 0.01-500
- Peak flow (m3/h): 0.01-1000 and must be >= average flow
- Operating hours/day: 1-24

## 3. Wastewater Characteristics
- Current pH: 0-14
- Temperature (C): 0-90
- FOG (mg/L): >= 0
- TSS (mg/L): >= 0
- COD (mg/L): >= 0
- Alkalinity (mg/L as CaCO3): >= 0
- Existing upstream treatment: optional text

## 4. Trade Waste & Target
- Minimum discharge pH: 0-14
- Maximum discharge pH: 0-14 and > minimum
- Target pH: must sit within discharge range

## 5. Chemical Dosing Data
- Chemical type: acid or alkali
- Chemical name: required
- Chemical concentration (% w/w): 0.01-100
- Density (kg/L): 0.1-3
- Bench titration dose (mL reagent/L wastewater): > 0
- Dosing design factor: 1.0-2.0
- Desired storage days: 0.5-60

Why bench titration is included:
pH alone does not represent wastewater buffering capacity. Two samples at the same pH can require different neutralising doses. A representative titration or validated dose-response test therefore provides a calculation-ready neutralisation demand.

Prototype peak chemical solution flow:
Peak flow (m3/h) x titration dose (mL/L) x design factor = chemical solution flow (L/h)

## 6. Skid & Control Constraints
- Maximum skid length (m)
- Maximum skid width (m)
- Maximum skid height (m)
- Available electrical supply
- Control mode
- Communication protocol

The skid dimensions are editable. The project brief states the skid should remain within transport constraints comparable to a 20 ft container, so the final limits should be confirmed against the actual transport requirement.
