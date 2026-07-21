import AWS from "aws-sdk";
const { S3 } = AWS;
import dotenv from "dotenv"
import fs from "fs"
dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    endpoint: process.env.R2_ENDPOINT!,
})

export const uploadFile = async (fileName: string, localFilePath: string) => {
    console.log("Called")
    const fileContent = fs.readFileSync(localFilePath)
    const response = s3.upload({
        Body:fileContent,
        Bucket: "repo-deploy",
        Key: fileName,
    }).promise()
    console.log(response)
}