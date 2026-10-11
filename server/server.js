import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
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

// Delete a saved questionnaire by ID. Use a parameterized query to avoid SQL injection.
app.delete("/api/submissions/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid submission ID." });
  }
  try {
    const result = await run(
      "DELETE FROM questionnaire_submissions WHERE id = ?",
      [id]
    );
    if (!result.changes) {
      return res.status(404).json({ error: "Saved questionnaire not found." });
    }
    res.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("Could not delete questionnaire:", error);
    res.status(500).json({ error: "Could not delete saved questionnaire." });
  }
});

// Serve the built React site and API from the same Render service.
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

const port = Number(process.env.PORT || 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Wastewater app listening on port ${port}`);
});
