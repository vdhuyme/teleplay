export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export interface HttpResponse<T = unknown> {
  status: HttpStatus;
  data?: T;
  message?: string;
  timestamp?: string;
}

export function ok<T>(data: T): HttpResponse<T> {
  return {
    status: HTTP_STATUS.OK,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function created<T>(data: T): HttpResponse<T> {
  return {
    status: HTTP_STATUS.CREATED,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function noContent(): HttpResponse {
  return {
    status: HTTP_STATUS.NO_CONTENT,
    timestamp: new Date().toISOString(),
  };
}

export function badRequest(message = 'Bad request'): HttpResponse {
  return {
    status: HTTP_STATUS.BAD_REQUEST,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function unauthorized(message = 'Unauthorized'): HttpResponse {
  return {
    status: HTTP_STATUS.UNAUTHORIZED,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function forbidden(message = 'Forbidden'): HttpResponse {
  return {
    status: HTTP_STATUS.FORBIDDEN,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function notFound(message = 'Not found'): HttpResponse {
  return {
    status: HTTP_STATUS.NOT_FOUND,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function conflict(message = 'Conflict'): HttpResponse {
  return {
    status: HTTP_STATUS.CONFLICT,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function unprocessableEntity(
  message = 'Unprocessable entity',
): HttpResponse {
  return {
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function internalServerError(
  message = 'Internal server error',
): HttpResponse {
  return {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message,
    timestamp: new Date().toISOString(),
  };
}
