import express from "express"
import cors from "cors"
import {simpleGit} from "simple-git" //interface for running git commands in node js applications
import { generateShortId } from "./utils.js";
import path from "path"
import { fileURLToPath } from "url";
import { getFilesArray } from "./file.js";
import { uploadFile } from "./r2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PORT = 3000;

app.use(cors())
app.use(express.json())
app.post("/deploy", async (req,res)=> {
    const repoURL = req.body.repoURL;  // Github url
    if (!repoURL || typeof repoURL !== "string") {
        res.status(400).json({ error: "repoURL is required" });
        return;
    }
    const id = generateShortId();
    await simpleGit().clone(repoURL, path.join(__dirname, `output/${id}`), ['--depth', '1'])
    console.log(repoURL)

    const files = getFilesArray(path.join(__dirname, `output/${id}`))

    const outputDir = path.join(__dirname, `output`);
    await Promise.all(files.map(async file => {
        const key = file.slice(outputDir.length + 1).split(path.sep).join("/");
        await uploadFile(key, file);
    }))

    res.json({
        id: id
    });
})

app.listen(PORT,()=> console.log("Server Started"))

