'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { TrafficSourceStat } from '@/lib/types';

interface TrafficSourceStatsProps {
  stats: TrafficSourceStat[];
  totalTraffic: number;
}

const TRAFFIC_COLORS: Record<string, string> = {
  organic: '#10B981', // Green
  instagram: '#EC4899', // Pink
  google: '#3B82F6', // Blue
  facebook: '#8B5CF6', // Purple
  youtube: '#EF4444', // Red
  twitter: '#06B6D4', // Cyan
  default: '#84CC16', // Yellow-Green
};

const SOURCE_LABELS: Record<string, string> = {
  organic: 'Органический',
  instagram: 'Instagram',
  google: 'Google',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'Twitter',
};

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

export default function TrafficSourceStats({ stats, totalTraffic }: TrafficSourceStatsProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  const chartData = stats.map((stat) => ({
    name: SOURCE_LABELS[stat.source] || stat.source,
    value: stat.totalVisitors,
    fill: TRAFFIC_COLORS[stat.source] || TRAFFIC_COLORS.default,
  }));

  const getSourceColor = (source: string) => {
    return TRAFFIC_COLORS[source] || TRAFFIC_COLORS.default;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pie Chart */}
      <div className="lg:col-span-1">
        <ChartCard title="Источники трафика">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  cornerRadius={8}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Stats */}
      <div className="lg:col-span-2">
        <ChartCard title="Детальная статистика трафика">
          <div className="space-y-3 max-h-[260px] overflow-y-auto">
            {stats.map((stat) => {
              const sourceLabel = SOURCE_LABELS[stat.source] || stat.source;
              const returnRate = stat.totalVisitors > 0
                ? ((stat.totalVisitors - stat.uniqueVisitors) / stat.totalVisitors * 100).toFixed(1)
                : '0';

              return (
                <div
                  key={stat.source}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getSourceColor(stat.source) }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{sourceLabel}</span>
                        <span className="text-xs text-gray-400 uppercase">{stat.medium}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {stat.totalVisitors.toLocaleString('ru-RU')} посещений ·{' '}
                        {stat.uniqueVisitors.toLocaleString('ru-RU')} уникальных
                        {stat.totalVisitors > stat.uniqueVisitors && (
                          <span className="ml-1">· {returnRate}% повторных</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-semibold" style={{ color: getSourceColor(stat.source) }}>
                        {stat.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">доля трафика</div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalTraffic > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                Всего посещений: <span className="font-semibold">{totalTraffic.toLocaleString('ru-RU')}</span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
