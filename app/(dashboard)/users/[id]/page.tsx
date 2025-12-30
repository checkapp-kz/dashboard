'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { UserListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
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
  User,
  Mail,
  Calendar,
  Tag,
  CheckCircle2,
  XCircle,
  Home,
  CreditCard,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

function useUserDetails(id: string) {
  return useQuery({
    queryKey: ['adminUser', id],
    queryFn: async () => {
      const { data } = await api.get<UserListItem>(`/admin-data/dashboard/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading, error } = useUserDetails(id);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Пользователь не найден</h3>
          <p className="text-muted-foreground">Не удалось загрузить данные пользователя</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Информация о пользователе</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Имя</div>
            <div className="font-medium">{user.name || '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">CheckApp ID</div>
            <div className="font-mono">{user.checkappId || '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Дата рождения</div>
            <div className="font-medium">{formatDate(user.birthDate)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 flex items-center justify-center">
            {user.isVerified ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Верификация</div>
            <div className="font-medium">
              {user.isVerified ? 'Подтвержден' : 'Не подтвержден'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Источник</div>
            <div className="font-medium">{user.incomingSource || '—'}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 border rounded-lg text-center bg-white">
          <div className="text-3xl font-bold text-teal-600">{user.totalTests}</div>
          <div className="text-sm text-muted-foreground">Всего тестов</div>
        </div>
        <div className="p-6 border rounded-lg text-center bg-white">
          <div className="text-3xl font-bold text-green-600">{user.paidTests}</div>
          <div className="text-sm text-muted-foreground">Оплачено</div>
        </div>
        <div className="p-6 border rounded-lg text-center bg-white">
          <div className="text-3xl font-bold text-blue-600">{user.purchases.length}</div>
          <div className="text-sm text-muted-foreground">Покупок</div>
        </div>
        <div className="p-6 border rounded-lg text-center bg-white">
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
            {user.role}
          </Badge>
          <div className="text-sm text-muted-foreground mt-2">Роль</div>
        </div>
      </div>

      {/* Purchases */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Покупки и тесты</h2>
        {user.purchases.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Нет покупок</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID теста</TableHead>
                  <TableHead>Тип теста</TableHead>
                  <TableHead>Статус оплаты</TableHead>
                  <TableHead>Invitro</TableHead>
                  <TableHead>Выезд на дом</TableHead>
                  <TableHead>Дата создания</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.purchases.map((purchase) => (
                  <TableRow key={purchase.testId}>
                    <TableCell className="font-mono text-sm">
                      {purchase.testId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.testTypeLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      {purchase.price === 0 || purchase.price == null ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          Бесплатно
                        </Badge>
                      ) : purchase.status === 'PAID' ? (
                        <Badge className="bg-green-100 text-green-800">
                          Оплачено
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Не оплачено</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.invitroPaid ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Оплачено</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-muted-foreground">Нет</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.homeVisit ? (
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-teal-600" />
                          <span className="text-sm">Да</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Нет</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(purchase.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
