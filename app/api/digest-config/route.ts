import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailDigestConfigs, emailDigestFilters, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { calculateNextSendAt } from '@/lib/digest/scheduler';

// GET /api/digest-config - Get user's digest config
export async function GET() {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Get user to check email verification
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get digest config
    const config = await db.query.emailDigestConfigs.findFirst({
      where: eq(emailDigestConfigs.userId, userId),
    });

    if (!config) {
      // Return default config structure
      return NextResponse.json({
        enabled: false,
        frequency: 'daily',
        customDays: null,
        sendTime: '08:00',
        timezone: 'UTC',
        markAsRead: false,
        pausedDueToFailures: false,
        consecutiveFailures: 0,
        lastSentAt: null,
        nextSendAt: null,
        filters: [],
        emailVerified: user.emailVerified,
      });
    }

    // Get filters
    const filters = await db.query.emailDigestFilters.findMany({
      where: eq(emailDigestFilters.configId, config.id),
    });

    return NextResponse.json({
      ...config,
      filters,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error('Error fetching digest config:', error);
    return NextResponse.json({ error: 'Failed to fetch digest config' }, { status: 500 });
  }
}

// PUT /api/digest-config - Create or update digest config
export async function PUT(request: NextRequest) {
  try {
    const userIdResult = await getAuthenticatedUser();
    if (userIdResult instanceof NextResponse) return userIdResult;
    const userId = userIdResult;

    const body = await request.json();
    const {
      enabled,
      frequency,
      customDays,
      sendTime,
      timezone,
      markAsRead,
      filters,
    } = body;

    // Validate frequency
    if (!['daily', 'weekly', 'custom'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    // Validate customDays for custom frequency
    if (frequency === 'custom') {
      if (!customDays || customDays < 1 || customDays > 30) {
        return NextResponse.json(
          { error: 'customDays must be between 1 and 30 for custom frequency' },
          { status: 400 }
        );
      }
    }

    // Validate sendTime format (HH:mm)
    if (!/^\d{2}:\d{2}$/.test(sendTime)) {
      return NextResponse.json(
        { error: 'sendTime must be in HH:mm format' },
        { status: 400 }
      );
    }

    // Check if user's email is verified before enabling
    if (enabled) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user?.emailVerified) {
        return NextResponse.json(
          { error: 'Email must be verified before enabling digest' },
          { status: 400 }
        );
      }
    }

    // Check for existing config
    const existingConfig = await db.query.emailDigestConfigs.findFirst({
      where: eq(emailDigestConfigs.userId, userId),
    });

    // Calculate nextSendAt if enabling
    let nextSendAt: number | null = null;
    if (enabled) {
      nextSendAt = calculateNextSendAt({
        frequency,
        customDays: frequency === 'custom' ? customDays : null,
        sendTime,
        timezone,
      });
    }

    let configId: number;

    if (existingConfig) {
      // Update existing config
      const [updated] = await db
        .update(emailDigestConfigs)
        .set({
          enabled,
          frequency,
          customDays: frequency === 'custom' ? customDays : null,
          sendTime,
          timezone,
          markAsRead,
          nextSendAt,
          // Reset pause state if re-enabling
          pausedDueToFailures: enabled ? false : existingConfig.pausedDueToFailures,
          consecutiveFailures: enabled ? 0 : existingConfig.consecutiveFailures,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(emailDigestConfigs.id, existingConfig.id))
        .returning({ id: emailDigestConfigs.id });

      configId = updated.id;

      // Delete existing filters
      await db
        .delete(emailDigestFilters)
        .where(eq(emailDigestFilters.configId, configId));
    } else {
      // Create new config
      const [created] = await db
        .insert(emailDigestConfigs)
        .values({
          userId,
          enabled,
          frequency,
          customDays: frequency === 'custom' ? customDays : null,
          sendTime,
          timezone,
          markAsRead,
          nextSendAt,
        })
        .returning({ id: emailDigestConfigs.id });

      configId = created.id;
    }

    // Insert new filters
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        await db.insert(emailDigestFilters).values({
          configId,
          filterType: filter.filterType,
          filterValue: filter.filterValue,
        });
      }
    }

    // Return updated config
    const config = await db.query.emailDigestConfigs.findFirst({
      where: eq(emailDigestConfigs.id, configId),
    });

    const newFilters = await db.query.emailDigestFilters.findMany({
      where: eq(emailDigestFilters.configId, configId),
    });

    return NextResponse.json({
      ...config,
      filters: newFilters,
    });
  } catch (error) {
    console.error('Error updating digest config:', error);
    return NextResponse.json({ error: 'Failed to update digest config' }, { status: 500 });
  }
}

// DELETE /api/digest-config - Delete digest config
export async function DELETE() {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Get existing config
    const existingConfig = await db.query.emailDigestConfigs.findFirst({
      where: eq(emailDigestConfigs.userId, userId),
    });

    if (!existingConfig) {
      return NextResponse.json({ error: 'No digest config found' }, { status: 404 });
    }

    // Delete filters first (cascade should handle this, but be explicit)
    await db
      .delete(emailDigestFilters)
      .where(eq(emailDigestFilters.configId, existingConfig.id));

    // Delete config
    await db
      .delete(emailDigestConfigs)
      .where(eq(emailDigestConfigs.id, existingConfig.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting digest config:', error);
    return NextResponse.json({ error: 'Failed to delete digest config' }, { status: 500 });
  }
}
