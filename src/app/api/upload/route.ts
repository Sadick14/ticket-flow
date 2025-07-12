import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if we're in production/Railway environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT_NAME;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Upload attempt: ${file.name}, size: ${file.size}, type: ${file.type}`);
    console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // In production, use Cloudinary for cloud storage
    if (isProduction) {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('Cloudinary not configured. Missing environment variables.');
        return NextResponse.json({ 
          error: 'Cloud storage not configured',
          details: 'Please configure Cloudinary environment variables'
        }, { status: 500 });
      }

      try {
        console.log('Uploading to Cloudinary...');
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'ticket-flow-events',
              public_id: `event-${uuidv4()}`,
              transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 800, height: 600, crop: 'fill' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success:', result?.secure_url);
                resolve(result);
              }
            }
          ).end(buffer);
        });

        const result = uploadResult as any;
        
        return NextResponse.json({ 
          success: true, 
          url: result.secure_url,
          fileName: result.public_id,
          cloudinary: true
        });
        
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
        return NextResponse.json({ 
          error: 'Image upload failed',
          details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Cloud storage error'
        }, { status: 500 });
      }
    }

    // Local development - use filesystem
    const uniqueId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExtension}`;

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
