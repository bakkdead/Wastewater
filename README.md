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
