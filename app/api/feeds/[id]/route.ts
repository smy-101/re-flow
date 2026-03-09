import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems, pipelines, craftTemplates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/feeds/[id] - Get a single feed by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await context.params;
    const feedId = parseInt(id, 10);

    if (isNaN(feedId)) {
      return NextResponse.json({ error: 'Invalid feed ID' }, { status: 400 });
    }

    // Fetch feed
    const feed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Calculate unread count
    const unreadCount = await db
      .select({ count: feedItems.id })
      .from(feedItems)
      .where(and(eq(feedItems.feedId, feedId), eq(feedItems.isRead, false)));

    const feedWithUnread = {
      ...feed,
      unreadCount: unreadCount.length,
    };

    return NextResponse.json(feedWithUnread);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// PUT /api/feeds/[id] - Update a feed
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await context.params;
    const feedId = parseInt(id, 10);

    if (isNaN(feedId)) {
      return NextResponse.json({ error: 'Invalid feed ID' }, { status: 400 });
    }

    // Check if feed exists and belongs to user
    const existingFeed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!existingFeed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, category, pipelineId, templateId, autoProcess } = body;

    // Validate auto-process configuration
    if (autoProcess === true) {
      // Check if either pipelineId or templateId is provided
      const effectivePipelineId = pipelineId ?? existingFeed.pipelineId;
      const effectiveTemplateId = templateId ?? existingFeed.templateId;

      if (!effectivePipelineId && !effectiveTemplateId) {
        return NextResponse.json(
          { error: '自动处理需要配置管道或模板' },
          { status: 400 }
        );
      }
      if (effectivePipelineId && effectiveTemplateId) {
        return NextResponse.json(
          { error: '管道和模板只能选择其中一个' },
          { status: 400 }
        );
      }
    }

    // Validate pipeline/template ownership if provided
    if (pipelineId !== undefined && pipelineId !== null) {
      const pipeline = await db.query.pipelines.findFirst({
        where: eq(pipelines.id, pipelineId),
      });
      if (!pipeline || pipeline.userId !== userId) {
        return NextResponse.json({ error: '管道不存在或无权访问' }, { status: 400 });
      }
    }

    if (templateId !== undefined && templateId !== null) {
      const template = await db.query.craftTemplates.findFirst({
        where: eq(craftTemplates.id, templateId),
      });
      if (!template || template.userId !== userId) {
        return NextResponse.json({ error: '模板不存在或无权访问' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      lastUpdatedAt: Math.floor(Date.now() / 1000),
    };

    if (title !== undefined) {
      updateData.title = title;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (pipelineId !== undefined) {
      updateData.pipelineId = pipelineId;
    }
    if (templateId !== undefined) {
      updateData.templateId = templateId;
    }
    if (autoProcess !== undefined) {
      updateData.autoProcess = autoProcess;
    }

    // Handle mutual exclusivity: if setting one, clear the other
    if (pipelineId !== undefined && pipelineId !== null) {
      updateData.templateId = null;
    }
    if (templateId !== undefined && templateId !== null) {
      updateData.pipelineId = null;
    }

    // Update feed
    const [updatedFeed] = await db
      .update(feeds)
      .set(updateData)
      .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)))
      .returning();

    return NextResponse.json(updatedFeed);
  } catch (error) {
    console.error('Error updating feed:', error);
    return NextResponse.json({ error: 'Failed to update feed' }, { status: 500 });
  }
}

// DELETE /api/feeds/[id] - Delete a feed
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await context.params;
    const feedId = parseInt(id, 10);

    if (isNaN(feedId)) {
      return NextResponse.json({ error: 'Invalid feed ID' }, { status: 400 });
    }

    // Check if feed exists and belongs to user
    const existingFeed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!existingFeed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Delete feed (cascade will delete associated items)
    await db
      .delete(feeds)
      .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 });
  }
}
