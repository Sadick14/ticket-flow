
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  value?: string;
}

export function ImageUploader({ onUpload, value }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const uniqueId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uniqueId}.${fileExtension}`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      onUpload(downloadURL);
      setPreview(downloadURL);

      toast({
        title: 'Image Uploaded',
        description: 'Your image has been successfully uploaded to Firebase Storage.',
      });

    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: message,
      });
      // Clear preview if upload fails
      setPreview(value || null);
    } finally {
      setIsLoading(false);
    }
  }, [onUpload, toast, value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    multiple: false,
  });

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    onUpload('');
  }

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary'}`}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Uploading...</p>
        </div>
      ) : preview ? (
        <>
            <Image
                src={preview}
                alt="Image preview"
                width={200}
                height={200}
                className="mx-auto h-32 w-auto object-contain rounded-md"
            />
            <button 
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-background/50 rounded-full text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                aria-label="Remove image"
            >
                <X className="h-4 w-4" />
            </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-32">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP up to 10MB</p>
        </div>
      )}
    </div>
  );
}
