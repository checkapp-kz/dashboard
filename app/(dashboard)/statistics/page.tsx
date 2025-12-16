'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

// --- Fake data (можно заменить на реальные данные) ---
const paymentData = [
  { name: 'Оплачено', value: 320, fill: '#10B981' },
  { name: 'Не оплачено', value: 120, fill: '#EF4444' },
];

const monthlyRevenue = [
  { month: 'Янв', revenue: 4200, checks: 120 },
  { month: 'Фев', revenue: 3800, checks: 110 },
  { month: 'Мар', revenue: 5200, checks: 150 },
  { month: 'Апр', revenue: 4800, checks: 130 },
  { month: 'Май', revenue: 6100, checks: 180 },
  { month: 'Июн', revenue: 6700, checks: 200 },
  { month: 'Июл', revenue: 7300, checks: 220 },
  { month: 'Авг', revenue: 6900, checks: 210 },
  { month: 'Сен', revenue: 6400, checks: 195 },
  { month: 'Окт', revenue: 7100, checks: 215 },
  { month: 'Ноя', revenue: 7800, checks: 240 },
  { month: 'Дек', revenue: 8200, checks: 260 },
];

const last14Days = Array.from({ length: 14 }).map((_, i) => ({
  day: `-${13 - i}д`,
  checks: Math.floor(40 + Math.random() * 80),
  paid: Math.floor(20 + Math.random() * 60),
}));

const topClinics = [
  { name: 'Invitro Алматы', checks: 520, paidPct: 0.82 },
  { name: 'Invitro Нур-Султан', checks: 410, paidPct: 0.77 },
  { name: 'Polyclinic №5', checks: 320, paidPct: 0.69 },
];

// --- Utility formatters ---
const r = (n: number) => `${n.toLocaleString('ru-RU')} ₸`;
const pct = (v: number) => `${Math.round(v * 100)}%`;

function MetricCard({ title, value, note }: { title: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {note && <div className="mt-2 text-xs text-gray-400">{note}</div>}
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

export default function StatisticsPage() {
  const totalChecks = monthlyRevenue.reduce((s, m) => s + m.checks, 0);
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const paid = paymentData.find((d) => d.name === 'Оплачено')?.value ?? 0;
  const unpaid = paymentData.find((d) => d.name === 'Не оплачено')?.value ?? 0;
  const paidPct = paid / Math.max(1, paid + unpaid);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Статистика — Оплата чеков (Invitro)</h1>
            <p className="text-sm text-gray-500 mt-1">Фейковые данные для демонстрации · Обновлено: {new Date().toLocaleDateString('ru-RU')}</p>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Всего чеков (за год)" value={<>{totalChecks}</>} note={`За 12 месяцев`} />
          <MetricCard title="Общий доход" value={<>{r(totalRevenue)}</>} note={`Средний чек ${r(Math.round(totalRevenue / Math.max(1, totalChecks)))}`} />
          <MetricCard title="Оплачен" value={<>{pct(paidPct)}</>} note={`${paid} оплачено, ${unpaid} не оплачено`} />
          <MetricCard title="Активные клиники" value={<>{topClinics.length}</>} note={`Топ-3 по количеству чеков`} />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChartCard title="Статус оплат">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={6}
                      cornerRadius={8}
                      isAnimationActive={true}
                    >
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} чел.`} />
                    <Legend verticalAlign="bottom" height={36} formatter={(value) => `${value}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 flex gap-3 justify-center text-sm text-gray-600">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10B981]"></span> Оплачено</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#EF4444]"></span> Не оплачено</div>
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="Доход и количество чеков по месяцам">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} />
                    <Tooltip formatter={(value: any) => (typeof value === 'number' ? r(value) : value)} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#g1)" />
                    <Line yAxisId="right" type="monotone" dataKey="checks" stroke="#10B981" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-1">
            <ChartCard title="Чеки за последние 14 дней">
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={last14Days} margin={{ right: 10, left: -10 }}>
                    <CartesianGrid stroke="#f3f4f6" />
                    <XAxis dataKey="day" tickLine={false} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="checks" stroke="#6366F1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="paid" stroke="#10B981" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="Топ клиник">
              <div className="space-y-3">
                {topClinics.map((c) => (
                  <div key={c.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-gray-400">Чеков: {c.checks}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{pct(c.paidPct)}</div>
                      <div className="text-xs text-gray-400">Оплачено</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-1">
            <ChartCard title="Конверсия / Платежи (бар)">
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyRevenue} margin={{ left: -20 }}>
                    <CartesianGrid stroke="#f3f4f6" />
                    <XAxis dataKey="month" tickLine={false} />
                    <YAxis />
                    <Tooltip formatter={(val: any) => (typeof val === 'number' ? val : val)} />
                    <Bar dataKey="checks" barSize={14} radius={[6, 6, 6, 6]} fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        <footer className="mt-8 text-sm text-gray-400 text-center">Сгенерировано — демонстрационные данные. Замените массивы на реальные API-запросы.</footer>
      </div>
    </div>
  );
}
