'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useAuthHydrated } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useTestTypes } from '@/hooks/use-test-types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LogOut,
  Menu,
  X,
  FileText,
  ChartArea,
  Loader2,
  Users,
} from 'lucide-react';

const managementNavigation = [
  { name: 'Шаблоны чекапов', href: '/checkup-templates', icon: FileText },
  { name: 'Пользователи', href: '/users', icon: Users },
];

const statisticsNavigation = [
  { name: 'Статистика', href: '/statistics', icon: ChartArea },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasHydrated = useAuthHydrated();

  const { testTypes, isLoading: loadingTestTypes } = useTestTypes();

  const navigation = useMemo(() => {
    return testTypes.map((type) => ({
      name: type.label,
      href: `/${type.value}`,
    }));
  }, [testTypes]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  const currentNav = navigation.find((item) => {
    const exactMatch = pathname === item.href;
    const prefixMatch = pathname.startsWith(item.href + '/');
    return exactMatch || prefixMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-linear-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">CA</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">CheckApp</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Типы тестов
            </p>
            {loadingTestTypes ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              </div>
            ) : navigation.map((item) => {
              const exactMatch = pathname === item.href;
              const prefixMatch = pathname.startsWith(item.href + '/');
              const isActive = exactMatch || prefixMatch;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-linear-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-100'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Управление
              </p>
              {managementNavigation.map((item) => {
                const exactMatch = pathname === item.href;
                const prefixMatch = pathname.startsWith(item.href + '/');
                const isActive = exactMatch || prefixMatch;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-linear-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', isActive ? 'text-teal-600' : 'text-gray-400')} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className='pt-4 mt-4 border-t border-gray-200'>
              <p className='px-3 text-xs font-semiboold text-gray-400 uppercase tracking-wider mb-2'>
                Статистика
              </p>
              {statisticsNavigation.map((item) => {
                const exactMatch = pathname === item.href;
                const prefixMatch = pathname.startsWith(item.href + '/');
                const isActive = exactMatch || prefixMatch;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-linear-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', isActive ? 'text-teal-600' : 'text-gray-400')} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-2.5 px-3 hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email || 'Админ'}
                    </p>
                    <p className="text-xs text-gray-500">Администратор</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {currentNav?.name || 'Панель управления'}
          </h1>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
