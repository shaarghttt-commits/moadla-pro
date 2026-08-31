import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' });
  try {
    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
  } catch (e) {
    // Ignore if cookies cannot be set in this environment during build
  }
  return response;
}
