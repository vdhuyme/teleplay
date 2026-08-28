import { AppError } from '../errors';
import { HTTP_STATUS_CODE } from '../utils';

export class GroupNotFoundError extends AppError {
  constructor(groupId: number) {
    super(
      GroupNotFoundError.name,
      `Group ${groupId} not found`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}
