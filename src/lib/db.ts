import fs from 'fs/promises';
import path from 'path';

export async function readData(fileName: string) {
    const filePath = path.join(process.cwd(), 'data', fileName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
}

export async function writeData(fileName: string, data: any) {
    const filePath = path.join(process.cwd(), 'data', fileName);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);
        return false;
    }
}
