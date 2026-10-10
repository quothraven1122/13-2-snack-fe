'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import LoadingFallback from '@/components/ui/LoadingFallback/LoadingFallback';
import type { UserRole } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: UserRole[];
  // 서버 레이아웃이 accessToken에서 읽은 역할. 없으면 /me 응답을 기다린다.
  initialRole?: UserRole | null;
}>;

export default function RoleGuard({
  allowedRoles,
  initialRole = null,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canAccess = user !== null && allowedRoles.includes(user.role);
  // /me 응답 전이라도 서버에서 확인한 역할이 허용 범위면 화면을 먼저 그린다.
  const canRenderBeforeLoad =
    initialRole !== null && allowedRoles.includes(initialRole);

  useEffect(() => {
    if (isLoading || canAccess) {
      return;
    }

    router.replace(user ? '/products' : '/signin');
  }, [canAccess, isLoading, router, user]);

  if (isLoading) {
    return canRenderBeforeLoad ? children : <LoadingFallback />;
  }

  if (!canAccess) {
    return null;
  }

  return children;
}
