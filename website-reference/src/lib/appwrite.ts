import { Client, Storage, ID, Account } from "appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const bucketId =
  process.env.APPWRITE_BUCKET_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ||
  "";

/**
 * Browser / client-side Appwrite client
 * Do NOT set API key here (client SDK has no setKey)
 */
export function createAppwriteClient() {
  return new Client().setEndpoint(endpoint).setProject(projectId);
}

export const storage = new Storage(createAppwriteClient());
export const account = new Account(createAppwriteClient());

/** Get a public view URL for a file */
export function getFileViewUrl(fileId: string) {
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/** Get a download URL for a file */
export function getFileDownloadUrl(fileId: string) {
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
}

export { ID, bucketId as APPWRITE_BUCKET_ID };
