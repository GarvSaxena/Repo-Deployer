import AWS from "aws-sdk";
const { S3, Credentials } = AWS;
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const endpoint = process.env.R2_ENDPOINT;
    if (!endpoint) {
        throw new Error("R2_ENDPOINT is missing or empty in environment variables.");
    }

    const s3 = new S3({
        credentials: new Credentials({
            accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        }),
        endpoint: endpoint,
        signatureVersion: "v4",
        region: "auto",
        s3ForcePathStyle: true,
    });

    console.log("Uploading file to R2:", fileName);
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "repo-deploy",
        Key: fileName,
    }).promise();
    console.log("R2 upload success:", response.Location || fileName);
};