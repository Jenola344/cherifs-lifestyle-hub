import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDir() {
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

export async function readData(fileName: string) {
    await ensureDir();
    const filePath = path.join(dataDir, fileName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return empty array if file doesn't exist yet
        return [];
    }
}

export async function writeData(fileName: string, data: any) {
    await ensureDir();
    const filePath = path.join(dataDir, fileName);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);
        return false;
    }
}
