import axios from 'axios';

const FALLBACK_MESSAGE = 'Не удалось выполнить действие';

function collectMessages(value: unknown): string[] {
  if (!value) return [];

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectMessages);
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap(collectMessages);
  }

  return [];
}

export function getApiErrorMessage(error: unknown, fallback = FALLBACK_MESSAGE) {
  if (axios.isAxiosError(error)) {
    const messages = collectMessages(error.response?.data);
    return messages.length > 0 ? messages.join(' ') : fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
