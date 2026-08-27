import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS_CODE } from '../../utils/http-status';

export class GroupNotFoundError extends AppError {
  constructor(groupId: number) {
    super(
      GroupNotFoundError.name,
      `Group ${groupId} not found`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}
