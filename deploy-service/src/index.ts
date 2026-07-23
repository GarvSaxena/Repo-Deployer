import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
    console.log(".env found at:", envPath);
    dotenv.config({ path: envPath });
} else if (fs.existsSync(rootEnvPath)) {
    console.log(".env found at root:", rootEnvPath);
    dotenv.config({ path: rootEnvPath });
} else {
    console.log("WARNING: No .env file found in deploy-service or root directory!");
}

import { createClient, commandOptions } from "redis";
import { downloadS3Folder } from "./aws.js";

const subscriber = createClient();

async function main() {
    await subscriber.connect();
    console.log("Connected to Redis, listening for queue...");
    while(1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
        );
        // @ts-ignore
        const id = res.element;

        await downloadS3Folder(`output/${id}`);
        console.log("downloaded");
    }
}

main();