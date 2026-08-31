import prisma from './prisma';

/**
 * Generates an official unique Seat Number (رقم جلوس) for students.
 * Format: 5 to 6 digits unique student number (e.g., 14028, 25031, etc.)
 */
export async function generateUniqueSeatNumber(): Promise<string> {
  let isUnique = false;
  let candidate = '';
  let attempts = 0;

  while (!isUnique && attempts < 20) {
    attempts++;
    // Generate a 5-digit number starting with 10000 - 99999
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    candidate = String(randomNum);

    const existing = await prisma.user.findFirst({
      where: { seatNumber: candidate },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  // Fallback timestamp-based if many attempts
  if (!isUnique) {
    candidate = String(Date.now()).slice(-6);
  }

  return candidate;
}
