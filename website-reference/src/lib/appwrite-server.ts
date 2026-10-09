import { Client, Storage, ID } from "node-appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const bucketId = process.env.APPWRITE_BUCKET_ID || "";

/**
 * Server-only Appwrite Storage helper
 * Uses node-appwrite (supports setKey for API keys)
 */
export function getServerStorage() {
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) {
    throw new Error("APPWRITE_API_KEY is missing");
  }
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is missing");
  }
  if (!bucketId) {
    throw new Error("APPWRITE_BUCKET_ID is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return new Storage(client);
}

export async function uploadFileToAppwrite(file: File, fileName?: string) {
  const storage = getServerStorage();
  const id = ID.unique();
  const name = fileName || file.name || "upload.bin";

  // Prefer the File already provided by the request (Next.js / undici)
  // Fallback to a new File from the buffer for older runtimes
  let uploadable: File = file;
  if (!(file instanceof File) || file.name !== name) {
    const buffer = Buffer.from(await file.arrayBuffer());
    uploadable = new File([buffer], name, {
      type: file.type || "application/octet-stream",
    });
  }

  // Support both object-style and positional createFile APIs across SDK versions
  let result: {
    $id: string;
    name: string;
    mimeType: string;
    sizeOriginal: number;
  };

  try {
    result = await (storage as any).createFile({
      bucketId,
      fileId: id,
      file: uploadable,
    });
  } catch {
    result = await (storage as any).createFile(bucketId, id, uploadable);
  }

  return {
    fileId: result.$id,
    name: result.name,
    mimeType: result.mimeType,
    size: result.sizeOriginal,
    viewUrl: `${endpoint}/storage/buckets/${bucketId}/files/${result.$id}/view?project=${projectId}`,
    downloadUrl: `${endpoint}/storage/buckets/${bucketId}/files/${result.$id}/download?project=${projectId}`,
  };
}

export { ID, bucketId as APPWRITE_BUCKET_ID };
