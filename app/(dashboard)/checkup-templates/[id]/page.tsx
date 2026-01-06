'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useCheckupTemplate,
  useUpdateCheckupTemplate,
} from '@/hooks/use-checkup-templates';
import type { CreateCheckupTemplateDto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BasicInfoSection } from '@/components/checkup/basic-info-section';
import { DoctorsSection } from '@/components/checkup/doctors-section';
import { QuestionsSection } from '@/components/checkup/questions-section';
import { PreviewSection } from '@/components/checkup/preview-section';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ERRORS } from '@/constants/errors';
import axios from 'axios';
import { onAuthError } from '@/lib/auth';
import { saveFormBackup, getFormBackup, clearFormBackup } from '@/lib/api';

const checkupTemplateSchema = z.object({
  testKey: z
    .string()
    .min(1, 'Ключ теста обязателен')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Только латиница, цифры, дефисы и подчеркивания'),
  title: z.string().min(1, 'Название обязательно'),
  carouselTitle: z.string().min(1, 'Заголовок карусели обязателен'),
  carouselSubtitle: z.string().min(1, 'Подзаголовок карусели обязателен'),
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

export default function EditCheckupTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const [isSaving, setIsSaving] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);
  const templateLoadedRef = useRef(false);

  const { data: template, isLoading } = useCheckupTemplate(id);
  const updateCheckupTemplate = useUpdateCheckupTemplate();

  const AUTOSAVE_KEY = `checkapp-checkup-template-edit-${id}`;

  const form = useForm<CreateCheckupTemplateDto>({
    resolver: zodResolver(checkupTemplateSchema),
    defaultValues: {
      testKey: '',
      title: '',
      carouselTitle: '',
      carouselSubtitle: '',
      description: '',
      benefits: [''],
      doctors: [],
      free: false,
      isActive: true,
      questions: [],
    },
  });

  // Save form data to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!templateLoadedRef.current) return;
    const values = form.getValues();
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
        data: values,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.error('[Autosave] Failed to save:', e);
    }
  }, [form, AUTOSAVE_KEY]);

  // Clear autosave data
  const clearAutosave = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
  }, [AUTOSAVE_KEY]);

  // Check for auth redirect backup
  useEffect(() => {
    if (hasRestoredRef.current) return;

    const backup = getFormBackup();
    if (backup && backup.path === pathname) {
      hasRestoredRef.current = true;
      templateLoadedRef.current = true;
      form.reset(backup.data as CreateCheckupTemplateDto);
      clearFormBackup();
      toast.success('Данные формы восстановлены после перезахода');
    }
  }, [pathname, form]);

  // Load template or restore from autosave
  useEffect(() => {
    if (!template || hasRestoredRef.current) return;

    // Check for autosave
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        // Only restore if saved within last 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          hasRestoredRef.current = true;
          templateLoadedRef.current = true;
          form.reset(data);
          toast.info('Восстановлены несохраненные изменения', {
            action: {
              label: 'Сбросить',
              onClick: () => {
                clearAutosave();
                form.reset({
                  testKey: template.testKey,
                  title: template.title,
                  carouselTitle: template.carouselTitle,
                  carouselSubtitle: template.carouselSubtitle,
                  description: template.description,
                  image: template.image,
                  benefits: template.benefits,
                  doctors: template.doctors,
                  free: template.free,
                  price: template.price,
                  pdfTemplate: template.pdfTemplate,
                  isActive: template.isActive,
                  questions: template.questions,
                });
              },
            },
          });
          return;
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    } catch (e) {
      console.error('[Autosave] Failed to check:', e);
    }

    // No autosave, load from template
    templateLoadedRef.current = true;
    form.reset({
      testKey: template.testKey,
      title: template.title,
      carouselTitle: template.carouselTitle,
      carouselSubtitle: template.carouselSubtitle,
      description: template.description,
      image: template.image,
      benefits: template.benefits,
      doctors: template.doctors,
      free: template.free,
      price: template.price,
      pdfTemplate: template.pdfTemplate,
      isActive: template.isActive,
      questions: template.questions,
    });
  }, [template, form, AUTOSAVE_KEY, clearAutosave]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autosaveTimerRef.current = setInterval(saveToLocalStorage, 30 * 1000);
    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [saveToLocalStorage]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveToLocalStorage]);

  // Listen for auth errors and save form data
  useEffect(() => {
    const unsubscribe = onAuthError(() => {
      const values = form.getValues();
      saveFormBackup(values, pathname);
    });
    return unsubscribe;
  }, [form, pathname]);

  const handleSave = async () => {
    const values = form.getValues();

    // Clean up NaN price values
    if (typeof values.price === 'number' && Number.isNaN(values.price)) {
      values.price = undefined;
    }

    // Validation
    const result = checkupTemplateSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      toast.warning(`Ошибка валидации: ${errors.questions ?? 'Проверьте введенные данные'}`);
      return;
    }

    setIsSaving(true);
    try {
      await updateCheckupTemplate.mutateAsync({ id, ...values });
      // Clear autosave on successful save
      clearAutosave();
      toast.success('Шаблон чекапа успешно обновлен');
      router.push('/checkup-templates');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.message as keyof typeof ERRORS;

        if (code && code in ERRORS) {
          toast.error(ERRORS[code]);
          return;
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Шаблон не найден</h2>
        <Button onClick={() => router.push('/checkup-templates')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Редактировать шаблон чекапа
          </h1>
          <p className="text-muted-foreground mt-1">{template.title}</p>
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
                  className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Сохранить изменения
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
