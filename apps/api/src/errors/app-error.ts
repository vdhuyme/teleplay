import { HTTP_STATUS_CODE } from '../constants';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = HTTP_STATUS_CODE.BAD_REQUEST,
  ) {
    super(message);
    this.name = AppError.name;
  }
}
