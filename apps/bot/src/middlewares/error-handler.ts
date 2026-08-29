import { BotError, GrammyError, HttpError } from 'grammy';

export function errorHandler({ ctx, error }: BotError): void {
  console.error('Bot error:', { updateId: ctx.update.update_id, error });

  if (error instanceof GrammyError) {
    console.error('Telegram API: ', error.description);
    return;
  }

  if (error instanceof HttpError) {
    console.error('Telegram network: ', error.message);
    return;
  }

  console.error('Unknown error: ', error);
}
