import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export async function GET() {
  try {
    const settingsRecords = await prisma.siteSetting.findMany();
    const settingsMap: any = { ...DEFAULT_SETTINGS };

    for (const item of settingsRecords) {
      try {
        settingsMap[item.key] = JSON.parse(item.value);
      } catch {
        settingsMap[item.key] = item.value;
      }
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}
