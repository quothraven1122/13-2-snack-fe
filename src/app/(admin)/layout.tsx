import type { PropsWithChildren } from 'react';

import { redirect } from 'next/navigation';

import RoleGuard from '@/components/auth/RoleGuard';
import Gnb from '@/components/ui/LogoGnb/Gnb';
import { checkAuthWithRefresh, getSessionRole } from '@/lib/auth/session';
import type { UserRole } from '@/lib/services/userService';

const ALLOWED_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

export default async function Layout({ children }: PropsWithChildren) {
  const isAuthenticated = await checkAuthWithRefresh();

  if (!isAuthenticated) {
    redirect('/signin');
  }

  const sessionRole = await getSessionRole();

  if (sessionRole && !ALLOWED_ROLES.includes(sessionRole)) {
    redirect('/products');
  }

  return (
    <RoleGuard allowedRoles={ALLOWED_ROLES} initialRole={sessionRole}>
      <div className="min-h-dvh">
        <Gnb />
        <main>
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
