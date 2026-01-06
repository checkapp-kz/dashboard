'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { onAuthError } from '@/lib/auth';
import { saveFormBackup, getFormBackup, clearFormBackup } from '@/lib/api';

const AUTOSAVE_KEY = 'checkapp-checkup-template-autosave';

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

export default function CreateCheckupTemplatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSaving, setIsSaving] = useState(false);
  const createCheckupTemplate = useCreateCheckupTemplate();
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);

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
    const values = form.getValues();
    // Only save if there's actual data
    if (values.title || values.questions.length > 0 || values.testKey) {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
          data: values,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.error('[Autosave] Failed to save:', e);
      }
    }
  }, [form]);

  // Restore form data from localStorage
  const restoreFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return false;

      const { data, timestamp } = JSON.parse(saved);
      // Only restore if saved within last 24 hours
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(AUTOSAVE_KEY);
        return false;
      }

      if (data && (data.title || data.questions?.length > 0 || data.testKey)) {
        form.reset(data);
        return true;
      }
    } catch (e) {
      console.error('[Autosave] Failed to restore:', e);
    }
    return false;
  }, [form]);

  // Clear autosave data
  const clearAutosave = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
  }, []);

  // Restore from auth redirect backup
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    // First check for auth redirect backup
    const backup = getFormBackup();
    if (backup && backup.path === pathname) {
      form.reset(backup.data as CreateCheckupTemplateDto);
      clearFormBackup();
      toast.success('Данные формы восстановлены после перезахода');
      return;
    }

    // Then check for regular autosave
    if (restoreFromLocalStorage()) {
      toast.info('Восстановлены несохраненные данные', {
        action: {
          label: 'Очистить',
          onClick: () => {
            clearAutosave();
            form.reset({
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
            });
          },
        },
      });
    }
  }, [pathname, form, restoreFromLocalStorage, clearAutosave]);

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

  const handleSave = async (publish: boolean) => {
    const values = form.getValues();
    values.isActive = publish;

    // Clean up NaN price values
    if (typeof values.price === 'number' && Number.isNaN(values.price)) {
      values.price = undefined;
    }

    // Validation
    const result = checkupTemplateSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      console.error(errors);
      toast.warning(`Ошибка валидации: ${errors.questions ?? 'Проверьте введенные данные'}`);
      return;
    }

    setIsSaving(true);
    try {
      await createCheckupTemplate.mutateAsync(values);
      // Clear autosave on successful save
      clearAutosave();
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
