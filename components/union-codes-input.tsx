'use client';

import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UnionCodesInputProps {
  value: string[][];
  onChange: (value: string[][]) => void;
  placeholder?: string;
}

export function UnionCodesInput({
  value,
  onChange,
  placeholder = 'Введите код и нажмите Enter',
}: UnionCodesInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentCombination, setCurrentCombination] = useState<string[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newCode = inputValue.trim();
      if (!currentCombination.includes(newCode)) {
        setCurrentCombination([...currentCombination, newCode]);
      }
      setInputValue('');
    } else if (
      e.key === 'Backspace' &&
      !inputValue &&
      currentCombination.length > 0
    ) {
      setCurrentCombination(currentCombination.slice(0, -1));
    }
  };

  const removeCodeFromCurrent = (codeToRemove: string) => {
    setCurrentCombination(
      currentCombination.filter((code) => code !== codeToRemove)
    );
  };

  const addCombination = () => {
    if (currentCombination.length > 0) {
      onChange([...value, currentCombination]);
      setCurrentCombination([]);
    }
  };

  const removeCombination = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((combination, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-slate-50 rounded-md"
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {combination.map((code) => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700"
                  >
                    {code}
                  </Badge>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCombination(index)}
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 p-3 border border-dashed border-slate-300 rounded-md">
        <label className="text-sm font-medium">Новая комбинация:</label>

        <div className="flex flex-wrap gap-1.5 min-h-8">
          {currentCombination.map((code) => (
            <Badge
              key={code}
              variant="secondary"
              className="px-2 py-1 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100"
            >
              {code}
              <button
                type="button"
                onClick={() => removeCodeFromCurrent(code)}
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCombination}
          disabled={currentCombination.length === 0}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить комбинацию
        </Button>

        <p className="text-xs text-slate-500 mt-2">
          Введите коды через Enter, затем нажмите &quot;Добавить комбинацию&quot;.
          Анализ сработает, если ОДНОВРЕМЕННО присутствуют ВСЕ коды в комбинации.
        </p>
      </div>
    </div>
  );
}
