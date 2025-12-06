'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Dumbbell, Baby, Heart } from 'lucide-react';

const testTypes = [
  {
    title: 'Женский чекап',
    description: 'Анализы и рекомендации для женщин',
    icon: Users,
    href: '/female',
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Мужской чекап',
    description: 'Анализы и рекомендации для мужчин',
    icon: User,
    href: '/male',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Спорт чекап',
    description: 'Анализы для спортсменов',
    icon: Dumbbell,
    href: '/sport',
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Планирование беременности (жен)',
    description: 'Подготовка к беременности для женщин',
    icon: Baby,
    href: '/female-pregnancy',
    color: 'from-purple-500 to-violet-500',
  },
  {
    title: 'Планирование беременности (муж)',
    description: 'Подготовка к беременности для мужчин',
    icon: Baby,
    href: '/male-pregnancy',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    title: 'После родов',
    description: 'Послеродовые анализы',
    icon: Heart,
    href: '/post-pregnant',
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Интим тест',
    description: 'Интимные анализы и обследования',
    icon: Heart,
    href: '/intim',
    color: 'from-fuchsia-500 to-pink-500',
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Панель управления</h2>
        <p className="text-sm text-gray-500 mt-1">
          Выберите тип теста для управления данными
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testTypes.map((item) => (
          <Link key={item.title} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
