'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCheckupTemplate } from '@/hooks/use-checkup-templates';
import type { CreateCheckupTemplateDto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BasicInfoSection } from '@/components/checkup/basic-info-section';
import { DoctorsSection } from '@/components/checkup/doctors-section';
import { QuestionsSection } from '@/components/checkup/questions-section';
import { PreviewSection } from '@/components/checkup/preview-section';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

const checkupTemplateSchema = z.object({
  testKey: z
    .string()
    .min(1, 'Ключ теста обязателен')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Только латиница, цифры, дефисы и подчеркивания'),
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  image: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  doctors: z
    .array(
      z.object({
        role: z.string(),
        name: z.string(),
        instagram: z.string(),
      })
    )
    .optional(),
  free: z.boolean(),
  price: z.number().optional(),
  pdfTemplate: z.string().optional(),
  isActive: z.boolean(),
  questions: z.array(z.any()).min(1, 'Добавьте хотя бы один вопрос'),
});

export default function CreateCheckupTemplatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const createCheckupTemplate = useCreateCheckupTemplate();

  const form = useForm<CreateCheckupTemplateDto>({
    resolver: zodResolver(checkupTemplateSchema),
    defaultValues: {
      testKey: '',
      title: '',
      description: '',
      benefits: [''],
      doctors: [],
      free: false,
      isActive: true,
      questions: [],
    },
  });

  const handleSave = async (publish: boolean) => {
    const values = form.getValues();
    values.isActive = publish;

    // Validation
    const result = checkupTemplateSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      Object.entries(errors).forEach(([messages]) => {
        toast.warning('Ошибка валидации: ' + (messages?.[0] || 'Неизвестная ошибка'));
      });
      return;
    }

    setIsSaving(true);
    try {
      await createCheckupTemplate.mutateAsync(values);
      toast.success(`Шаблон чекапа ${publish ? 'опубликован' : 'сохранен как черновик'}`);
      router.push('/checkup-templates');
    } catch {
      toast.warning('Ошибка при создании шаблона чекапа');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Создать шаблон чекапа</h1>
          <p className="text-muted-foreground mt-1">
            Заполните информацию о новом шаблоне теста
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <BasicInfoSection form={form} />
          </Card>

          <Card className="p-6">
            <DoctorsSection form={form} />
          </Card>

          <Card className="p-6">
            <QuestionsSection form={form} />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <PreviewSection form={form} />

            <Card className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Действия</h3>
                <Separator />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Сохранить как черновик
                </Button>
                <Button
                  type="button"
                  className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Опубликовать
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
