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
