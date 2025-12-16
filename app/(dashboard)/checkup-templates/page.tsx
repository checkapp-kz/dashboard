'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCheckupTemplates,
  useToggleCheckupTemplateActive,
  useDeleteCheckupTemplate,
} from '@/hooks/use-checkup-templates';
import type { CheckupTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeleteDialog } from '@/components/delete-dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function CheckupTemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteItem, setDeleteItem] = useState<CheckupTemplate | null>(null);

  const { data: templates, isLoading } = useCheckupTemplates();
  const toggleActive = useToggleCheckupTemplateActive();
  const deleteTemplate = useDeleteCheckupTemplate();

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.testKey.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive.mutateAsync(id);
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteTemplate.mutateAsync(deleteItem._id);
      setDeleteItem(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Шаблоны чекапов</h1>
          <p className="text-muted-foreground mt-2">
            Управление шаблонами тестов для пользователей
          </p>
        </div>
        <Button
          onClick={() => router.push('/checkup-templates/create')}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Создать шаблон
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или ключу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : !filteredTemplates || filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет шаблонов</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Не найдено шаблонов по вашему запросу'
              : 'Начните с создания первого шаблона чекапа'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              onClick={() => router.push('/checkup-templates/create')}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать шаблон
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ключ</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Вопросов</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className="font-mono text-sm">{template.testKey}</TableCell>
                  <TableCell className="font-medium">{template.title}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(template._id)}
                      disabled={toggleActive.isPending}
                      className="inline-flex"
                    >
                      {template.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="hover:bg-gray-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          Неактивен
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {template.free ? (
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Бесплатный
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-cyan-700 border-cyan-300">
                        Платный
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(template.price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.questions.length}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(template.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/checkup-templates/${template._id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Редактировать</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteItem(template)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          > 
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Удалить</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title={`Удалить "${deleteItem?.title}"?`}
        description="Это действие нельзя отменить. Шаблон чекапа будет удален навсегда."
        loading={deleteTemplate.isPending}
      />
    </div>
  );
}
