import AWS from "aws-sdk";
const { S3, Credentials } = AWS;
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export async function downloadS3Folder(prefix: string) {
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

    const allFiles = await s3.listObjectsV2({
        Bucket: "repo-deploy",
        Prefix: prefix
    }).promise();

    const allPromises = allFiles.Contents?.map(async ({ Key }) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: "repo-deploy",
                Key
            }).createReadStream().pipe(outputFile)
                .on("finish", () => {
                    resolve("");
                });
        });
    }) || [];

    console.log("awaiting");
    await Promise.all(allPromises.filter(x => x !== undefined));
}
