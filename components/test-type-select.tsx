'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTestTypes } from '@/hooks/use-test-types';
import type { TestType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface TestTypeSelectProps {
  value?: TestType;
  onValueChange: (value: TestType | undefined) => void;
  placeholder?: string;
  includeAll?: boolean;
}

export function TestTypeSelect({
  value,
  onValueChange,
  placeholder = 'Выберите тип теста',
  includeAll = false,
}: TestTypeSelectProps) {
  const { testTypes, isLoading } = useTestTypes();

  if (isLoading) {
    return (
      <div className="w-[200px] h-10 flex items-center justify-center border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Select
      value={value || (includeAll ? 'all' : undefined)}
      onValueChange={(val) => onValueChange(val === 'all' ? undefined : val)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="all">Все типы тестов</SelectItem>
        )}
        {testTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
