import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create the client for the BackBlaze B2 storage bucket using environment variables
// requireEnv acts a helper to ensure all necessary environment variables are set and throws an error if any are missing
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const s3 = new S3Client({
  region: requireEnv("B2_REGION"),
  endpoint: requireEnv("B2_ENDPOINT"),
  credentials: {
    accessKeyId: requireEnv("B2_KEY_ID"),
    secretAccessKey: requireEnv("B2_APP_KEY"),
  },
});

export const BUCKET = requireEnv("B2_BUCKET_NAME");

// Upload a file
export async function uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,         // the path/name inside your bucket
    Body: fileBuffer,      // the actual file data as a Buffer
    ContentType: mimeType, // e.g. "image/jpeg" or "application/pdf"
  });

  await s3.send(command);
  return fileName; // return the key so you can store it in your DB
}

// Generate a temporary URL to view/download a file (expires after 1 hour)
export async function getFileUrl(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}

// Delete a file
export async function deleteFile(fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
  });

  await s3.send(command);
}