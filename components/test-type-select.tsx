'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TEST_TYPES, type TestType } from '@/lib/types';

interface TestTypeSelectProps {
  value?: TestType;
  onValueChange: (value: TestType | undefined) => void;
  placeholder?: string;
  includeAll?: boolean;
}

export function TestTypeSelect({
  value,
  onValueChange,
  placeholder = 'Select test type',
  includeAll = false,
}: TestTypeSelectProps) {
  return (
    <Select
      value={value || (includeAll ? 'all' : undefined)}
      onValueChange={(val) => onValueChange(val === 'all' ? undefined : (val as TestType))}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="all">All Test Types</SelectItem>
        )}
        {TEST_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
