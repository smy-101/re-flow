import { assertRawFallbackAllowed } from './authorization';
import { MCP_RAW_FALLBACK_MAX_CHARS, type ArticleCompositeView } from './types';

export { MCP_RAW_FALLBACK_MAX_CHARS } from './types';

export interface CompositeProcessingState {
  status: ArticleCompositeView['processingStatus'];
  errorType: ArticleCompositeView['errorType'];
  retryable: boolean;
  lastAttemptAt: number | null;
}

export interface CompositeFeedItemRecord {
  id: number;
  feedId: number;
  title: string;
  link: string;
  content: string;
  publishedAt: number;
  author: string | null;
}

export interface CompositeProcessingResultRecord {
  id: number;
  status: string;
  output: string | null;
  errorMessage: string | null;
  createdAt: number;
  completedAt: number | null;
}

export interface BuildArticleCompositeViewInput {
  item: CompositeFeedItemRecord;
  feedTitle: string;
  processingResults: CompositeProcessingResultRecord[];
  allowRawFallback: boolean;
}

export function trimRawContent(content: string): string {
  if (content.length <= MCP_RAW_FALLBACK_MAX_CHARS) {
    return content;
  }

  return `${content.slice(0, MCP_RAW_FALLBACK_MAX_CHARS)}...`;
}

export function createIdleProcessingState(): CompositeProcessingState {
  return {
    status: 'not_requested',
    errorType: null,
    retryable: false,
    lastAttemptAt: null,
  };
}

function normalizeProcessingStatus(
  status: string,
): ArticleCompositeView['processingStatus'] {
  switch (status) {
    case 'pending':
    case 'processing':
    case 'done':
    case 'error':
      return status;
    default:
      return 'error';
  }
}

function getAttemptTimestamp(result: CompositeProcessingResultRecord): number {
  return result.completedAt ?? result.createdAt;
}

function classifyErrorType(errorMessage: string | null): ArticleCompositeView['errorType'] {
  if (!errorMessage) {
    return null;
  }

  const normalized = errorMessage.toLowerCase();

  if (
    normalized.includes('timeout')
    || normalized.includes('timed out')
    || normalized.includes('etimedout')
    || normalized.includes('rate limit')
    || normalized.includes('429')
    || normalized.includes('temporar')
  ) {
    return 'transient';
  }

  if (
    normalized.includes('invalid api key')
    || normalized.includes('unsupported state or unable to authenticate data')
    || normalized.includes('not configured')
    || normalized.includes('missing')
    || normalized.includes('forbidden')
    || normalized.includes('unauthorized')
  ) {
    return 'configuration';
  }

  return 'unknown';
}

function isRetryable(result: CompositeProcessingResultRecord): boolean {
  const normalizedStatus = normalizeProcessingStatus(result.status);

  if (normalizedStatus === 'pending' || normalizedStatus === 'processing') {
    return true;
  }

  if (normalizedStatus !== 'error') {
    return false;
  }

  return classifyErrorType(result.errorMessage) !== 'configuration';
}

function pickLatestSuccessfulResult(
  results: CompositeProcessingResultRecord[],
): CompositeProcessingResultRecord | null {
  const successfulResults = results.filter(
    (result) => normalizeProcessingStatus(result.status) === 'done' && typeof result.output === 'string' && result.output.length > 0,
  );

  if (successfulResults.length === 0) {
    return null;
  }

  return successfulResults.sort((left, right) => getAttemptTimestamp(right) - getAttemptTimestamp(left))[0];
}

function pickLatestProcessingResult(
  results: CompositeProcessingResultRecord[],
): CompositeProcessingResultRecord | null {
  if (results.length === 0) {
    return null;
  }

  return [...results].sort((left, right) => getAttemptTimestamp(right) - getAttemptTimestamp(left))[0];
}

function mapProcessingState(
  result: CompositeProcessingResultRecord | null,
): CompositeProcessingState {
  if (!result) {
    return createIdleProcessingState();
  }

  return {
    status: normalizeProcessingStatus(result.status),
    errorType: normalizeProcessingStatus(result.status) === 'error' ? classifyErrorType(result.errorMessage) : null,
    retryable: isRetryable(result),
    lastAttemptAt: getAttemptTimestamp(result),
  };
}

export function buildArticleCompositeView(
  input: BuildArticleCompositeViewInput,
): ArticleCompositeView {
  const latestSuccessfulResult = pickLatestSuccessfulResult(input.processingResults);
  const latestResult = latestSuccessfulResult ?? pickLatestProcessingResult(input.processingResults);
  const processingState = latestSuccessfulResult
    ? mapProcessingState(latestSuccessfulResult)
    : mapProcessingState(latestResult);

  if (latestSuccessfulResult?.output) {
    return {
      itemId: input.item.id,
      feedId: input.item.feedId,
      feedTitle: input.feedTitle,
      title: input.item.title,
      link: input.item.link,
      author: input.item.author,
      publishedAt: input.item.publishedAt,
      sourceType: 'processed',
      content: latestSuccessfulResult.output,
      processingStatus: processingState.status,
      errorType: processingState.errorType,
      retryable: processingState.retryable,
      lastAttemptAt: processingState.lastAttemptAt,
    };
  }

  assertRawFallbackAllowed(input.allowRawFallback);

  return {
    itemId: input.item.id,
    feedId: input.item.feedId,
    feedTitle: input.feedTitle,
    title: input.item.title,
    link: input.item.link,
    author: input.item.author,
    publishedAt: input.item.publishedAt,
    sourceType: 'raw-fallback',
    content: trimRawContent(input.item.content),
    processingStatus: processingState.status,
    errorType: processingState.errorType,
    retryable: processingState.retryable,
    lastAttemptAt: processingState.lastAttemptAt,
  };
}
