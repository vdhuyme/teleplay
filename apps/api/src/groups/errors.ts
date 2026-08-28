import { HTTP_STATUS } from '../core';
import { AppError } from '../errors';

export class GroupNotFoundError extends AppError {
  constructor(groupId: number) {
    super(
      GroupNotFoundError.name,
      `Group ${groupId} not found`,
      HTTP_STATUS.NOT_FOUND,
    );
  }
}
