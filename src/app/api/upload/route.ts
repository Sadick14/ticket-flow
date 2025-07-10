
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const extension = file.name.split('.').pop();
  const filename = `${uuidv4()}.${extension}`;

  // Define the upload path
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const path = join(uploadDir, filename);

  try {
    // Ensure the uploads directory exists
    mkdirSync(uploadDir, { recursive: true });
    // Write the file to the server's filesystem
    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);

    // Return the public URL of the uploaded file
    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
