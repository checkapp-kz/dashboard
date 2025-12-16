'use client';

import { use } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAnalyses, useCreateAnalysis, useUpdateAnalysis, useDeleteAnalysis } from '@/hooks/use-analyses';
import { useSpecialists, useCreateSpecialist, useUpdateSpecialist, useDeleteSpecialist } from '@/hooks/use-specialists';
import { useDiagnostics, useCreateDiagnostic, useUpdateDiagnostic, useDeleteDiagnostic } from '@/hooks/use-diagnostics';
import { useRecommendations, useCreateRecommendation, useUpdateRecommendation, useDeleteRecommendation } from '@/hooks/use-recommendations';
import type { TestType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeInput } from '@/components/code-input';
import { DeleteDialog } from '@/components/delete-dialog';
import { Plus, Pencil, Trash2, Loader2, FlaskConical, Stethoscope, Activity, FileText } from 'lucide-react';

const TEST_TYPE_NAMES: Record<string, string> = {
  'female': 'Женский чекап',
  'male': 'Мужской чекап',
  'sport': 'Спорт чекап',
  'female-pregnancy': 'Планирование беременности (жен)',
  'male-pregnancy': 'Планирование беременности (муж)',
  'post-pregnant': 'После родов',
  'intim': 'Интим тест',
};

// Form schemas
const analysisSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  codes: z.array(z.string()),
  invitroCode: z.string().optional(),
  invitroPrice: z.number().optional(),
  specialPrice: z.number().optional(),
  isActive: z.boolean(),
  orderIndex: z.number().optional(),
});

const specialistSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  codes: z.array(z.string()),
  isActive: z.boolean(),
  orderIndex: z.number().optional(),
});

const diagnosticSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  codes: z.array(z.string()),
  isActive: z.boolean(),
  orderIndex: z.number().optional(),
});

const recommendationSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  content: z.string().min(1, 'Содержание обязательно'),
  isActive: z.boolean(),
  orderIndex: z.number().optional(),
});

export default function TestTypePage({ params }: { params: Promise<{ testType: string }> }) {
  const { testType } = use(params);
  const testTypeValue = testType as TestType;

  // Data queries
  const { data: analyses, isLoading: loadingAnalyses } = useAnalyses(testTypeValue);
  const { data: specialists, isLoading: loadingSpecialists } = useSpecialists(testTypeValue);
  const { data: diagnostics, isLoading: loadingDiagnostics } = useDiagnostics(testTypeValue);
  const { data: recommendations, isLoading: loadingRecommendations } = useRecommendations(testTypeValue);

  // Mutations
  const createAnalysis = useCreateAnalysis();
  const updateAnalysis = useUpdateAnalysis();
  const deleteAnalysis = useDeleteAnalysis();
  const createSpecialist = useCreateSpecialist();
  const updateSpecialist = useUpdateSpecialist();
  const deleteSpecialist = useDeleteSpecialist();
  const createDiagnostic = useCreateDiagnostic();
  const updateDiagnostic = useUpdateDiagnostic();
  const deleteDiagnostic = useDeleteDiagnostic();
  const createRecommendation = useCreateRecommendation();
  const updateRecommendation = useUpdateRecommendation();
  const deleteRecommendation = useDeleteRecommendation();

  // Dialog states
  const [dialogType, setDialogType] = useState<'analysis' | 'specialist' | 'diagnostic' | 'recommendation' | null>(null);
  const [editingItem, setEditingItem] = useState<unknown>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: string } | null>(null);

  // Forms
  const analysisForm = useForm({ resolver: zodResolver(analysisSchema), defaultValues: { name: '', description: '', codes: [], invitroCode: '', invitroPrice: undefined, specialPrice: undefined, isActive: true, orderIndex: undefined } });
  const specialistForm = useForm({ resolver: zodResolver(specialistSchema), defaultValues: { name: '', codes: [], isActive: true, orderIndex: undefined } });
  const diagnosticForm = useForm({ resolver: zodResolver(diagnosticSchema), defaultValues: { name: '', description: '', codes: [], isActive: true, orderIndex: undefined } });
  const recommendationForm = useForm({ resolver: zodResolver(recommendationSchema), defaultValues: { name: '', content: '', isActive: true, orderIndex: undefined } });

  const openCreate = (type: typeof dialogType) => {
    setEditingItem(null);
    if (type === 'analysis') analysisForm.reset({ name: '', description: '', codes: [], invitroCode: '', invitroPrice: undefined, specialPrice: undefined, isActive: true, orderIndex: undefined });
    if (type === 'specialist') specialistForm.reset({ name: '', codes: [], isActive: true, orderIndex: undefined });
    if (type === 'diagnostic') diagnosticForm.reset({ name: '', description: '', codes: [], isActive: true, orderIndex: undefined });
    if (type === 'recommendation') recommendationForm.reset({ name: '', content: '', isActive: true, orderIndex: undefined });
    setDialogType(type);
  };

  const openEdit = (type: typeof dialogType, item: unknown) => {
    setEditingItem(item);
    if (type === 'analysis') analysisForm.reset({ name: item.name, description: item.description || '', codes: item.codes, invitroCode: item.invitroCode || '', invitroPrice: item.invitroPrice, specialPrice: item.specialPrice, isActive: item.isActive, orderIndex: item.orderIndex });
    if (type === 'specialist') specialistForm.reset({ name: item.name, codes: item.codes, isActive: item.isActive, orderIndex: item.orderIndex });
    if (type === 'diagnostic') diagnosticForm.reset({ name: item.name, description: item.description || '', codes: item.codes, isActive: item.isActive, orderIndex: item.orderIndex });
    if (type === 'recommendation') recommendationForm.reset({ name: item.name, content: item.content, isActive: item.isActive, orderIndex: item.orderIndex });
    setDialogType(type);
  };

  const handleSave = async (type: string, data: any) => {
    const payload = { ...data, testType: testTypeValue };
    try {
      if (type === 'analysis') {
        if (editingItem) await updateAnalysis.mutateAsync({ id: editingItem._id, ...payload });
        else await createAnalysis.mutateAsync(payload);
      }
      if (type === 'specialist') {
        if (editingItem) await updateSpecialist.mutateAsync({ id: editingItem._id, ...payload });
        else await createSpecialist.mutateAsync(payload);
      }
      if (type === 'diagnostic') {
        if (editingItem) await updateDiagnostic.mutateAsync({ id: editingItem._id, ...payload });
        else await createDiagnostic.mutateAsync(payload);
      }
      if (type === 'recommendation') {
        if (editingItem) await updateRecommendation.mutateAsync({ id: editingItem._id, ...payload });
        else await createRecommendation.mutateAsync(payload);
      }
      setDialogType(null);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.type === 'analysis') await deleteAnalysis.mutateAsync(deleteItem.id);
      if (deleteItem.type === 'specialist') await deleteSpecialist.mutateAsync(deleteItem.id);
      if (deleteItem.type === 'diagnostic') await deleteDiagnostic.mutateAsync(deleteItem.id);
      if (deleteItem.type === 'recommendation') await deleteRecommendation.mutateAsync(deleteItem.id);
      setDeleteItem(null);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const isSaving = createAnalysis.isPending || updateAnalysis.isPending || createSpecialist.isPending || updateSpecialist.isPending || createDiagnostic.isPending || updateDiagnostic.isPending || createRecommendation.isPending || updateRecommendation.isPending;
  const isDeleting = deleteAnalysis.isPending || deleteSpecialist.isPending || deleteDiagnostic.isPending || deleteRecommendation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{TEST_TYPE_NAMES[testType] || testType}</h2>
        <p className="text-sm text-gray-500 mt-1">Управление данными для этого типа теста</p>
      </div>

      <Tabs defaultValue="analyses" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Анализы</span>
            <Badge variant="secondary" className="ml-1">{analyses?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="specialists" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Специалисты</span>
            <Badge variant="secondary" className="ml-1">{specialists?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Диагностика</span>
            <Badge variant="secondary" className="ml-1">{diagnostics?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Рекоменд.</span>
            <Badge variant="secondary" className="ml-1">{recommendations?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Analyses Tab */}
        <TabsContent value="analyses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Анализы</CardTitle>
              <Button onClick={() => openCreate('analysis')} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />Добавить
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Коды</TableHead>
                    <TableHead>Код Invitro</TableHead>
                    <TableHead>Цена Invitro</TableHead>
                    <TableHead>Спец. цена</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAnalyses ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" /></TableCell></TableRow>
                  ) : analyses?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Нет данных</TableCell></TableRow>
                  ) : analyses?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.orderIndex || '-'}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{item.name}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{item.codes.slice(0, 3).map((code) => (<Badge key={code} variant="secondary" className="text-xs">{code}</Badge>))}{item.codes.length > 3 && <Badge variant="secondary" className="text-xs">+{item.codes.length - 3}</Badge>}</div></TableCell>
                      <TableCell>{item.invitroCode || '-'}</TableCell>
                      <TableCell>{item.invitroPrice ? `${item.invitroPrice} ₸` : '-'}</TableCell>
                      <TableCell>{item.specialPrice ? `${item.specialPrice} ₸` : '-'}</TableCell>
                      <TableCell><Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{item.isActive ? 'Активен' : 'Неактивен'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit('analysis', item)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteItem({ type: 'analysis', id: item._id })} className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specialists Tab */}
        <TabsContent value="specialists">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Специалисты</CardTitle>
              <Button onClick={() => openCreate('specialist')} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />Добавить
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Коды</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSpecialists ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" /></TableCell></TableRow>
                  ) : specialists?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Нет данных</TableCell></TableRow>
                  ) : specialists?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{item.codes.slice(0, 4).map((code) => (<Badge key={code} variant="secondary" className="text-xs">{code}</Badge>))}{item.codes.length > 4 && <Badge variant="secondary" className="text-xs">+{item.codes.length - 4}</Badge>}</div></TableCell>
                      <TableCell><Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{item.isActive ? 'Активен' : 'Неактивен'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit('specialist', item)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteItem({ type: 'specialist', id: item._id })} className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Диагностика</CardTitle>
              <Button onClick={() => openCreate('diagnostic')} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />Добавить
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Коды</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDiagnostics ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" /></TableCell></TableRow>
                  ) : diagnostics?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Нет данных</TableCell></TableRow>
                  ) : diagnostics?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-600">{item.description || '-'}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{item.codes.slice(0, 3).map((code) => (<Badge key={code} variant="secondary" className="text-xs">{code}</Badge>))}{item.codes.length > 3 && <Badge variant="secondary" className="text-xs">+{item.codes.length - 3}</Badge>}</div></TableCell>
                      <TableCell><Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{item.isActive ? 'Активен' : 'Неактивен'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit('diagnostic', item)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteItem({ type: 'diagnostic', id: item._id })} className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Рекомендации</CardTitle>
              <Button onClick={() => openCreate('recommendation')} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />Добавить
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Содержание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRecommendations ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" /></TableCell></TableRow>
                  ) : recommendations?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Нет данных</TableCell></TableRow>
                  ) : recommendations?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-gray-600">{item.content}</TableCell>
                      <TableCell><Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{item.isActive ? 'Активен' : 'Неактивен'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit('recommendation', item)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteItem({ type: 'recommendation', id: item._id })} className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Dialog */}
      <Dialog open={dialogType === 'analysis'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingItem ? 'Редактировать анализ' : 'Добавить анализ'}</DialogTitle></DialogHeader>
          <form onSubmit={analysisForm.handleSubmit((data) => handleSave('analysis', data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Название *</Label><Input {...analysisForm.register('name')} placeholder="Название анализа" /></div>
              <div className="col-span-2"><Label>Описание</Label><Textarea {...analysisForm.register('description')} rows={2} /></div>
              <div><Label>Код Invitro</Label><Input {...analysisForm.register('invitroCode')} /></div>
              <div><Label>Цена Invitro</Label><Input type="number" {...analysisForm.register('invitroPrice', { valueAsNumber: true })} /></div>
              <div><Label>Спец. цена</Label><Input type="number" {...analysisForm.register('specialPrice', { valueAsNumber: true })} /></div>
              <div><Label>Порядок</Label><Input type="number" {...analysisForm.register('orderIndex', { valueAsNumber: true })} /></div>
              <div className="col-span-2"><Label>Коды</Label><CodeInput value={analysisForm.watch('codes')} onChange={(codes) => analysisForm.setValue('codes', codes)} /></div>
              <div className="col-span-2 flex items-center gap-2"><Checkbox id="isActive" checked={analysisForm.watch('isActive')} onCheckedChange={(c) => analysisForm.setValue('isActive', !!c)} /><Label htmlFor="isActive">Активен</Label></div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogType(null)}>Отмена</Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editingItem ? 'Сохранить' : 'Создать'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Specialist Dialog */}
      <Dialog open={dialogType === 'specialist'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingItem ? 'Редактировать специалиста' : 'Добавить специалиста'}</DialogTitle></DialogHeader>
          <form onSubmit={specialistForm.handleSubmit((data) => handleSave('specialist', data))} className="space-y-4">
            <div><Label>Название *</Label><Input {...specialistForm.register('name')} /></div>
            <div><Label>Порядок</Label><Input type="number" {...specialistForm.register('orderIndex', { valueAsNumber: true })} /></div>
            <div><Label>Коды</Label><CodeInput value={specialistForm.watch('codes')} onChange={(codes) => specialistForm.setValue('codes', codes)} /></div>
            <div className="flex items-center gap-2"><Checkbox id="specActive" checked={specialistForm.watch('isActive')} onCheckedChange={(c) => specialistForm.setValue('isActive', !!c)} /><Label htmlFor="specActive">Активен</Label></div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogType(null)}>Отмена</Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editingItem ? 'Сохранить' : 'Создать'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diagnostic Dialog */}
      <Dialog open={dialogType === 'diagnostic'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingItem ? 'Редактировать диагностику' : 'Добавить диагностику'}</DialogTitle></DialogHeader>
          <form onSubmit={diagnosticForm.handleSubmit((data) => handleSave('diagnostic', data))} className="space-y-4">
            <div><Label>Название *</Label><Input {...diagnosticForm.register('name')} /></div>
            <div><Label>Описание</Label><Textarea {...diagnosticForm.register('description')} rows={2} /></div>
            <div><Label>Порядок</Label><Input type="number" {...diagnosticForm.register('orderIndex', { valueAsNumber: true })} /></div>
            <div><Label>Коды</Label><CodeInput value={diagnosticForm.watch('codes')} onChange={(codes) => diagnosticForm.setValue('codes', codes)} /></div>
            <div className="flex items-center gap-2"><Checkbox id="diagActive" checked={diagnosticForm.watch('isActive')} onCheckedChange={(c) => diagnosticForm.setValue('isActive', !!c)} /><Label htmlFor="diagActive">Активен</Label></div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogType(null)}>Отмена</Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editingItem ? 'Сохранить' : 'Создать'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recommendation Dialog */}
      <Dialog open={dialogType === 'recommendation'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Редактировать рекомендацию' : 'Добавить рекомендацию'}</DialogTitle></DialogHeader>
          <form onSubmit={recommendationForm.handleSubmit((data) => handleSave('recommendation', data))} className="space-y-4">
            <div><Label>Название *</Label><Input {...recommendationForm.register('name')} /></div>
            <div><Label>Порядок</Label><Input type="number" {...recommendationForm.register('orderIndex', { valueAsNumber: true })} /></div>
            <div><Label>Содержание *</Label><Textarea {...recommendationForm.register('content')} rows={6} /></div>
            <div className="flex items-center gap-2"><Checkbox id="recActive" checked={recommendationForm.watch('isActive')} onCheckedChange={(c) => recommendationForm.setValue('isActive', !!c)} /><Label htmlFor="recActive">Активен</Label></div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogType(null)}>Отмена</Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editingItem ? 'Сохранить' : 'Создать'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Удалить элемент?"
        description="Это действие нельзя отменить. Элемент будет удален навсегда."
        isLoading={isDeleting}
      />
    </div>
  );
}
