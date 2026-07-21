import fs from "fs"
import path from "path"

export const getFilesArray = (folderPath: string) =>{

    let response: string[] = [];

    const allDirFilesAndFolders = fs.readdirSync(folderPath);
    allDirFilesAndFolders.forEach(file =>{
        const fullFilePath = path.join(folderPath, file);
        if(fs.statSync(fullFilePath).isDirectory()){
            if(file === ".git") return; // skip .git folder
            response = response.concat(getFilesArray(fullFilePath))
        }
        else{
            response.push(fullFilePath) 
        }
    })
    return response;
} 