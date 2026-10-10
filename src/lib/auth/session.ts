import { cookies } from 'next/headers';

import type { UserRole } from '@/lib/services/userService';

const USER_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'GENERAL'];

type AccessTokenPayload = {
  role: UserRole;
  exp: number;
};

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();

  return Boolean(cookieStore.get('accessToken')?.value);
}

export async function checkAuthWithRefresh(): Promise<boolean> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  return Boolean(accessToken ?? refreshToken);
}

function isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { role, exp } = value as Record<string, unknown>;

  return typeof exp === 'number' && USER_ROLES.includes(role as UserRole);
}

function decodeAccessToken(token: string): AccessTokenPayload | null {
  const encodedPayload = token.split('.')[1];

  if (!encodedPayload) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    );

    return isAccessTokenPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

/**
 * accessToken 쿠키의 payload에서 역할을 읽는다.
 * 서명은 검증하지 않으므로 화면을 먼저 그릴지 판단하는 용도로만 사용한다.
 * 실제 권한 검증은 백엔드 API와 클라이언트의 /me 조회가 담당한다.
 * 토큰이 없거나 만료됐거나 형식이 잘못되면 null을 반환한다.
 */
export async function getSessionRole(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return null;
  }

  const payload = decodeAccessToken(accessToken);

  if (!payload || payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload.role;
}
