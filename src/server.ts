/**
 * Express Server implementation for the DeeperDive Publisher Config Tool.
 *
 * This server handles:
 * - Serving static assets (HTML, CSS, JS).
 * - Providing a REST API for reading and writing publisher configurations.
 * - Managing configuration version history.
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Directory configuration
const DATA_DIR = path.join(__dirname, "../data");
const HISTORY_DIR = path.join(DATA_DIR, "history");

// Middleware: Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Middleware: Serve static files from dist directory (compiled JS)
app.use("/dist", express.static(path.join(__dirname, "../dist")));

// Middleware: Serve static files from assets directory (images, etc.)
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Middleware: Parse JSON bodies for API requests
app.use(express.json());

/**
 * Scans the data directory for new configuration files and initializes their history.
 *
 * If a new publisher JSON file is found in 'data/' but has no corresponding
 * history folder in 'data/history/', this function creates the history folder
 * and saves the current content as 'v1.json'.
 */
const initializeHistory = async () => {
  try {
    if (!existsSync(HISTORY_DIR)) {
      await fs.mkdir(HISTORY_DIR, { recursive: true });
    }

    const files = await fs.readdir(DATA_DIR);
    for (const file of files) {
      if (path.extname(file) !== ".json") continue;

      const fileBaseName = path.parse(file).name;
      const fileHistoryDir = path.join(HISTORY_DIR, fileBaseName);

      if (!existsSync(fileHistoryDir)) {
        console.log(`New file detected: ${file}. Initializing history...`);
        const filePath = path.join(DATA_DIR, file);

        // Ensure it's a file
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) continue;

        const content = await fs.readFile(filePath, "utf-8");
        try {
          // Verify valid JSON
          JSON.parse(content);

          await fs.mkdir(fileHistoryDir, { recursive: true });
          await fs.writeFile(
            path.join(fileHistoryDir, "v1.json"),
            content,
            "utf-8"
          );
        } catch (err) {
          console.error(`Skipping invalid JSON ${file}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("Initialization failed:", error);
  }
};

/**
 * GET /api/publishers
 * Retrieves the list of all publishers.
 *
 * @returns {Array} List of publisher objects.
 */
app.get("/api/publishers", async (_req, res) => {
  try {
    const dataPath = path.join(DATA_DIR, "publishers.json");
    const data = await fs.readFile(dataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to read publishers data" });
  }
});

/**
 * GET /api/publisher/:filename
 * Retrieves a specific publisher configuration by filename.
 *
 * @param {string} filename - The name of the file (e.g., 'publisher-aurora.json').
 * @returns {Object} The publisher configuration object.
 */
app.get("/api/publisher/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const dataPath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(dataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: "Publisher config not found" });
  }
});

/**
 * PUT /api/publisher/:filename
 * Updates a specific publisher configuration and saves a new history version.
 *
 * @param {string} filename - The name of the file to update.
 * @body {Object} The new configuration content.
 * @returns {Object} Success status and the new version number.
 */
app.put("/api/publisher/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const dataPath = path.join(DATA_DIR, filename);
    const fileBaseName = path.parse(filename).name;
    const fileHistoryDir = path.join(HISTORY_DIR, fileBaseName);

    // Ensure history dir exists
    if (!existsSync(fileHistoryDir)) {
      await fs.mkdir(fileHistoryDir, { recursive: true });
    }

    // Determine next version from history files
    const files = await fs.readdir(fileHistoryDir);
    const versions = files
      .filter((f) => f.startsWith("v") && f.endsWith(".json"))
      .map((f) => parseInt(f.replace("v", "").replace(".json", ""), 10));

    const maxVersion = versions.length > 0 ? Math.max(...versions) : 0;
    const newVersion = maxVersion + 1;

    // Prepare content: Remove 'version' field if present in request body
    const newContent = { ...req.body };

    // Save main file
    await fs.writeFile(dataPath, JSON.stringify(newContent, null, 2), "utf-8");

    // Save history
    await fs.writeFile(
      path.join(fileHistoryDir, `v${newVersion}.json`),
      JSON.stringify(newContent, null, 2),
      "utf-8"
    );

    res.json({ success: true, version: newVersion });
  } catch (error) {
    res.status(500).json({ error: "Failed to save publisher config" });
  }
});

/**
 * GET /api/publisher/:filename/versions
 * Retrieves simple list of available versions for a publisher.
 *
 * @param {string} filename - The publisher filename.
 * @returns {Array<number>} List of version numbers (descending).
 */
app.get("/api/publisher/:filename/versions", async (req, res) => {
  try {
    const { filename } = req.params;
    const fileBaseName = path.parse(filename).name;
    const fileHistoryDir = path.join(HISTORY_DIR, fileBaseName);

    if (!existsSync(fileHistoryDir)) {
      return res.json([]);
    }

    const files = await fs.readdir(fileHistoryDir);
    const versions = files
      .filter((f) => f.startsWith("v") && f.endsWith(".json"))
      .map((f) => parseInt(f.replace("v", "").replace(".json", ""), 10))
      .sort((a, b) => b - a); // Descending order

    res.json(versions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch versions" });
  }
});

/**
 * GET /api/publisher/:filename/versions/:version
 * Retrieves the content of a specific version.
 *
 * @param {string} filename - The publisher filename.
 * @param {string} version - The version number.
 * @returns {Object} The configuration content for that version.
 */
app.get("/api/publisher/:filename/versions/:version", async (req, res) => {
  try {
    const { filename, version } = req.params;
    const fileBaseName = path.parse(filename).name;
    const versionFile = path.join(
      HISTORY_DIR,
      fileBaseName,
      `v${version}.json`
    );

    if (!existsSync(versionFile)) {
      return res.status(404).json({ error: "Version not found" });
    }

    const content = await fs.readFile(versionFile, "utf-8");
    res.json(JSON.parse(content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch version content" });
  }
});

// Run migration/initialization before starting server
await initializeHistory();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
