import express from "express";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { S3, Credentials } = AWS;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
} else {
    console.log("WARNING: No .env file found in request-handler or root directory!");
}

const s3 = new S3({
    credentials: new Credentials({
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    }),
    endpoint: process.env.R2_ENDPOINT || "",
    s3ForcePathStyle: true,
    region: "auto"
});

const app = express();

app.get("/*", async (req, res) => {
    // Example: id.100xdevs.com -> id
    const host = req.hostname;
    const id = host.split(".")[0];
    let filePath = req.path;
    if (filePath === "/") {
        filePath = "/index.html";
    }
    try {
        const contents = await s3.getObject({
            Bucket: process.env.R2_BUCKET_NAME || "repo-deploy",
            Key: `dist/${id}${filePath}`
        }).promise();
        
        const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript";
        res.set("Content-Type", type);

        res.send(contents.Body);
    } catch (error) {
        console.error("Error fetching file from S3:", error);
        res.status(404).send("Not Found");
    }
});

app.listen(3001, () => {
    console.log("Server started on port 3001");
});
