import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const STORAGE_PATH = process.env.STORAGE_PATH || "./uploads";
export async function ensureStorageDir() {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
}
export async function saveFile(buffer, originalName, mimeType) {
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
export async function getFileBuffer(id) {
    // Find by partial match on id in filename
    const files = await fs.readdir(STORAGE_PATH);
    const found = files.find((f) => f.startsWith(id));
    if (!found)
        return null;
    return fs.readFile(path.join(STORAGE_PATH, found));
}
export async function deleteFile(id) {
    const files = await fs.readdir(STORAGE_PATH);
    const found = files.find((f) => f.startsWith(id));
    if (!found)
        return false;
    await fs.unlink(path.join(STORAGE_PATH, found));
    return true;
}
