# Generalized Wastewater Treatment Skid - Input Questionnaire

This module satisfies the user story:

As a user, I want to enter my plant's wastewater parameters through a guided questionnaire so that the tool can calculate the right skid design.

Acceptance criteria covered:
- All input parameters defined and documented
- Working input form
- Client-side and server-side validation
- Inputs saved to SQLite
- Saved inputs can be retrieved and updated

Stack:
- React + Vite
- Node.js + Express
- SQLite

Run:
1. `npm install`
2. `npm run install:all`
3. `npm run dev`
4. Open the Vite URL, normally http://localhost:5173

API:
- GET /api/submissions
- GET /api/submissions/:id
- POST /api/submissions
- PUT /api/submissions/:id

Engineering note:
pH alone is not sufficient to calculate a reliable neutralising chemical dose because buffering capacity can vary. The questionnaire therefore captures a representative bench-titration dose. Real chemical selection, compatibility, equipment sizing and final design must be verified by a qualified engineer.

## 2D Skid Layout

The prototype now includes a top-down SVG skid layout generated from questionnaire/calculation inputs. It:

- Displays a conceptual 20 ft container footprint of 5.90 m x 2.35 m.
- Shows major equipment with labels, including equalisation tank, pH correction tank, feed pump, dosing pump and control panel.
- Uses the prototype calculation-engine adapter in `client/src/calcEngine.js` to produce equipment footprints from the questionnaire inputs.
- Flags when the generated equipment footprint exceeds the 20 ft container or the user's skid constraints.
- Clearly labels the output as conceptual so validated engineering calculations can replace the prototype assumptions later.

## Integrated design workflow

The application now demonstrates the complete capstone flow in one React application:

1. Enter and validate wastewater/design inputs.
2. Click **Calculate Skid Design**.
3. Review chemical dosing and equipment recommendations.
4. Pass the recommended equipment into the SVG 2D layout.
5. Check the generated skid footprint against the 20-ft boundary.
6. Use **Load SPN example** for a complete demonstration dataset.

Calculation/equipment errors are caught and displayed in the UI rather than crashing the application. Equipment sizing remains conceptual for the capstone prototype and must be replaced/verified with validated engineering calculations before real-world use.


## Final integrated demonstration workflow

The application now demonstrates one continuous flow:

**Inputs → validation → calculation engine → structured output → tank/pump/pipe/dosing results → equipment recommendations → 2D skid layout**

Use **Load SPN example** for the prepared demonstration case. Its values are prototype/test data, not verified client engineering data.

### CSC-56 integration note

The approved CSC-56 schema was not included in the previous ZIP used for this update. The project therefore uses a clearly labelled `CSC-56-PROTOTYPE` structured result and consumes it through `normaliseCsc56Output()` in `client/src/calcEngine.js`.

When the team's actual CSC-56 JSON/schema is supplied, update that adapter in one place rather than rewriting the UI. Unsupported structures produce a readable error instead of crashing.

### Reliability fix

The initial 2D layout state is now null-safe, fixing the previous white-screen error caused by reading `layout.withinLimits` before a calculation had produced a layout.

## Additional capstone demonstration modules (October 2026)

After **Calculate Skid Design**, the application now offers:

- **3D skid schematic**: dependency-free SVG isometric representation of the computed 2D equipment layout. Use **Rotate view** for four orientations. All elevations are approximate and *not fabrication-ready*.
- **Automated pH correction demonstration**: enter a simulated pH measurement, choose Auto simulation, and inspect indicative proportional chemical dosing, deadband, invalid measurement, discharge pH and chemical mismatch safety states. **It is not connected to any field equipment, PLC, control loop or plant sensor. Do not operate a dosing system using this code.**
- **Electrical I/O schedule**: a provisional list of pH/flow inputs, low-level and E-stop inputs, pump and alarm outputs and the selected HMI/PLC communication protocol.
- **Operator communication log**: write session-only handover messages and download them as a JSON file. This is not real-time personnel messaging; closing/reloading the page clears the log unless exported.
- **Other treatment requirements**: advisory cards for screening, DAF/FOG, TSS, COD, pH and discharge compliance. The example trigger values are illustrative only and require agreement/site data before use.

### Validation and limitations

These additions are **educational/prototype scope**. No hardware actuation, process safety certification, live communications, actual PLC/HMI integration, pH kinetic model, verified design drawing or environmental compliance guarantee is provided. The engineering example is not a valid substitute for bench titration data, process review, site permitting or qualified engineering approval.
