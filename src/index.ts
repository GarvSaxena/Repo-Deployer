import express from "express"
import cors from "cors"
const app = express()
const PORT = 3000;
app.use(cors())
app.use(express.json())
app.post("/deploy", (req,res)=> {
    const repoURL = req.body.repoURL;  // Github url
    console.log(repoURL) 
})

app.listen(PORT,()=> console.log("Server Started"))