import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/checkup/image-upload';
import { Plus, X } from 'lucide-react';
import type { CreateCheckupTemplateDto } from '@/lib/types';

interface BasicInfoSectionProps {
  form: UseFormReturn<CreateCheckupTemplateDto>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const benefits = watch('benefits') || [''];
  const isFree = watch('free');

  const addBenefit = () => {
    setValue('benefits', [...benefits, '']);
  };

  const removeBenefit = (index: number) => {
    setValue(
      'benefits',
      benefits.filter((_, i) => i !== index)
    );
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setValue('benefits', newBenefits);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="testKey">
            Ключ теста <span className="text-red-500">*</span>
          </Label>
          <Input
            id="testKey"
            {...register('testKey')}
            placeholder="man, woman, proctologicalTest"
            className={`${errors.testKey ? 'border-red-500' : ''} mt-2`}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Уникальный идентификатор (латиница, без пробелов)
          </p>
          {errors.testKey && (
            <p className="text-sm text-red-500 mt-1">{errors.testKey.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="title">
            Название <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Мужской чекап"
            className={`${errors.title ? 'border-red-500' : ''} mt-2`}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="carouselTitle">
            Заголовок для карусели <span className="text-red-500">*</span>
          </Label>
          <Input
            id="carouselTitle"
            {...register('carouselTitle')}
            placeholder="Общий чекап"
            className={`${errors.carouselTitle ? 'border-red-500' : ''} mt-2`}
          />
          {errors.carouselTitle && (
            <p className="text-sm text-red-500 mt-1">{errors.carouselTitle.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="carouselSubtitle">
            Подзаголовок для карусели <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="carouselSubtitle"
            {...register('carouselSubtitle')}
            placeholder="Мужской"
            className={`${errors.carouselSubtitle ? 'border-red-500' : ''} mt-2`}
          />
          {errors.carouselSubtitle && (
            <p className="text-sm text-red-500 mt-1">{errors.carouselSubtitle.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">
            Описание <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Многие мужчины откладывают визит к врачу..."
            rows={4}
            className={`${errors.description ? 'border-red-500' : ''} mt-2`}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <ImageUpload
            value={watch('image')}
            onChange={(url) => setValue('image', url)}
            label="Изображение"
            description="Загрузите изображение для отображения в карточке чекапа"
          />
          {errors.image && (
            <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>
          )}
        </div>

        <div>
          <Label>
            Преимущества
          </Label>
          <div className="space-y-2 mt-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  placeholder={`Преимущество ${index + 1}`}
                />
                {benefits.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeBenefit(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBenefit}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить преимущество
          </Button>
          {errors.benefits && (
            <p className="text-sm text-red-500 mt-1">{errors.benefits.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="free"
            checked={isFree}
            onCheckedChange={(checked) => setValue('free', !!checked)}
          />
          <Label htmlFor="free" className="cursor-pointer">
            Бесплатный тест
          </Label>
        </div>

        {!isFree && (
          <div>
            <Label htmlFor="price">Цена (₸)</Label>
            <Input
              id="price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              placeholder="50000"
              min={0}
              className='mt-2'
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={watch('isActive')}
            onCheckedChange={(checked) => setValue('isActive', !!checked)}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Активен (показывать пользователям)
          </Label>
        </div>
      </div>
    </div>
  );
}
