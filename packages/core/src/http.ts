import { App } from './env';

export type QueryValue = string | number | boolean | undefined;

export interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> {
  params?: Record<string, QueryValue>;
  headers?: HeadersInit;
}

export interface HttpClientConfig {
  baseUrl?: string;
  headers?: HeadersInit;
}

export interface HttpClient {
  request<T = unknown>(
    config: RequestConfig & {
      url: string;
      method?: string;
      data?: unknown;
    },
  ): Promise<T>;
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T>;
}

function buildUrl(
  baseUrl: string,
  url: string,
  params?: Record<string, QueryValue>,
): string {
  const full = url.startsWith('http') ? url : `${baseUrl}${url}`;
  if (!params) return full;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `${full}${full.includes('?') ? '&' : '?'}${query}` : full;
}

export function createHttpClient(config: HttpClientConfig = {}): HttpClient {
  const baseUrl = config.baseUrl ?? App.get('API_URL') ?? '';
  const defaultHeaders = config.headers;

  async function request<T>({
    url,
    method = 'GET',
    data,
    params,
    headers,
    ...rest
  }: RequestConfig & {
    url: string;
    method?: string;
    data?: unknown;
  }): Promise<T> {
    const response = await fetch(buildUrl(baseUrl, url, params), {
      ...rest,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
        ...headers,
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      throw new Error(
        error.error?.message || `Request failed: ${response.status}`,
      );
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return {
    request,
    get: (url, config) => request({ ...config, url, method: 'GET' }),
    post: (url, data, config) =>
      request({ ...config, url, method: 'POST', data }),
    put: (url, data, config) =>
      request({ ...config, url, method: 'PUT', data }),
    patch: (url, data, config) =>
      request({ ...config, url, method: 'PATCH', data }),
    delete: (url, config) => request({ ...config, url, method: 'DELETE' }),
  };
}
