'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface QuestionImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function QuestionImageUpload({ value, onChange }: QuestionImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Max 500KB for question images
    if (file.size > 500 * 1024) {
      toast.error('Размер файла не должен превышать 500 КБ');
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
      toast.success('Изображение загружено');
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
      <Label>Изображение вопроса (опционально)</Label>

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
          ${value ? 'p-2' : 'p-4'}
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
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600 mr-2" />
            <span className="text-sm text-muted-foreground">Загрузка...</span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-24 rounded overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={value}
                alt="Изображение вопроса"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{value}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <Upload className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-center">
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm">
              <span className="text-teal-600 font-medium">Загрузить</span>
              <span className="text-muted-foreground"> или перетащить (PNG, JPG до 500 КБ)</span>
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Рекомендуемый размер: до 1200x800px, соотношение 16:9 или 4:3
      </p>
    </div>
  );
}
