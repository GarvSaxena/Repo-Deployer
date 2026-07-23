import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";

export function buildProject(id: string) {
    return new Promise((resolve) => {
        const projectPath = path.join(__dirname, `output/${id}`);
        if (!fs.existsSync(path.join(projectPath, 'package.json'))) {
            console.log("No package.json found, skipping build step.");
            resolve("");
            return;
        }

        const child = exec(`cd ${projectPath} && npm install && npm run build`);

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
           resolve("");
        });
    });
}
