import { prisma } from '../../prisma';
import { sendVerificationReminderEmail } from './email.service';

/**
 * Recurring Email Scheduler for Unverified Users
 * Runs periodically to remind unverified Seekers & Providers to complete verification.
 */
export async function runUnverifiedUserEmailReminderJob(): Promise<void> {
  console.log('⏰ Running Unverified User Email Reminder Job...');

  try {
    // 1. Fetch unverified Seekers
    const unverifiedSeekers = await prisma.user.findMany({
      where: {
        role: 'seeker',
        OR: [{ isVerified: false }, { isPhoneVerified: false }],
      },
      select: { email: true, name: true, role: true },
      take: 50,
    });

    for (const seeker of unverifiedSeekers) {
      if (seeker.email) {
        await sendVerificationReminderEmail(seeker.email, seeker.name, false);
      }
    }

    // 2. Fetch unverified Providers
    const unverifiedProviders = await prisma.user.findMany({
      where: {
        role: 'provider',
        isVerified: false,
      },
      select: { email: true, name: true, role: true },
      take: 50,
    });

    for (const provider of unverifiedProviders) {
      if (provider.email) {
        await sendVerificationReminderEmail(provider.email, provider.name, true);
      }
    }

    console.log(
      `✅ Reminder Emails Dispatched to ${unverifiedSeekers.length} Seekers & ${unverifiedProviders.length} Providers!`
    );
  } catch (err) {
    console.error('⚠️ Error running email reminder job:', err);
  }
}

/**
 * Initializes the recurring schedule interval (e.g. Every 48 hours in production, 24 hours default)
 */
export function startEmailReminderScheduler(intervalHours: number = 48): void {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  console.log(`🚀 Starting Email Reminder Scheduler (Interval: Every ${intervalHours} Hours)...`);

  // Initial trigger after 30 seconds on server boot for testing
  setTimeout(() => {
    runUnverifiedUserEmailReminderJob().catch((err) =>
      console.error('Initial reminder job failed:', err)
    );
  }, 30 * 1000);

  // Recurring schedule
  setInterval(() => {
    runUnverifiedUserEmailReminderJob().catch((err) =>
      console.error('Recurring reminder job failed:', err)
    );
  }, intervalMs);
}
