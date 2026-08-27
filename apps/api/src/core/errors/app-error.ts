import { HTTP_STATUS_CODE } from '../../utils/http-status';

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

export class PlayerNotFoundError extends AppError {
  constructor(playerId: string) {
    super(
      PlayerNotFoundError.name,
      `Player ${playerId} not found`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}

export class QueueEmptyError extends AppError {
  constructor() {
    super(
      QueueEmptyError.name,
      'The queue is empty',
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}

export class VideoNotFoundError extends AppError {
  constructor() {
    super(
      VideoNotFoundError.name,
      'No video found for the query',
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }
}

export class YoutubeApiError extends AppError {
  constructor(message: string) {
    super(YoutubeApiError.name, message, HTTP_STATUS_CODE.BAD_GATEWAY);
  }
}

export class InvalidVolumeError extends AppError {
  constructor() {
    super(
      InvalidVolumeError.name,
      'Volume must be between 0 and 100',
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }
}

export class InvalidCommandError extends AppError {
  constructor(message: string) {
    super(InvalidCommandError.name, message, HTTP_STATUS_CODE.BAD_REQUEST);
  }
}
