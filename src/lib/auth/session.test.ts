import { getSessionRole } from './session';

let mockAccessToken: string | undefined;

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'accessToken' && mockAccessToken !== undefined
        ? { value: mockAccessToken }
        : undefined,
  }),
}));

function createToken(payload: Record<string, unknown>): string {
  const encode = (value: object): string =>
    Buffer.from(JSON.stringify(value)).toString('base64url');

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

const nowInSeconds = (): number => Math.floor(Date.now() / 1000);

describe('getSessionRole', () => {
  beforeEach(() => {
    mockAccessToken = undefined;
  });

  it('만료되지 않은 토큰이면 payload의 역할을 반환한다', async () => {
    mockAccessToken = createToken({
      role: 'SUPER_ADMIN',
      exp: nowInSeconds() + 60,
    });

    await expect(getSessionRole()).resolves.toBe('SUPER_ADMIN');
  });

  it('accessToken 쿠키가 없으면 null을 반환한다', async () => {
    await expect(getSessionRole()).resolves.toBeNull();
  });

  it('만료된 토큰이면 null을 반환한다', async () => {
    mockAccessToken = createToken({
      role: 'ADMIN',
      exp: nowInSeconds() - 1,
    });

    await expect(getSessionRole()).resolves.toBeNull();
  });

  it('알 수 없는 역할이면 null을 반환한다', async () => {
    mockAccessToken = createToken({ role: 'OWNER', exp: nowInSeconds() + 60 });

    await expect(getSessionRole()).resolves.toBeNull();
  });

  it('JWT 형식이 아니면 null을 반환한다', async () => {
    mockAccessToken = 'not-a-jwt';

    await expect(getSessionRole()).resolves.toBeNull();
  });

  it('payload가 JSON이 아니면 null을 반환한다', async () => {
    mockAccessToken = 'header.%%%.signature';

    await expect(getSessionRole()).resolves.toBeNull();
  });
});
