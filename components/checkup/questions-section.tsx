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
  Upload,
  GitBranch,
} from 'lucide-react';
import type {
  CreateCheckupTemplateDto,
  CheckupQuestion,
  QuestionType,
  QuestionVariant,
  FormField,
  QuestionCondition,
} from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { QuestionImageUpload } from './question-image-upload';
import { QuestionFileUpload } from './question-file-upload';

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
    const removedQuestion = questions[index];
    const newQuestions = questions.filter((_, i) => i !== index);

    // Remove conditions that reference the deleted question
    newQuestions.forEach((q) => {
      if (q.condition?.questionId === removedQuestion.id) {
        delete q.condition;
      }
    });

    // Reindex questions and update condition references
    const oldIdToNewId = new Map<string, string>();
    newQuestions.forEach((q, i) => {
      oldIdToNewId.set(q.id, String(i + 1));
      q.index = i + 1;
      q.id = String(i + 1);
    });

    // Update condition questionId references to new IDs
    newQuestions.forEach((q) => {
      if (q.condition) {
        const newQuestionId = oldIdToNewId.get(q.condition.questionId);
        if (newQuestionId) {
          q.condition.questionId = newQuestionId;
        }
      }
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

    // Store old IDs before swapping
    const oldIdToNewIndex = new Map<string, number>();
    newQuestions.forEach((q, i) => {
      if (i === index) {
        oldIdToNewIndex.set(q.id, targetIndex);
      } else if (i === targetIndex) {
        oldIdToNewIndex.set(q.id, index);
      } else {
        oldIdToNewIndex.set(q.id, i);
      }
    });

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // Map old IDs to new IDs and reindex
    const oldIdToNewId = new Map<string, string>();
    newQuestions.forEach((q, i) => {
      oldIdToNewId.set(q.id, String(i + 1));
      q.index = i + 1;
      q.id = String(i + 1);
    });

    // Update condition references and remove invalid ones
    newQuestions.forEach((q, i) => {
      if (q.condition) {
        const newQuestionId = oldIdToNewId.get(q.condition.questionId);
        if (newQuestionId) {
          // Check if the referenced question still comes before this one
          const referencedIndex = Number(newQuestionId) - 1;
          if (referencedIndex >= i) {
            // Invalid: referenced question is now at or after this question
            delete q.condition;
          } else {
            q.condition.questionId = newQuestionId;
          }
        }
      }
    });

    setValue('questions', newQuestions);
  };

  const handleQuestionsFromFile = (loadedQuestions: CheckupQuestion[]) => {
    const newQuestions = [...questions, ...loadedQuestions];
    // Reindex all questions
    newQuestions.forEach((q, i) => {
      q.index = i + 1;
      q.id = String(i + 1);
    });
    setValue('questions', newQuestions);
    // Expand newly added questions
    const newExpandedSet = new Set(expandedQuestions);
    loadedQuestions.forEach((_, idx) => {
      newExpandedSet.add(questions.length + idx);
    });
    setExpandedQuestions(newExpandedSet);
  };

  const [showFileUpload, setShowFileUpload] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Вопросы</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Создайте опросник для пользователей
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFileUpload(!showFileUpload)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Импорт из файла
          </Button>
          <Button type="button" onClick={addQuestion} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Добавить вопрос
          </Button>
        </div>
      </div>

      {showFileUpload && (
        <Card className="border-teal-200 bg-teal-50/50">
          <CardContent className="pt-4">
            <QuestionFileUpload
              onQuestionsLoaded={(loadedQuestions) => {
                handleQuestionsFromFile(loadedQuestions);
                setShowFileUpload(false);
              }}
              existingQuestionsCount={questions.length}
            />
          </CardContent>
        </Card>
      )}

      {questions.length === 0 && !showFileUpload ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Нет добавленных вопросов
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFileUpload(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Импорт из файла
              </Button>
              <Button
                type="button"
                onClick={addQuestion}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить вопрос
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? null : (
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
                      {question.condition && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <GitBranch className="h-3 w-3" />
                              Q{question.condition.questionId}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Показывается если вопрос {question.condition.questionId} = [{question.condition.values.join(', ')}]
                          </TooltipContent>
                        </Tooltip>
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

                      {/* Condition editor */}
                      {qIndex > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-muted-foreground" />
                              <Label className="text-sm font-medium">Условие показа</Label>
                            </div>
                            {question.condition && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const { condition, ...rest } = question;
                                  const newQuestions = [...questions];
                                  newQuestions[qIndex] = rest as CheckupQuestion;
                                  setValue('questions', newQuestions);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Убрать условие
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`has-condition-${qIndex}`}
                              checked={!!question.condition}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Set initial condition to first available question
                                  const firstQuestion = questions[0];
                                  if (firstQuestion?.variants?.length) {
                                    updateQuestion(qIndex, 'condition', {
                                      questionId: firstQuestion.id,
                                      values: [],
                                    });
                                  }
                                } else {
                                  const { condition, ...rest } = question;
                                  const newQuestions = [...questions];
                                  newQuestions[qIndex] = rest as CheckupQuestion;
                                  setValue('questions', newQuestions);
                                }
                              }}
                            />
                            <Label htmlFor={`has-condition-${qIndex}`} className="cursor-pointer text-sm">
                              Показывать только при определенном ответе
                            </Label>
                          </div>

                          {question.condition && (
                            <div className="pl-6 space-y-3">
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                  Зависит от вопроса
                                </Label>
                                <Select
                                  value={question.condition.questionId}
                                  onValueChange={(value) => {
                                    updateQuestion(qIndex, 'condition', {
                                      questionId: value,
                                      values: [],
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Выберите вопрос..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {questions
                                      .filter((q, i) => i < qIndex && q.variants && q.variants.length > 0)
                                      .map((q) => (
                                        <SelectItem key={q.id} value={q.id}>
                                          {q.index}. {q.question || '(без текста)'}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {question.condition.questionId && (
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Показывать при ответах
                                  </Label>
                                  <div className="space-y-1.5 bg-muted/50 rounded-md p-3">
                                    {(() => {
                                      const parentQuestion = questions.find(
                                        (q) => q.id === question.condition?.questionId
                                      );
                                      if (!parentQuestion?.variants?.length) {
                                        return (
                                          <p className="text-xs text-muted-foreground">
                                            У выбранного вопроса нет вариантов ответа
                                          </p>
                                        );
                                      }
                                      return parentQuestion.variants.map((variant) => (
                                        <div key={variant.value} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`condition-${qIndex}-${variant.value}`}
                                            checked={question.condition?.values.includes(variant.value) || false}
                                            onCheckedChange={(checked) => {
                                              const currentValues = question.condition?.values || [];
                                              const newValues = checked
                                                ? [...currentValues, variant.value]
                                                : currentValues.filter((v) => v !== variant.value);
                                              updateQuestion(qIndex, 'condition', {
                                                ...question.condition!,
                                                values: newValues,
                                              });
                                            }}
                                          />
                                          <Label
                                            htmlFor={`condition-${qIndex}-${variant.value}`}
                                            className="cursor-pointer text-sm"
                                          >
                                            {variant.label || variant.value}{' '}
                                            <span className="text-muted-foreground">({variant.value})</span>
                                          </Label>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  {question.condition.values.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1.5">
                                      Выберите хотя бы один вариант ответа
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
