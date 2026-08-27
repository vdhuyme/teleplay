export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
