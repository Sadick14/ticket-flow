
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  value?: string;
}

export function ImageUploader({ onUpload, value }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Sync preview with external value changes (e.g., when form is reset or populated for editing)
    if (value && value !== preview) {
      setPreview(value);
    }
    if (!value && preview) {
        setPreview(null);
    }
  }, [value]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    setIsLoading(true);

    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      onUpload(result.url);
      toast({
        title: 'Image Uploaded',
        description: 'Your image has been successfully uploaded.',
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Upload error:', message);
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
