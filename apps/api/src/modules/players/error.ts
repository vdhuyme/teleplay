import { AppError } from "../../core/errors/app-error";
import { HTTP_STATUS_CODE } from "../../utils/http-status";

export class PlayerLockError extends AppError {
  constructor(playerId: string) {
    super(
      PlayerLockError.name,
      `Could not acquire lock for player ${playerId}`,
      HTTP_STATUS_CODE.SERVICE_UNAVAILABLE,
    );
  }
}

export class PlayerNotFoundError extends AppError {
  constructor(playerId: string) {
    super(
      PlayerNotFoundError.name,
      `Player ${playerId} not found`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}

export class NoVideoFoundError extends AppError {
  constructor(query: string) {
    super(
      NoVideoFoundError.name,
      `No video found for query: ${query}`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}
