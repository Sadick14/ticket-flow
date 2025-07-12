// Alternative upload implementation using Cloudinary
// Uncomment and configure if you want cloud storage

/*
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'ticket-flow',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url);
        }
      }
    ).end(buffer);
  });
}
*/

// For now, we're using placeholder images in production
export const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400'
];
