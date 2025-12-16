import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, UserCircle } from 'lucide-react';
import type { CreateCheckupTemplateDto, Doctor } from '@/lib/types';

interface DoctorsSectionProps {
  form: UseFormReturn<CreateCheckupTemplateDto>;
}

export function DoctorsSection({ form }: DoctorsSectionProps) {
  const { watch, setValue } = form;
  const doctors = watch('doctors') || [];

  const addDoctor = () => {
    setValue('doctors', [
      ...doctors,
      { role: '', name: '', instagram: '' },
    ]);
  };

  const removeDoctor = (index: number) => {
    setValue(
      'doctors',
      doctors.filter((_, i) => i !== index)
    );
  };

  const updateDoctor = (index: number, field: keyof Doctor, value: string) => {
    const newDoctors = [...doctors];
    newDoctors[index] = { ...newDoctors[index], [field]: value };
    setValue('doctors', newDoctors);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Врачи</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Добавьте информацию о специалистах (опционально)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDoctor}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить врача
        </Button>
      </div>

      {doctors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Нет добавленных врачей
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDoctor}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить врача
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Врач {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDoctor(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`doctor-role-${index}`}>Специализация</Label>
                  <Input
                    id={`doctor-role-${index}`}
                    value={doctor.role}
                    onChange={(e) => updateDoctor(index, 'role', e.target.value)}
                    placeholder="Уролог-андролог"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`doctor-name-${index}`}>ФИО</Label>
                  <Input
                    id={`doctor-name-${index}`}
                    value={doctor.name}
                    onChange={(e) => updateDoctor(index, 'name', e.target.value)}
                    placeholder="Фролов Ростислав Александрович"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`doctor-instagram-${index}`}>Instagram</Label>
                  <Input
                    id={`doctor-instagram-${index}`}
                    type="url"
                    value={doctor.instagram}
                    onChange={(e) => updateDoctor(index, 'instagram', e.target.value)}
                    placeholder="https://www.instagram.com/dr.frolov/"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
