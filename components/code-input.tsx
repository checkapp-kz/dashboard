'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CodeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function CodeInput({
  value,
  onChange,
  placeholder = 'Type code and press Enter',
}: CodeInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newCode = inputValue.trim();
      if (!value.includes(newCode)) {
        onChange([...value, newCode]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeCode = (codeToRemove: string) => {
    onChange(value.filter((code) => code !== codeToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {value.map((code) => (
          <Badge
            key={code}
            variant="secondary"
            className="px-2 py-1 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100"
          >
            {code}
            <button
              type="button"
              onClick={() => removeCode(code)}
              className="ml-1.5 hover:text-teal-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );
}
