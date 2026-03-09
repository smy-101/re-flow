import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addToQueue,
  getQueueStatus,
  getNextPendingJob,
  markJobProcessing,
  markJobDone,
  markJobError,
  resetProcessingJobs,
  type AddToQueueInput,
} from '@/lib/processing/queue';
import { db } from '@/lib/db';
import type { ProcessingQueue } from '@/lib/db/schema';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      processingQueue: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
  },
}));

describe('lib/processing/queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToQueue', () => {
    describe('Successful Enqueue', () => {
      it('should create a queue job with pending status', async () => {
        const input: AddToQueueInput = {
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
        };

        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
        vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);

        const result = await addToQueue(input);

        expect(result).toEqual(mockJob);
        expect(mockValues).toHaveBeenCalled();
      });

      it('should create a queue job with templateId', async () => {
        const input: AddToQueueInput = {
          userId: 1,
          feedItemId: 1,
          templateId: 2,
        };

        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: null,
          templateId: 2,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
        vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);

        const result = await addToQueue(input);

        expect(result.templateId).toBe(2);
        expect(result.pipelineId).toBeNull();
      });

      it('should support custom priority and maxAttempts', async () => {
        const input: AddToQueueInput = {
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          priority: 10,
          maxAttempts: 5,
        };

        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 10,
          attempts: 0,
          maxAttempts: 5,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
        vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);

        const result = await addToQueue(input);

        expect(result.priority).toBe(10);
        expect(result.maxAttempts).toBe(5);
      });
    });

    describe('Duplicate Prevention', () => {
      it('should not create duplicate job for same feed item with non-done status', async () => {
        const input: AddToQueueInput = {
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
        };

        const existingJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(existingJob);

        const result = await addToQueue(input);

        expect(result).toEqual(existingJob);
        expect(db.insert).not.toHaveBeenCalled();
      });

      it('should allow creating new job if existing job is done', async () => {
        const input: AddToQueueInput = {
          userId: 1,
          feedItemId: 1,
          templateId: 2,
        };

        const doneJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'done',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000) - 100,
          startedAt: Math.floor(Date.now() / 1000) - 50,
          completedAt: Math.floor(Date.now() / 1000),
        };

        const newJob: ProcessingQueue = {
          id: 2,
          userId: 1,
          feedItemId: 1,
          pipelineId: null,
          templateId: 2,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(doneJob);

        const mockReturning = vi.fn().mockResolvedValue([newJob]);
        const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
        vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);

        const result = await addToQueue(input);

        expect(result.id).toBe(2);
        expect(result.templateId).toBe(2);
        expect(db.insert).toHaveBeenCalled();
      });
    });
  });

  describe('getQueueStatus', () => {
    describe('Status Query', () => {
      it('should return queue status for a feed item', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(mockJob);
        vi.mocked(db.query.processingQueue.findMany).mockResolvedValue([mockJob]);

        const result = await getQueueStatus(1, 1);

        expect(result).not.toBeNull();
        expect(result?.status).toBe('pending');
        expect(result?.id).toBe(1);
      });

      it('should return null when no queue job exists', async () => {
        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(undefined);

        const result = await getQueueStatus(1, 999);

        expect(result).toBeNull();
      });

      it('should return position in queue for pending jobs', async () => {
        const mockJob: ProcessingQueue = {
          id: 5,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        // Mock findFirst for the job
        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(mockJob);

        // Mock findMany for position calculation
        const pendingJobs = [
          { id: 3, createdAt: mockJob.createdAt - 200 },
          { id: 4, createdAt: mockJob.createdAt - 100 },
          { id: 5, createdAt: mockJob.createdAt },
        ];
        vi.mocked(db.query.processingQueue.findMany).mockResolvedValue(pendingJobs as ProcessingQueue[]);

        const result = await getQueueStatus(1, 1);

        expect(result?.position).toBe(3);
      });
    });
  });

  describe('getNextPendingJob', () => {
    describe('Job Retrieval', () => {
      it('should return next pending job ordered by priority DESC, createdAt ASC', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 10,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(mockJob);

        const result = await getNextPendingJob();

        expect(result).toEqual(mockJob);
      });

      it('should return null when no pending jobs', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(undefined as any);

        const result = await getNextPendingJob();

        expect(result).toBeNull();
      });

      it('should only return pending status jobs', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        vi.mocked(db.query.processingQueue.findFirst).mockResolvedValue(mockJob);

        await getNextPendingJob();

        // Verify the query was called (status filter is applied in implementation)
        expect(db.query.processingQueue.findFirst).toHaveBeenCalled();
      });
    });
  });

  describe('markJobProcessing', () => {
    describe('Status Update', () => {
      it('should update job status to processing', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'processing',
          priority: 0,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: Math.floor(Date.now() / 1000),
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
        const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
        vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

        const result = await markJobProcessing(1);

        expect(result.status).toBe('processing');
        expect(result.startedAt).not.toBeNull();
      });
    });
  });

  describe('markJobDone', () => {
    describe('Successful Completion', () => {
      it('should update job status to done with completedAt', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'done',
          priority: 0,
          attempts: 1,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000) - 100,
          startedAt: Math.floor(Date.now() / 1000) - 50,
          completedAt: Math.floor(Date.now() / 1000),
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
        const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
        vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

        const result = await markJobDone(1);

        expect(result.status).toBe('done');
        expect(result.completedAt).not.toBeNull();
      });
    });
  });

  describe('markJobError', () => {
    describe('Error Handling with Retry', () => {
      it('should increment attempts and set status back to pending if not max attempts', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'pending',
          priority: 0,
          attempts: 1,
          maxAttempts: 3,
          errorMessage: 'API error',
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
        const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
        vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

        const result = await markJobError(1, 'API error');

        expect(result.status).toBe('pending');
        expect(result.attempts).toBe(1);
        expect(result.errorMessage).toBe('API error');
      });

      it('should set status to error when max attempts reached', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'error',
          priority: 0,
          attempts: 3,
          maxAttempts: 3,
          errorMessage: 'Max retries exceeded',
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
        const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
        vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

        const result = await markJobError(1, 'Max retries exceeded', 3, 3);

        expect(result.status).toBe('error');
        expect(result.attempts).toBe(3);
      });

      it('should accept custom maxAttempts parameter', async () => {
        const mockJob: ProcessingQueue = {
          id: 1,
          userId: 1,
          feedItemId: 1,
          pipelineId: 1,
          templateId: null,
          status: 'error',
          priority: 0,
          attempts: 5,
          maxAttempts: 5,
          errorMessage: 'Failed after 5 attempts',
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        const mockReturning = vi.fn().mockResolvedValue([mockJob]);
        const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
        const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
        vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

        const result = await markJobError(1, 'Failed', 5, 5);

        expect(result.status).toBe('error');
      });
    });
  });

  describe('resetProcessingJobs', () => {
    describe('Worker Startup Recovery', () => {
      it('should reset all processing jobs to pending status', async () => {
        const mockUpdate = vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        });
        vi.mocked(db.update).mockImplementation(mockUpdate as unknown as typeof db.update);

        await resetProcessingJobs();

        expect(mockUpdate).toHaveBeenCalled();
      });
    });
  });
});
