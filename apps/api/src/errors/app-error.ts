import { HTTP_STATUS } from '../core';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = HTTP_STATUS.BAD_REQUEST,
  ) {
    super(message);
    this.name = AppError.name;
  }
}
