import { UseFormReturn } from 'react-hook-form';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, ImageIcon } from 'lucide-react';
import type { CreateCheckupTemplateDto } from '@/lib/types';

interface PreviewSectionProps {
  form: UseFormReturn<CreateCheckupTemplateDto>;
}

export function PreviewSection({ form }: PreviewSectionProps) {
  const data = form.watch();

  const formatPrice = (price?: number) => {
    if (!price) return 'Бесплатно';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Предпросмотр</h2>
        <p className="text-sm text-muted-foreground">
          Так будет выглядеть чекап для пользователей
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl">
                {data.title || 'Название чекапа'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={data.isActive ? 'default' : 'secondary'} className={`${data.isActive ? 'bg-green-800': 'bg-red-500'} text-white`}>
                  {data.isActive ? 'Активен' : 'Неактивен'}
                </Badge>
                <Badge variant={data.free ? 'outline' : 'default'} className='bg-teal-600 text-white'>
                  {data.free ? 'Бесплатный' : formatPrice(data.price)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.image && (
            <div>
              <h3 className="font-semibold mb-2">Изображение</h3>
              <div className="relative w-full max-w-[300px] mx-auto rounded-lg overflow-hidden bg-muted" style={{ aspectRatio: '460/605' }}>
                <Image
                  src={data.image}
                  alt={data.title || 'Изображение чекапа'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Описание</h3>
            <p className="text-muted-foreground">
              {data.description || 'Описание чекапа...'}
            </p>
          </div>

          {data.benefits && data.benefits.length > 0 && data.benefits[0] && (
            <div>
              <h3 className="font-semibold mb-3">Преимущества</h3>
              <ul className="space-y-2">
                {data.benefits.map((benefit, index) =>
                  benefit ? (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          )}

          {data.doctors && data.doctors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Врачи</h3>
              <div className="space-y-3">
                {data.doctors.map((doctor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{doctor.name || 'Имя врача'}</p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.role || 'Специализация'}
                      </p>
                      {doctor.instagram && (
                        <a
                          href={doctor.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.questions && data.questions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                Вопросы ({data.questions.length})
              </h3>
              <div className="space-y-4">
                {data.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question || 'Текст вопроса'}
                    </p>
                    {question.image && (
                      <div className="relative w-full max-w-[200px] h-24 mb-2 rounded overflow-hidden bg-muted">
                        <Image
                          src={question.image}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {question.type === 'single' && 'Один вариант'}
                        {question.type === 'multi' && 'Несколько вариантов'}
                        {question.type === 'multiple' && 'Множественный выбор'}
                        {question.type === 'form' && 'Форма'}
                        {question.type === 'single-with-input' && 'Один с вводом'}
                        {question.type === 'multiple-with-input' && 'Несколько с вводом'}
                      </Badge>
                      {question.variants && (
                        <Badge variant="outline" className="text-xs">
                          {question.variants.length} вариантов
                        </Badge>
                      )}
                      {question.fields && (
                        <Badge variant="outline" className="text-xs">
                          {question.fields.length} полей
                        </Badge>
                      )}
                      {question.image && (
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Изображение
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {data.questions.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ... и еще {data.questions.length - 3} вопросов
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
