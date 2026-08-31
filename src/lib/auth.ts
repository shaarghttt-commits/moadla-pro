import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'moadla-pro-super-secret-jwt-key-2025-production-ready'
);

const COOKIE_NAME = 'moadla_session';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(_req?: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        phone: true,
        bio: true,
        avatar: true,
        department: true,
        yearOfStudy: true,
        seatNumber: true,
        isOnline: true,
        lastSeenAt: true,
        isActive: true,
        createdAt: true,
        league: true,
        weeklyXp: true,
        gamePoints: true,
        currentStreak: true,
        longestStreak: true,
        activeFrame: true,
        activeTitle: true,
      },
    });

    if (!user || !user.isActive) return null;

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export { COOKIE_NAME };
