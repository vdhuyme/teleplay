import { HTTP_STATUS_CODE } from '../constants';
import { AppError } from '../errors';

export class GroupNotFoundError extends AppError {
  constructor(groupId: number) {
    super(
      GroupNotFoundError.name,
      `Group ${groupId} not found`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}
