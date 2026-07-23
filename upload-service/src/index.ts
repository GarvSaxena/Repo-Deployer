import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

let envResult;
if (fs.existsSync(envPath)) {
    console.log(".env found at:", envPath);
    envResult = dotenv.config({ path: envPath });
} else if (fs.existsSync(rootEnvPath)) {
    console.log(".env found at root:", rootEnvPath);
    envResult = dotenv.config({ path: rootEnvPath });
} else {
    console.log("WARNING: No .env file found in upload-service or root directory!");
}

if (envResult && envResult.parsed) {
    console.log("Loaded keys from .env:", Object.keys(envResult.parsed));
}

import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generateShortId } from "./utils.js";
import { getFilesArray } from "./file.js";
import { uploadFile } from "./r2.js";
import { createClient } from "redis";

const publisher = createClient();
await publisher.connect();
console.log("Connected to Redis");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl || req.body.repoURL;
    if (!repoUrl || typeof repoUrl !== "string") {
        res.status(400).json({ error: "repoUrl is required" });
        return;
    }
    const id = generateShortId();

    try {
        process.env.GIT_TERMINAL_PROMPT = "0";
        await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`), ['--depth', '1']);
    } catch (e: any) {
        console.error("Git clone error:", e);
        res.status(400).json({ error: "Failed to clone repository. Ensure the repository URL is public and valid.", details: e?.message });
        return;
    }

    console.log("Cloned repo:", repoUrl);

    const files = getFilesArray(path.join(__dirname, `output/${id}`));

    try {
        await Promise.all(files.map(async file => {
            const key = file.slice(__dirname.length + 1).split(path.sep).join("/");
            await uploadFile(key, file);
        }));
    } catch (e: any) {
        console.error("R2 Upload error:", e);
        res.status(500).json({ error: "Failed to upload files to R2. Please check your R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT in upload-service/.env", details: e?.message });
        return;
    }

    await publisher.lPush("build-queue", id);

    res.json({
        id: id
    });
});

app.listen(PORT, () => console.log("Server Started"));
