import express from "express"
import cors from "cors"
import {simpleGit} from "simple-git" //interface for running git commands in node js applications
import { generateShortId } from "./utils.js";


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
    await simpleGit().clone(repoURL,`./output/${ShortId}` )
    console.log(repoURL)
    res.json({ id: ShortId, status: "cloned" });
})

app.listen(PORT,()=> console.log("Server Started"))