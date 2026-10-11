# Deploy to Render (one web service)

1. Push the contents of this `Wastewater` folder to your GitHub repository root.
2. In Render, use **New > Web Service**, connect `bakkdead/Wastewater`, branch `main`.
3. Set Runtime to Node and configure:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
   - **Environment variable:** `NODE_VERSION=22.16.0`
4. Deploy and open the provided `.onrender.com` URL.

Render may also offer deployment from `render.yaml` as a Blueprint.

The SQLite database defaults to `server/wastewater.db`, which is stored on the service's ephemeral filesystem; records can disappear on redeploy/restart. To retain records, use a paid persistent disk at e.g. `/var/data` and set `DATABASE_PATH=/var/data/wastewater.db`, or migrate to a hosted database. Render's free service cannot attach a persistent disk.

The simulated controller is not connected to physical dosing equipment. Operator messages are session-only in browser memory; they can be exported as JSON.

## Delete saved questionnaires

The Saved inputs panel now includes a **Delete** button alongside each questionnaire.
Confirm the prompt to permanently delete that record from the SQLite database.
The backend route is `DELETE /api/submissions/:id`, which returns `{ "ok": true, "deletedId": id }`.

**Security:** The demo currently has no user authentication. Anyone with network access to the public app can create, modify or delete submissions. Restrict access or add authentication and authorization before using real customer data.

**Hosting:** On a free Render instance, SQLite files on the local filesystem may be lost on redeploy/restart. Consider persistent storage for production use.

## October update — safer input and equipment matching

- Equipment capacities are now explicitly checked. If the demand exceeds the catalogue, the closest smaller equipment is **reference only**, no complete cost estimate is produced, and the UI states **No suitable equipment found / current database cannot meet requirement**.
- The supported neutralisation chemicals are sodium hydroxide, potassium hydroxide, calcium hydroxide, hydrochloric acid, and sulfuric acid. Other names are rejected by client and server. Selecting a known chemical does **not** validate its concentration, density, compatibility, or laboratory titration; qualified engineering review remains required.
- 2D/3D drawings retain fixed conceptual geometry; they must not be treated as proof that the selected equipment fits.
- Back navigation is next to Save; the Delete button in Saved inputs and a Delete this submission button when editing delete the record via DELETE /api/submissions/:id.
- Saved questionnaire deletion is currently unauthenticated: do not put real customer data on the public website without adding authentication and authorisation.
