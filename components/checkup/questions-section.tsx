import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  GripVertical,
  HelpCircle,
  ImageIcon,
} from 'lucide-react';
import type {
  CreateCheckupTemplateDto,
  CheckupQuestion,
  QuestionType,
  QuestionVariant,
  FormField,
} from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { QuestionImageUpload } from './question-image-upload';

interface QuestionsSectionProps {
  form: UseFormReturn<CreateCheckupTemplateDto>;
}

export function QuestionsSection({ form }: QuestionsSectionProps) {
  const { watch, setValue } = form;
  const questions = watch('questions') || [];
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([0]));

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const addQuestion = () => {
    const newIndex = questions.length + 1;
    setValue('questions', [
      ...questions,
      {
        index: newIndex,
        id: String(newIndex),
        question: '',
        type: 'single' as QuestionType,
        variants: [
          { label: '', value: 'a' },
          { label: '', value: 'b' },
        ],
      },
    ]);
    setExpandedQuestions(new Set([...expandedQuestions, questions.length]));
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Reindex questions
    newQuestions.forEach((q, i) => {
      q.index = i + 1;
      q.id = String(i + 1);
    });
    setValue('questions', newQuestions);
  };

  const duplicateQuestion = (index: number) => {
    const question = { ...questions[index] };
    const newIndex = questions.length + 1;
    question.index = newIndex;
    question.id = String(newIndex);
    setValue('questions', [...questions, question]);
    setExpandedQuestions(new Set([...expandedQuestions, questions.length]));
  };

  const updateQuestion = (
    index: number,
    field: keyof CheckupQuestion,
    value: any
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setValue('questions', newQuestions);
  };

  const addVariant = (questionIndex: number) => {
    const question = questions[questionIndex];
    const variants = question.variants || [];
    const nextValue = String.fromCharCode(97 + variants.length); // a, b, c, etc.
    updateQuestion(questionIndex, 'variants', [
      ...variants,
      { label: '', value: nextValue },
    ]);
  };

  const removeVariant = (questionIndex: number, variantIndex: number) => {
    const question = questions[questionIndex];
    const variants = (question.variants || []).filter((_, i) => i !== variantIndex);
    updateQuestion(questionIndex, 'variants', variants);
  };

  const updateVariant = (
    questionIndex: number,
    variantIndex: number,
    field: keyof QuestionVariant,
    value: any
  ) => {
    const question = questions[questionIndex];
    const variants = [...(question.variants || [])];
    variants[variantIndex] = { ...variants[variantIndex], [field]: value };
    updateQuestion(questionIndex, 'variants', variants);
  };

  const addFormField = (questionIndex: number) => {
    const question = questions[questionIndex];
    const fields = question.fields || [];
    updateQuestion(questionIndex, 'fields', [
      ...fields,
      { label: '', name: '', type: 'text' as const },
    ]);
  };

  const removeFormField = (questionIndex: number, fieldIndex: number) => {
    const question = questions[questionIndex];
    const fields = (question.fields || []).filter((_, i) => i !== fieldIndex);
    updateQuestion(questionIndex, 'fields', fields);
  };

  const updateFormField = (
    questionIndex: number,
    fieldIndex: number,
    field: keyof FormField,
    value: any
  ) => {
    const question = questions[questionIndex];
    const fields = [...(question.fields || [])];
    fields[fieldIndex] = { ...fields[fieldIndex], [field]: value };
    updateQuestion(questionIndex, 'fields', fields);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // Reindex
    newQuestions.forEach((q, i) => {
      q.index = i + 1;
      q.id = String(i + 1);
    });

    setValue('questions', newQuestions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Вопросы</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Создайте опросник для пользователей
          </p>
        </div>
        <Button type="button" onClick={addQuestion} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Добавить вопрос
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Нет добавленных вопросов
            </p>
            <Button
              type="button"
              onClick={addQuestion}
              className="mt-4 bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить вопрос
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(qIndex, 'up')}
                        disabled={qIndex === 0}
                        className="h-5 p-0 hover:bg-transparent"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(qIndex, 'down')}
                        disabled={qIndex === questions.length - 1}
                        className="h-5 p-0 hover:bg-transparent"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>Вопрос {qIndex + 1}</span>
                      {question.image && (
                        <ImageIcon className="h-4 w-4 text-teal-600" />
                      )}
                      {question.question && (
                        <span className="font-normal text-muted-foreground">
                          — {question.question.slice(0, 50)}
                          {question.question.length > 50 && '...'}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateQuestion(qIndex)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Дублировать вопрос</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Удалить вопрос</TooltipContent>
                    </Tooltip>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(qIndex)}
                    >
                      {expandedQuestions.has(qIndex) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence initial={false}>
                {expandedQuestions.has(qIndex) && (
                  <motion.div key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden">
                    <CardContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor={`question-text-${qIndex}`}>Текст вопроса</Label>
                        <Textarea
                          id={`question-text-${qIndex}`}
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Укажите ваш пол"
                          rows={2}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`question-type-${qIndex}`} className='mb-2'>Тип вопроса</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: QuestionType) => {
                            updateQuestion(qIndex, 'type', value);
                            // Initialize appropriate structure based on type
                            if (
                              value === 'single' ||
                              value === 'multi' ||
                              value === 'multiple' ||
                              value === 'single-with-input' ||
                              value === 'multiple-with-input'
                            ) {
                              if (!question.variants || question.variants.length === 0) {
                                updateQuestion(qIndex, 'variants', [
                                  { label: '', value: 'a' },
                                  { label: '', value: 'b' },
                                ]);
                              }
                            } else if (value === 'form') {
                              if (!question.fields || question.fields.length === 0) {
                                updateQuestion(qIndex, 'fields', [
                                  { label: '', name: '', type: 'text' as const },
                                ]);
                              }
                            }
                          }}
                        >
                          <SelectTrigger id={`question-type-${qIndex}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Один вариант</SelectItem>
                            <SelectItem value="multi">Несколько вариантов</SelectItem>
                            <SelectItem value="multiple">Множественный выбор</SelectItem>
                            <SelectItem value="form">Форма с полями</SelectItem>
                            <SelectItem value="single-with-input">
                              Один вариант с вводом
                            </SelectItem>
                            <SelectItem value="multiple-with-input">
                              Несколько вариантов с вводом
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Question image upload */}
                      <QuestionImageUpload
                        value={question.image}
                        onChange={(url) => updateQuestion(qIndex, 'image', url)}
                      />

                      {/* Variants for single/multi/multiple types */}
                      {(question.type === 'single' ||
                        question.type === 'multi' ||
                        question.type === 'multiple' ||
                        question.type === 'single-with-input' ||
                        question.type === 'multiple-with-input') && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Варианты ответов</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addVariant(qIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить вариант
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {(question.variants || []).map((variant, vIndex) => (
                                <div key={vIndex} className="flex gap-2 items-start">
                                  <Input
                                    value={variant.value}
                                    onChange={(e) =>
                                      updateVariant(qIndex, vIndex, 'value', e.target.value)
                                    }
                                    placeholder="a"
                                    className="w-16"
                                  />
                                  <Input
                                    value={variant.label}
                                    onChange={(e) =>
                                      updateVariant(qIndex, vIndex, 'label', e.target.value)
                                    }
                                    placeholder="Текст варианта"
                                    className="flex-1"
                                  />
                                  {(question.variants || []).length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeVariant(qIndex, vIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Form fields for form type */}
                      {question.type === 'form' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Поля формы</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addFormField(qIndex)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Добавить поле
                            </Button>
                          </div>
                          <div className="space-y-4">
                            {(question.fields || []).map((field, fIndex) => (
                              <Card key={fIndex} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <Label className="text-xs">Метка</Label>
                                      <Input
                                        value={field.label}
                                        onChange={(e) =>
                                          updateFormField(qIndex, fIndex, 'label', e.target.value)
                                        }
                                        placeholder="Рост (см.)"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Label className="text-xs">Имя поля</Label>
                                      <Input
                                        value={field.name}
                                        onChange={(e) =>
                                          updateFormField(qIndex, fIndex, 'name', e.target.value)
                                        }
                                        placeholder="height"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeFormField(qIndex, fIndex)}
                                      className="mt-5"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <Label className="text-xs">Тип</Label>
                                      <Select
                                        value={field.type}
                                        onValueChange={(value: any) =>
                                          updateFormField(qIndex, fIndex, 'type', value)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="text">Текст</SelectItem>
                                          <SelectItem value="number">Число</SelectItem>
                                          <SelectItem value="email">Email</SelectItem>
                                          <SelectItem value="tel">Телефон</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {field.type === 'number' && (
                                      <>
                                        <div>
                                          <Label className="text-xs">Мин</Label>
                                          <Input
                                            type="number"
                                            value={field.min || ''}
                                            onChange={(e) =>
                                              updateFormField(
                                                qIndex,
                                                fIndex,
                                                'min',
                                                e.target.value ? Number(e.target.value) : undefined
                                              )
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Макс</Label>
                                          <Input
                                            type="number"
                                            value={field.max || ''}
                                            onChange={(e) =>
                                              updateFormField(
                                                qIndex,
                                                fIndex,
                                                'max',
                                                e.target.value ? Number(e.target.value) : undefined
                                              )
                                            }
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional options */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`has-other-${qIndex}`}
                            checked={question.hasOtherAnswer || false}
                            onCheckedChange={(checked) =>
                              updateQuestion(qIndex, 'hasOtherAnswer', !!checked)
                            }
                          />
                          <Label htmlFor={`has-other-${qIndex}`} className="cursor-pointer text-sm">
                            Добавить вариант &quot;Другое&quot;
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`has-no-selected-${qIndex}`}
                            checked={question.hasNoSelectedAnswer || false}
                            onCheckedChange={(checked) =>
                              updateQuestion(qIndex, 'hasNoSelectedAnswer', !!checked)
                            }
                          />
                          <Label
                            htmlFor={`has-no-selected-${qIndex}`}
                            className="cursor-pointer text-sm"
                          >
                            Добавить вариант &quot;Ничего из перечисленного&quot;
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
