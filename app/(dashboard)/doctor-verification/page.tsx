'use client';

import { useState } from 'react';
import {
  useDoctorApplications,
  useDoctorApplicationsStats,
  useToggleDoctorVerification,
} from '@/hooks/use-doctor-verification';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  UserCheck,
  Clock,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Building2,
  Mail,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import type { DoctorApplication, DoctorVerificationStatus } from '@/lib/types';

export default function DoctorVerificationPage() {
  const [activeTab, setActiveTab] = useState<DoctorVerificationStatus>('pending');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Dialogs state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries
  const { data: stats } = useDoctorApplicationsStats();
  const { data, isLoading } = useDoctorApplications({
    status: activeTab,
    page,
    limit,
  });

  // Mutations
  const toggleMutation = useToggleDoctorVerification();

  const handleTabChange = (value: string) => {
    setActiveTab(value as DoctorVerificationStatus);
    setPage(1);
  };

  const openDetails = (doctor: DoctorApplication) => {
    setSelectedDoctor(doctor);
    setIsDetailsOpen(true);
  };

  const handleToggleVerification = async (doctor: DoctorApplication) => {
    try {
      await toggleMutation.mutateAsync({
        doctorId: doctor.id,
        isDoctorVerified: !doctor.isDoctorVerified,
      });
      toast.success(
        doctor.isDoctorVerified
          ? 'Верификация врача отменена'
          : 'Врач успешно верифицирован'
      );
    } catch {
      toast.error('Ошибка при изменении статуса верификации');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: DoctorVerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="h-3 w-3 mr-1" /> Ожидает</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle2 className="h-3 w-3 mr-1" /> Верифицирован</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Верификация врачей</h1>
          <p className="text-muted-foreground mt-2">
            Управление статусом верификации врачей
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Ожидают:</span>
              <span className="font-medium">{stats.pending}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Верифицировано:</span>
              <span className="font-medium">{stats.approved}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Ожидают проверки
              {stats && stats.pending > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Верифицированные
            </TabsTrigger>
          </TabsList>

          <Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="На странице" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 на стр.</SelectItem>
              <SelectItem value="20">20 на стр.</SelectItem>
              <SelectItem value="50">50 на стр.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : !data || data.applications.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет заявок</h3>
              <p className="text-muted-foreground">
                {activeTab === 'pending' && 'Нет заявок, ожидающих проверки'}
                {activeTab === 'approved' && 'Нет верифицированных врачей'}
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Врач</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Специализация</TableHead>
                      <TableHead>Стаж</TableHead>
                      <TableHead>Место работы</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Верификация</TableHead>
                      <TableHead className="text-right">Детали</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.applications.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {doctor.avatarUrl ? (
                              <img
                                src={doctor.avatarUrl}
                                alt={doctor.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-sm">
                                {getInitials(doctor.name)}
                              </div>
                            )}
                            <span className="font-medium">{doctor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{doctor.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doctor.specialization}</Badge>
                        </TableCell>
                        <TableCell>{doctor.experience} лет</TableCell>
                        <TableCell className="max-w-[200px] truncate">{doctor.workplace}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(doctor.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={doctor.isDoctorVerified}
                              onCheckedChange={() => handleToggleVerification(doctor)}
                              disabled={toggleMutation.isPending}
                            />
                            <span className="text-sm text-muted-foreground">
                              {doctor.isDoctorVerified ? 'Да' : 'Нет'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetails(doctor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
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
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Информация о враче</DialogTitle>
            <DialogDescription>Детальная информация о враче</DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-4">
              {/* Avatar and name */}
              <div className="flex items-center gap-4">
                {selectedDoctor.avatarUrl ? (
                  <img
                    src={selectedDoctor.avatarUrl}
                    alt={selectedDoctor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-lg">
                    {getInitials(selectedDoctor.name)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedDoctor.verificationStatus)}
                    {selectedDoctor.isVerified && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        <Mail className="h-3 w-3 mr-1" /> Email подтвержден
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" /> Email
                  </div>
                  <p className="font-medium">{selectedDoctor.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Stethoscope className="h-4 w-4" /> Специализация
                  </div>
                  <p className="font-medium">{selectedDoctor.specialization}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Briefcase className="h-4 w-4" /> Стаж работы
                  </div>
                  <p className="font-medium">{selectedDoctor.experience} лет</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" /> Дата регистрации
                  </div>
                  <p className="font-medium">{formatDate(selectedDoctor.createdAt)}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Building2 className="h-4 w-4" /> Место работы
                  </div>
                  <p className="font-medium">{selectedDoctor.workplace}</p>
                </div>
              </div>

              {/* Verification toggle */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Статус верификации</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoctor.isDoctorVerified
                        ? 'Врач отображается в публичном списке'
                        : 'Врач не отображается в публичном списке'}
                    </p>
                  </div>
                  <Switch
                    checked={selectedDoctor.isDoctorVerified}
                    onCheckedChange={() => handleToggleVerification(selectedDoctor)}
                    disabled={toggleMutation.isPending}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
