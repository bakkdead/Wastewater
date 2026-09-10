import express from "express";
import cors from "cors";
import { run, get, all } from "./db.js";
import { validateSubmission } from "./validation.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/submissions", async (_req, res) => {
  try {
    const rows = await all(`
      SELECT id, project_name, site_name, created_at, updated_at
      FROM questionnaire_submissions
      ORDER BY updated_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Could not load submissions." });
  }
});

app.get("/api/submissions/:id", async (req, res) => {
  try {
    const row = await get(
      `SELECT * FROM questionnaire_submissions WHERE id = ?`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: "Submission not found." });

    res.json({
      id: row.id,
      projectName: row.project_name,
      siteName: row.site_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      data: JSON.parse(row.payload)
    });
  } catch {
    res.status(500).json({ error: "Could not retrieve submission." });
  }
});

app.post("/api/submissions", async (req, res) => {
  const errors = validateSubmission(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  try {
    const result = await run(
      `INSERT INTO questionnaire_submissions
       (project_name, site_name, payload)
       VALUES (?, ?, ?)`,
      [req.body.projectName, req.body.siteName, JSON.stringify(req.body)]
    );
    res.status(201).json({ id: result.id });
  } catch {
    res.status(500).json({ error: "Could not save submission." });
  }
});

app.put("/api/submissions/:id", async (req, res) => {
  const errors = validateSubmission(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  try {
    const result = await run(
      `UPDATE questionnaire_submissions
       SET project_name = ?, site_name = ?, payload = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.body.projectName, req.body.siteName, JSON.stringify(req.body), req.params.id]
    );
    if (!result.changes) return res.status(404).json({ error: "Submission not found." });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Could not update submission." });
  }
});

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});
