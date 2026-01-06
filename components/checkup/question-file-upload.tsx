'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseQuestionsFromFile } from '@/lib/question-parser';
import type { CheckupQuestion } from '@/lib/types';

interface QuestionFileUploadProps {
  onQuestionsLoaded: (questions: CheckupQuestion[]) => void;
  existingQuestionsCount: number;
}

const ACCEPTED_FORMATS = '.txt,.md,.docx';
const ACCEPTED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function QuestionFileUpload({
  onQuestionsLoaded,
  existingQuestionsCount,
}: QuestionFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const isValidExtension =
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.docx');

    if (!isValidExtension) {
      setError('Неподдерживаемый формат. Используйте .txt, .md или .docx файлы.');
      return false;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 5MB.');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsLoading(true);
    setError(null);

    try {
      const questions = await parseQuestionsFromFile(file);

      // Reindex questions based on existing count
      const reindexedQuestions = questions.map((q, idx) => ({
        ...q,
        index: existingQuestionsCount + idx + 1,
        id: String(existingQuestionsCount + idx + 1),
      }));

      onQuestionsLoaded(reindexedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обработке файла.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [existingQuestionsCount]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-muted-foreground/25 hover:border-teal-500/50'}
          ${isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              <p className="text-sm text-muted-foreground">Обработка файла...</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Перетащите файл или нажмите для выбора
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Поддерживаемые форматы: .txt, .md, .docx (до 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <strong>Формат файла:</strong> Номер вопроса с точкой, затем варианты ответов на отдельных строках.
        <br />
        Пример: &quot;1. Текст вопроса?&quot; на первой строке, &quot;Да&quot; и &quot;Нет&quot; на следующих.
      </p>
    </div>
  );
}
