import { mockApi } from '@/services/mock/mockApi';
import type { Api } from '@/services/api.types';

// TODO (مرحله بک‌اند): وقتی VITE_API_URL تنظیم شد، پیاده‌سازی http جایگزین mock می‌شود.
export const api: Api = mockApi;
