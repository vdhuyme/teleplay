import dotenv from "dotenv";
import { isString, isUndefined } from "@teleplay/core";

dotenv.config();

const ENV = process.env;

export const API_ENV_KEYS = {
  DATABASE_URL: "DATABASE_URL",
  YOUTUBE_API_KEY: "YOUTUBE_API_KEY",
  API_PORT: "API_PORT",
} as const;

type ApiEnvKey = (typeof API_ENV_KEYS)[keyof typeof API_ENV_KEYS];

export class App {
  private static getEnvValue(key: string): string | undefined {
    return ENV[key];
  }

  public static get(key: ApiEnvKey): string | undefined;
  public static get<T>(key: ApiEnvKey, defaultValue: T): T;
  public static get<T>(
    key: ApiEnvKey,
    defaultValue?: T,
  ): string | T | undefined {
    const value = this.getEnvValue(key);
    if (isUndefined(value)) return defaultValue;
    return value;
  }

  public static getOrThrow(key: ApiEnvKey): string {
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
