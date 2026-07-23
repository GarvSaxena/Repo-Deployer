import AWS from "aws-sdk";
const { S3, Credentials } = AWS;
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const getS3Client = () => {
    const endpoint = process.env.R2_ENDPOINT;
    if (!endpoint) {
        throw new Error("R2_ENDPOINT is missing or empty in environment variables.");
    }

    return new S3({
        credentials: new Credentials({
            accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        }),
        endpoint: endpoint,
        signatureVersion: "v4",
        region: "auto",
        s3ForcePathStyle: true,
    });
};

export async function downloadS3Folder(prefix: string) {
    const s3 = getS3Client();

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

export async function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    await Promise.all(allFiles.map(file => {
        return uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    }));
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
};

const uploadFile = async (fileName: string, localFilePath: string) => {
    const s3 = getS3Client();
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "repo-deploy",
        Key: fileName,
    }).promise();
    console.log(response);
};
