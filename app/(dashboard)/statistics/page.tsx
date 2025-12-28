'use client';

import React from 'react';
import { useAdminStatistics } from '@/hooks/use-admin-dashboard';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Loader2, Users, ClipboardList, CreditCard, Home, CheckCircle, Clock, XCircle } from 'lucide-react';
import TrafficSourceStats from '@/components/traffic-source-stats';

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  iconColor = 'text-teal-600',
}: {
  title: string;
  value: React.ReactNode;
  note?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {note && <div className="mt-2 text-xs text-gray-400">{note}</div>}
        </div>
        {Icon && (
          <div className={`p-2 bg-gray-50 rounded-lg ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function StatisticsPage() {
  const { data: stats, isLoading, error } = useAdminStatistics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ошибка загрузки статистики</h2>
          <p className="text-gray-500">Не удалось загрузить данные. Попробуйте обновить страницу.</p>
        </div>
      </div>
    );
  }

  const paidPct = stats.totalTests.total > 0
    ? Math.round((stats.totalTests.paid / stats.totalTests.total) * 100)
    : 0;

  const completedPct = stats.totalTests.total > 0
    ? Math.round((stats.totalTests.completed / stats.totalTests.total) * 100)
    : 0;

  const orderSuccessRate = stats.orderStats.total > 0
    ? Math.round((stats.orderStats.completed / stats.orderStats.total) * 100)
    : 0;

  const paymentPieData = [
    { name: 'Оплачено', value: stats.totalTests.paid, fill: '#10B981' },
    { name: 'Не оплачено', value: stats.totalTests.unpaid, fill: '#EF4444' },
  ];

  const orderPieData = [
    { name: 'Завершено', value: stats.orderStats.completed, fill: '#10B981' },
    { name: 'В обработке', value: stats.orderStats.pending, fill: '#F59E0B' },
    { name: 'Ошибка', value: stats.orderStats.failed, fill: '#EF4444' },
  ];

  const testStatsBarData = stats.testStats.map((stat) => ({
    name: stat.testTypeLabel,
    total: stat.total,
    paid: stat.paid,
    completed: stat.completed,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Статистика — Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Обновлено: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="Всего пользователей"
            value={stats.totalUsers.toLocaleString('ru-RU')}
            icon={Users}
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Всего тестов"
            value={stats.totalTests.total.toLocaleString('ru-RU')}
            note={`${paidPct}% оплачено`}
            icon={ClipboardList}
            iconColor="text-teal-600"
          />
          <MetricCard
            title="Всего заказов"
            value={stats.orderStats.total.toLocaleString('ru-RU')}
            note={`${orderSuccessRate}% успешно`}
            icon={CreditCard}
            iconColor="text-purple-600"
          />
          <MetricCard
            title="Invitro оплачено"
            value={stats.invitroStats.totalPaid.toLocaleString('ru-RU')}
            note={`${stats.invitroStats.totalUnpaid} не оплачено`}
            icon={CheckCircle}
            iconColor="text-green-600"
          />
          <MetricCard
            title="Выезды на дом"
            value={stats.invitroStats.homeVisitsRequested.toLocaleString('ru-RU')}
            note={`${stats.invitroStats.homeVisitsPaid} оплачено`}
            icon={Home}
            iconColor="text-orange-600"
          />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <ChartCard title="Статус оплаты тестов">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={6}
                      cornerRadius={8}
                    >
                      {paymentPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString('ru-RU') : value} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="Статистика по типам тестов">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={testStatsBarData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickLine={false} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString('ru-RU') : value} />
                    <Legend />
                    <Bar dataKey="total" name="Всего" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paid" name="Оплачено" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Завершено" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-1">
            <ChartCard title="Статус заказов">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={orderPieData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={6}
                      cornerRadius={8}
                    >
                      {orderPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString('ru-RU') : value} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="Детальная статистика тестов">
              <div className="space-y-3 max-h-[260px] overflow-y-auto">
                {stats.testStats.map((stat, index) => (
                  <div key={stat.testType} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div className="text-sm font-medium">{stat.testTypeLabel}</div>
                        <div className="text-xs text-gray-400">
                          {stat.total} тестов · {stat.completed} завершено
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        {stat.paid} оплачено
                      </div>
                      <div className="text-xs text-gray-400">
                        {stat.unpaid} не оплачено
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Invitro Stats Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Статистика Invitro">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.invitroStats.totalPaid}
                </div>
                <div className="text-sm text-gray-600">Оплачено</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.invitroStats.totalUnpaid}
                </div>
                <div className="text-sm text-gray-600">Не оплачено</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.invitroStats.homeVisitsRequested}
                </div>
                <div className="text-sm text-gray-600">Заявок на выезд</div>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {stats.invitroStats.homeVisitsPaid}
                </div>
                <div className="text-sm text-gray-600">Выездов оплачено</div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Статистика заказов">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {stats.orderStats.completed}
                </div>
                <div className="text-sm text-gray-600">Завершено</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.orderStats.pending}
                </div>
                <div className="text-sm text-gray-600">В обработке</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <XCircle className="h-6 w-6 mx-auto text-red-600 mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {stats.orderStats.failed}
                </div>
                <div className="text-sm text-gray-600">Ошибки</div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Traffic Source Statistics */}
        {stats.trafficSourceStats && stats.trafficSourceStats.length > 0 && (
          <TrafficSourceStats
            stats={stats.trafficSourceStats}
            totalTraffic={stats.totalTraffic}
          />
        )}
      </div>
    </div>
  );
}
