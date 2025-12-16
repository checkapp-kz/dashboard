'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function ImageUpload({ value, onChange, label, description }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5 МБ');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post<{ url: string }>('/s3/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onChange(data.url);
      toast.success('Изображение успешно загружено');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Не удалось загрузить изображение');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImage(files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!value && !isUploading ? handleClick : undefined}
        className={`
          relative rounded-lg border-2 border-dashed transition-colors
          ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}
          ${!value && !isUploading ? 'cursor-pointer hover:border-teal-400 hover:bg-gray-50' : ''}
          ${value ? 'p-0' : 'p-8'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
            <p className="text-sm text-muted-foreground">Загрузка изображения...</p>
          </div>
        ) : value ? (
          <div className="relative group">
            <div className="relative w-full max-w-[300px] mx-auto rounded-lg overflow-hidden bg-muted" style={{ aspectRatio: '460/605' }}>
              <Image
                src={value}
                alt="Загруженное изображение"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Заменить
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="mb-2">
              <span className="font-medium text-teal-600">Нажмите для выбора</span>
              <span className="text-muted-foreground"> или перетащите изображение</span>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP до 5 МБ
            </p>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
