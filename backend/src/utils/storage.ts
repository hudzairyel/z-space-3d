import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const STORAGE_PATH = process.env.STORAGE_PATH || "./uploads";

export interface StoredFile {
  id: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export async function ensureStorageDir(): Promise<void> {
  await fs.mkdir(STORAGE_PATH, { recursive: true });
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  await ensureStorageDir();
  const ext = path.extname(originalName) || ".bin";
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(STORAGE_PATH, filename);
  await fs.writeFile(filePath, buffer);
  const stats = await fs.stat(filePath);
  return {
    id: uuidv4(),
    originalName,
    filePath,
    fileSize: stats.size,
    mimeType,
  };
}

export async function getFileBuffer(id: string): Promise<Buffer | null> {
  // Find by partial match on id in filename
  const files = await fs.readdir(STORAGE_PATH);
  const found = files.find((f) => f.startsWith(id));
  if (!found) return null;
  return fs.readFile(path.join(STORAGE_PATH, found));
}

export async function deleteFile(id: string): Promise<boolean> {
  const files = await fs.readdir(STORAGE_PATH);
  const found = files.find((f) => f.startsWith(id));
  if (!found) return false;
  await fs.unlink(path.join(STORAGE_PATH, found));
  return true;
}
