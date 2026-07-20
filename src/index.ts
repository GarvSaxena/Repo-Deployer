import express from "express"
import cors from "cors"
import {simpleGit} from "simple-git" //interface for running git commands in node js applications
import { generateShortId } from "./utils.js";
import path from "path"
import { fileURLToPath } from "url";
import { getFilesArray } from "./file.js";

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
    const ShortId = generateShortId();
    await simpleGit().clone(repoURL, path.join(__dirname, `./output/${ShortId}`), ['--depth', '1'])
    console.log(repoURL)

    const allFiles = getFilesArray(path.join(__dirname, `./output/${ShortId}`))
    res.json({ id: ShortId, status: "cloned" });

    // aws-sdk will be used , but we have a method to upload files not directory, So we have to create a array of all the files in the directory(output/id)
})

app.listen(PORT,()=> console.log("Server Started"))