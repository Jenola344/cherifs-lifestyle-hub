import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary environment variables are missing. Image uploads will fail.');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Uploads a base64 or buffer to Cloudinary
 */
export async function uploadToCloudinary(fileUri: string, folder: string = 'cherifs-hub') {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            fileUri,
            {
                folder: folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
}
