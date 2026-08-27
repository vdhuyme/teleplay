import dotenv from "dotenv";
import { isString, isUndefined } from "@teleplay/core";

dotenv.config();

const ENV = process.env;

export const BOT_ENV = {
  TELEGRAM_BOT_TOKEN: "TELEGRAM_BOT_TOKEN",
  API_URL: "API_URL",
};

type BotEnvKey = (typeof BOT_ENV)[keyof typeof BOT_ENV];

export class App {
  private static getEnvValue(key: string): string | undefined {
    return ENV[key];
  }

  public static get(key: BotEnvKey): string | undefined;
  public static get<T>(key: BotEnvKey, defaultValue: T): T;
  public static get<T>(
    key: BotEnvKey,
    defaultValue?: T,
  ): string | T | undefined {
    const value = this.getEnvValue(key);
    if (isUndefined(value)) return defaultValue;
    return value;
  }

  public static getOrThrow(key: BotEnvKey): string {
    const value = this.getEnvValue(key);

    if (isUndefined(value) || !isString(value.trim())) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
  }

  public static isProduction(): boolean {
    return ENV.NODE_ENV === "production";
  }

  public static isDevelopment(): boolean {
    return ENV.NODE_ENV !== "production";
  }
}
