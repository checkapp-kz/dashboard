'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers } from '@/hooks/use-admin-dashboard';
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
import {
  Loader2,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useAdminUsers({
    email: debouncedQuery || undefined,
    page,
    limit,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground mt-2">
            Список пользователей и их тестов
          </p>
        </div>
        {data && (
          <div className="text-sm text-muted-foreground">
            Всего: <span className="font-medium text-foreground">{data.total}</span> пользователей
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="На странице" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 на стр.</SelectItem>
            <SelectItem value="20">20 на стр.</SelectItem>
            <SelectItem value="50">50 на стр.</SelectItem>
            <SelectItem value="100">100 на стр.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : !data || data.users.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет пользователей</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Не найдено пользователей по вашему запросу'
              : 'Пользователи пока не зарегистрированы'}
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>CheckApp ID</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Верифицирован</TableHead>
                  <TableHead>Тестов</TableHead>
                  <TableHead>Оплачено</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{user.checkappId || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isVerified ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.totalTests}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {user.paidTests}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/users/${user.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Детали
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Страница {data.page} из {data.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
              >
                Вперед
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
